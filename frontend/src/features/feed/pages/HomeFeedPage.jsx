import { useEffect, useMemo, useState, useCallback } from "react";

import GlassCard from "../../../shared/components/GlassCard";

import { feedApi } from "../api/feed.api";
import { externalApi } from "../api/external.api";

import PostCard from "../components/PostCard";
import JobCard from "../components/JobCard";

import FeedHeroHeader from "../components/FeedHeroHeader";
import FeedComposer from "../components/FeedComposer";
import FeedFilterBar from "../components/FeedFilterBar";
import FeedToolbar from "../components/FeedToolbar";

import RightSidebar from "../components/RightSidebar";
import MobileBottomNav from "../components/MobileBottomNav";

import CommentModal from "../modals/CommentModal";
import ShareModal from "../modals/ShareModal";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function normalizePosts(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.data?.items && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

function normalizeJobs(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.data?.items && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

function safeId(p, idx) {
  return p?._id || p?.id || `${idx}`;
}

function safeJobId(j, idx) {
  return j?.id || j?._id || j?.url || `${idx}`;
}

function pickTitle(p) {
  return p?.title || (p?.content ? String(p.content).slice(0, 80) : "Bài viết");
}

function pickExcerpt(p) {
  return p?.excerpt || (p?.content ? String(p.content).slice(0, 160) : "");
}

function createRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleStable(items, seed) {
  const arr = [...items];
  const rng = createRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function HomeFeedPage() {
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [activeFilter, setActiveFilter] = useState("Mới nhất");
  const [query, setQuery] = useState("");

  const [commentPost, setCommentPost] = useState(null);
  const [sharePost, setSharePost] = useState(null);

  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await feedApi.getFeed();
      const list = normalizePosts(payload);
      setPosts(list);
    } catch (e) {
      console.error("Load feed error:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const payload = await feedApi.getFeed();
        const list = normalizePosts(payload);
        if (alive) setPosts(list);
      } catch (e) {
        console.error("Load feed error:", e);
        if (alive) setPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const payload = await externalApi.itJobs({ limit: 100, q: "software" });
      const list = normalizeJobs(payload);
      setJobs(list);
      setShuffleSeed(Date.now());
    } catch (e) {
      console.error("Load jobs error:", e);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (activeFilter === "Trending") {
      list = list.filter((p) => p.trending || p.hot || (p.likeCount ?? 0) > 10);
    }

    const tagMap = new Set(["DSA", "SQL", "React"]);
    if (tagMap.has(activeFilter)) {
      list = list.filter((p) => {
        const tags = Array.isArray(p?.tags) ? p.tags.map((x) => String(x).toLowerCase()) : [];
        const singleTag = String(p?.tag || "").toLowerCase();
        return tags.includes(activeFilter.toLowerCase()) || singleTag === activeFilter.toLowerCase();
      });
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => {
        const t = pickTitle(p).toLowerCase();
        const e = pickExcerpt(p).toLowerCase();
        const g = Array.isArray(p?.tags)
          ? p.tags.join(" ").toLowerCase()
          : String(p?.tag || "").toLowerCase();

        return t.includes(q) || e.includes(q) || g.includes(q);
      });
    }

    return list;
  }, [posts, activeFilter, query]);

  const mixedFeed = useMemo(() => {
    const postItems = filteredPosts.map((p) => ({ type: "post", data: p }));
    const jobItems = (jobs || []).map((j) => ({ type: "job", data: j }));

    const all = [...postItems, ...jobItems];
    return shuffleStable(all, shuffleSeed);
  }, [filteredPosts, jobs, shuffleSeed]);

  const handleToggleLike = async (post) => {
    const postId = post?._id || post?.id;
    if (!postId) return null;

    try {
      const result = await feedApi.toggleLike(postId);

      setPosts((prev) =>
        prev.map((item) => {
          const itemId = item?._id || item?.id;
          if (itemId !== postId) return item;

          if (result?.post) {
            return {
              ...item,
              ...result.post,
              liked: !!result.liked,
              likeCount:
                typeof result.likeCount === "number"
                  ? result.likeCount
                  : result.post.likeCount,
            };
          }

          const currentLiked = !!item?.liked;
          const nextLiked = !currentLiked;
          const currentCount =
            typeof item?.likeCount === "number"
              ? item.likeCount
              : Array.isArray(item?.likes)
              ? item.likes.length
              : 0;

          return {
            ...item,
            liked: nextLiked,
            likeCount: nextLiked
              ? currentCount + 1
              : Math.max(0, currentCount - 1),
          };
        })
      );

      return result;
    } catch (error) {
      console.error("Toggle like error:", error);
      throw error;
    }
  };

  const handleCommentCreated = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((item) => {
        const itemId = item?._id || item?.id;
        if (itemId !== postId) return item;

        return {
          ...item,
          commentCount: Number(item?.commentCount || 0) + 1,
        };
      })
    );
  }, []);

  return (
    <div
      className={cx(
        "min-h-screen",
        "bg-[#0b0f19]",
        "bg-[radial-gradient(900px_circle_at_10%_10%,rgba(34,211,238,0.10),transparent_45%),radial-gradient(900px_circle_at_90%_20%,rgba(168,85,247,0.10),transparent_48%),radial-gradient(900px_circle_at_50%_90%,rgba(236,72,153,0.08),transparent_50%)]"
      )}
    >
      <div className="w-full px-4 md:px-6 lg:px-8 pt-6 pb-24 md:pb-10">
        <FeedHeroHeader />

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <GlassCard className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl">
              <div className="mt-3">
                <FeedFilterBar
                  active={activeFilter}
                  onChange={(v) => {
                    setActiveFilter(v);
                    setShuffleSeed((s) => s + 1);
                  }}
                />
              </div>
            </GlassCard>

            <FeedComposer />

            {loading && (
              <div className="text-center text-slate-400 py-6">Đang tải feed…</div>
            )}

            {!loading && mixedFeed.length === 0 && (
              <div className="text-center text-slate-400 py-6">
                Không có bài viết phù hợp.
              </div>
            )}

            <div className="space-y-4">
              {mixedFeed.map((it, idx) =>
                it.type === "post" ? (
                  <PostCard
                    key={`p-${safeId(it.data, idx)}`}
                    post={it.data}
                    index={idx}
                    onOpenComments={(post) => setCommentPost(post)}
                    onOpenShare={(post) => setSharePost(post)}
                    onToggleLike={handleToggleLike}
                  />
                ) : (
                  <JobCard
                    key={`j-${safeJobId(it.data, idx)}`}
                    job={it.data}
                    index={idx}
                  />
                )
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <RightSidebar
              posts={posts}
              onRefreshJobs={loadJobs}
              jobsLoading={jobsLoading}
            />
          </div>
        </div>
      </div>

      <MobileBottomNav />

      <CommentModal
        open={!!commentPost}
        post={commentPost}
        onClose={() => setCommentPost(null)}
        onCommentCreated={handleCommentCreated}
      />

      <ShareModal
        open={!!sharePost}
        post={sharePost}
        onClose={() => setSharePost(null)}
      />
    </div>
  );
}