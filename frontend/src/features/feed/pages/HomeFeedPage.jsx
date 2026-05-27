import { useCallback, useEffect, useMemo, useState } from "react";

import { http } from "../../../services/http";
import GlassCard from "../../../shared/components/GlassCard";

import { feedApi } from "../api/feed.api";

import PostCard from "../components/PostCard";
import FeedComposer from "../components/FeedComposer";
import FeedFilterBar from "../components/FeedFilterBar";
import RightSidebar from "../components/RightSidebar";
import MobileBottomNav from "../components/MobileBottomNav";

import CommentModal from "../modals/CommentModal";
import ShareModal from "../modals/ShareModal";

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
  const [usersMap, setUsersMap] = useState(new Map());

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Mới nhất");
  const [query, setQuery] = useState("");

  const [commentPost, setCommentPost] = useState(null);
  const [sharePost, setSharePost] = useState(null);

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

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (activeFilter === "Trending") {
      list = list.filter(
        (p) => p?.trending || p?.hot || Number(p?.likeCount || 0) > 10
      );
    }

    if (activeFilter === "Theo dõi") {
      list = list.filter((p) => p?.following === true);
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

  return (
    <div className={cx("min-h-screen overflow-x-clip text-slate-100")}>
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.08]" />

      <div className="relative w-full pb-24 lg:pb-10">
        <div className="mx-auto w-full max-w-[1520px]">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
              <main className="min-w-0 space-y-4 sm:space-y-5">
                <GlassCard className="rounded-[26px] border border-white/10 bg-[#111827]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-5">
                  <FeedFilterBar
                    active={activeFilter}
                    onChange={setActiveFilter}
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

                {!loading && filteredPosts.length === 0 && (
                  <GlassCard className="rounded-[26px] border border-dashed border-white/10 bg-[#111827]/70 px-5 py-12 text-center backdrop-blur-2xl">
                    <div className="text-lg font-medium text-slate-200">
                      Không có bài viết phù hợp.
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      Hãy thử đổi filter hoặc từ khoá tìm kiếm.
                    </div>
                  </GlassCard>
                )}

                {!loading && filteredPosts.length > 0 && (
                  <div className="space-y-4 sm:space-y-5">
                    {filteredPosts.map((post, idx) => (
                      <PostCard
                        key={`post-${getPostId(post) || idx}`}
                        post={post}
                        index={idx}
                        onToggleLike={handleToggleLike}
                        onOpenComments={(selectedPost) =>
                          setCommentPost(selectedPost)
                        }
                        onOpenShare={(selectedPost) => setSharePost(selectedPost)}
                      />
                    ))}
                  </div>
                )}
              </main>

              <aside className="hidden min-w-0 xl:block">
                <RightSidebar posts={posts} />
              </aside>
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
