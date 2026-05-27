import { useCallback, useEffect, useMemo, useState } from "react";

import { http } from "../../../services/http";
import GlassCard from "../../../shared/components/GlassCard";

import { feedApi } from "../api/feed.api";
import { externalApi } from "../api/external.api";

import PostCard from "../components/PostCard";
import JobCard from "../components/JobCard";
import FeedHeroHeader from "../components/FeedHeroHeader";
import FeedComposer from "../components/FeedComposer";
import FeedFilterBar from "../components/FeedFilterBar";
import RightSidebar from "../components/RightSidebar";
import MobileBottomNav from "../components/MobileBottomNav";

import CommentModal from "../modals/CommentModal";
import ShareModal from "../modals/ShareModal";

const SIDEBAR_PIN_KEY = "ui.feed.sidebar.pinned";

function cx(...classes) {
  return classes.flat().filter(Boolean).join(" ");
}

function safeReadUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.posts)) return payload.posts;
  if (Array.isArray(payload?.data?.posts)) return payload.data.posts;
  return [];
}

function normalizeJobs(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function getCurrentUserId() {
  const storedUser = safeReadUser();

  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("uid") ||
    localStorage.getItem("currentUserId") ||
    storedUser?.userId ||
    storedUser?.id ||
    storedUser?._id ||
    ""
  );
}

function getPostId(post) {
  return post?._id || post?.id || "";
}

function getUserKey(user) {
  return (
    user?.userId ||
    user?.id ||
    user?._id ||
    user?.UserId ||
    user?.Id ||
    ""
  );
}

function buildAuthorObject(user, authorId) {
  if (!user) return null;

  return {
    id: getUserKey(user) || authorId,
    username:
      user?.username ||
      user?.userName ||
      user?.Username ||
      user?.studentCode ||
      user?.StudentCode ||
      null,
    fullName:
      user?.fullName ||
      user?.displayName ||
      user?.name ||
      user?.Name ||
      null,
    avatarUrl:
      user?.avatarUrl ||
      user?.avatar ||
      user?.profilePicture ||
      user?.photoUrl ||
      "",
    email: user?.email || user?.Email || "",
  };
}

function deriveLiked(post) {
  const currentUserId = getCurrentUserId();
  const likes = Array.isArray(post?.likes) ? post.likes.map(String) : [];
  return currentUserId ? likes.includes(String(currentUserId)) : false;
}

function deriveLikeCount(post) {
  if (typeof post?.likeCount === "number") return post.likeCount;
  if (Array.isArray(post?.likes)) return post.likes.length;
  return 0;
}

function enrichPostsWithUsers(posts, usersMap) {
  return posts.map((post) => {
    const authorId = String(post?.authorId || post?.author || "");
    const rawUser = usersMap.get(authorId) || null;

    return {
      ...post,
      author:
        post?.author && typeof post.author === "object"
          ? post.author
          : buildAuthorObject(rawUser, authorId),
      liked: typeof post?.liked === "boolean" ? post.liked : deriveLiked(post),
      likeCount: deriveLikeCount(post),
    };
  });
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

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

async function fetchUsersMap() {
  const res = await http.get("/users", {
    params: { page: 1, pageSize: 500 },
  });

  const users = normalizeList(res.data);
  const map = new Map();

  users.forEach((user) => {
    const key = String(getUserKey(user) || "");
    if (key) map.set(key, user);
  });

  return map;
}

export default function HomeFeedPage() {
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [usersMap, setUsersMap] = useState(new Map());

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [activeFilter, setActiveFilter] = useState("Mới nhất");
  const [query, setQuery] = useState("");

  const [commentPost, setCommentPost] = useState(null);
  const [sharePost, setSharePost] = useState(null);

  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());

  const [desktopPinned] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_PIN_KEY);
    return saved === "true";
  });

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);

      const [feedPayload, userMap] = await Promise.all([
        feedApi.getFeed(),
        fetchUsersMap(),
      ]);

      const rawPosts = normalizeList(feedPayload);
      const enrichedPosts = enrichPostsWithUsers(rawPosts, userMap);

      setUsersMap(userMap);
      setPosts(enrichedPosts);
    } catch (error) {
      console.error("Load feed error:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      setJobsLoading(true);

      const jobsPayload = await externalApi.itJobs({
        limit: 100,
        q: "software",
      });

      setJobs(normalizeJobs(jobsPayload));
      setShuffleSeed(Date.now());
    } catch (error) {
      console.error("Load jobs error:", error);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (activeFilter === "Trending") {
      list = list.filter(
        (p) => p?.trending || p?.hot || Number(p?.likeCount || 0) > 10
      );
    }

    const tagSet = new Set(["DSA", "SQL", "React"]);

    if (tagSet.has(activeFilter)) {
      list = list.filter((p) => {
        const tags = Array.isArray(p?.tags)
          ? p.tags.map((x) => String(x).toLowerCase())
          : [];
        const singleTag = String(p?.tag || "").toLowerCase();

        return (
          tags.includes(activeFilter.toLowerCase()) ||
          singleTag === activeFilter.toLowerCase()
        );
      });
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();

      list = list.filter((p) => {
        const title = String(p?.title || "").toLowerCase();
        const content = String(p?.content || "").toLowerCase();
        const username = String(
          p?.author?.username || p?.author?.fullName || p?.authorId || ""
        ).toLowerCase();
        const tags = Array.isArray(p?.tags)
          ? p.tags.join(" ").toLowerCase()
          : String(p?.tag || "").toLowerCase();

        return (
          title.includes(q) ||
          content.includes(q) ||
          username.includes(q) ||
          tags.includes(q)
        );
      });
    }

    return list;
  }, [posts, activeFilter, query]);

  const mixedFeed = useMemo(() => {
    const postItems = filteredPosts.map((post) => ({
      type: "post",
      data: post,
    }));

    const jobItems = jobs.map((job) => ({
      type: "job",
      data: job,
    }));

    return shuffleStable([...postItems, ...jobItems], shuffleSeed);
  }, [filteredPosts, jobs, shuffleSeed]);

  const handleToggleLike = async (post) => {
    const postId = getPostId(post);
    if (!postId) return null;

    try {
      const result = await feedApi.toggleLike(postId);

      setPosts((prev) =>
        prev.map((item) => {
          if (getPostId(item) !== postId) return item;

          if (result?.post) {
            const merged = {
              ...item,
              ...result.post,
            };

            const authorId = String(merged?.authorId || merged?.author || "");
            const rawUser = usersMap.get(authorId) || null;

            return {
              ...merged,
              author:
                merged?.author && typeof merged.author === "object"
                  ? merged.author
                  : buildAuthorObject(rawUser, authorId),
              liked:
                typeof result?.liked === "boolean"
                  ? result.liked
                  : deriveLiked(merged),
              likeCount:
                typeof result?.likeCount === "number"
                  ? result.likeCount
                  : deriveLikeCount(merged),
            };
          }

          const currentLiked = !!item?.liked;
          const currentUserId = getCurrentUserId();
          const currentLikes = Array.isArray(item?.likes)
            ? item.likes.map(String)
            : [];

          const nextLiked = !currentLiked;
          const nextLikes = currentUserId
            ? nextLiked
              ? Array.from(new Set([...currentLikes, String(currentUserId)]))
              : currentLikes.filter((x) => x !== String(currentUserId))
            : currentLikes;

          return {
            ...item,
            liked: nextLiked,
            likes: nextLikes,
            likeCount: nextLikes.length,
          };
        })
      );

      return result;
    } catch (error) {
      console.error("Toggle like error:", error);
      console.error("Toggle like response data:", error?.response?.data);
      throw error;
    }
  };

  const handleCommentCreated = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((item) => {
        if (getPostId(item) !== postId) return item;

        return {
          ...item,
          commentCount: Number(item?.commentCount || 0) + 1,
        };
      })
    );
  }, []);

  const mainOffsetClass = desktopPinned ? "lg:pl-[248px]" : "lg:pl-[84px]";

  return (
    <div
      className={cx(
        "min-h-screen overflow-x-hidden bg-[#020617] text-slate-100",
        "bg-[radial-gradient(900px_circle_at_0%_0%,rgba(59,130,246,0.14),transparent_36%),radial-gradient(900px_circle_at_100%_0%,rgba(168,85,247,0.12),transparent_34%),radial-gradient(1000px_circle_at_50%_100%,rgba(14,165,233,0.10),transparent_38%)]"
      )}
    >
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.08]" />

      <div
        className={cx(
          "relative min-h-screen transition-[padding] duration-300",
          mainOffsetClass
        )}
      >
        <div className="relative w-full px-2 pb-24 pt-4 sm:px-3 sm:pt-5 lg:px-4 lg:pb-10 lg:pt-5 2xl:px-5">
          <div className="mx-auto w-full max-w-[1820px]">
            <FeedHeroHeader />

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.42fr)_320px] 2xl:grid-cols-[minmax(0,1.52fr)_340px]">
              <main className="min-w-0 space-y-4 sm:space-y-5">
                <GlassCard className="rounded-[26px] border border-white/10 bg-[#111827]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-5">
                  <FeedFilterBar
                    active={activeFilter}
                    onChange={(value) => {
                      setActiveFilter(value);
                      setShuffleSeed((s) => s + 1);
                    }}
                    query={query}
                    onQueryChange={setQuery}
                  />
                </GlassCard>

                <FeedComposer onCreated={loadFeed} />

                {loading && (
                  <GlassCard className="rounded-[26px] border border-white/10 bg-[#111827]/80 px-5 py-10 text-center text-slate-400 backdrop-blur-2xl">
                    Đang tải feed…
                  </GlassCard>
                )}

                {!loading && mixedFeed.length === 0 && (
                  <GlassCard className="rounded-[26px] border border-dashed border-white/10 bg-[#111827]/70 px-5 py-12 text-center backdrop-blur-2xl">
                    <div className="text-lg font-medium text-slate-200">
                      Không có bài viết phù hợp.
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      Hãy thử đổi filter hoặc từ khoá tìm kiếm.
                    </div>
                  </GlassCard>
                )}

                <div className="space-y-4 sm:space-y-5">
                  {mixedFeed.map((item, idx) =>
                    item.type === "post" ? (
                      <PostCard
                        key={`post-${getPostId(item.data) || idx}`}
                        post={item.data}
                        index={idx}
                        onToggleLike={handleToggleLike}
                        onOpenComments={(selectedPost) =>
                          setCommentPost(selectedPost)
                        }
                        onOpenShare={(selectedPost) =>
                          setSharePost(selectedPost)
                        }
                      />
                    ) : (
                      <JobCard
                        key={`job-${item.data?.id || item.data?._id || idx}`}
                        job={item.data}
                        index={idx}
                      />
                    )
                  )}
                </div>
              </main>

              <aside className="hidden min-w-0 xl:block">
                <div className="sticky top-5">
                  <RightSidebar
                    posts={posts}
                    onRefreshJobs={loadJobs}
                    jobsLoading={jobsLoading}
                  />
                </div>
              </aside>
            </div>
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