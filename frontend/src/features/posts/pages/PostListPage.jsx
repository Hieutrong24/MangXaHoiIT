import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Video as VideoIcon,
  Paperclip,
  MessageCircle,
  Heart,
  Grid3X3,
  Rows3,
  Tags,
  SlidersHorizontal,
} from "lucide-react";

import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { postsApi } from "../api/posts.api";

function unwrapList(res) {
  if (!res) return { items: [], total: 0, page: 1, pageSize: 20 };
  return res?.data ?? res;
}

function formatTime(t) {
  try {
    if (!t) return "";
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return String(t);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

function mediaSummary(media) {
  const list = Array.isArray(media) ? media : [];
  let images = 0;
  let videos = 0;
  let files = 0;

  for (const item of list) {
    const type = String(item?.resourceType || "").toLowerCase();
    if (type === "image") images += 1;
    else if (type === "video") videos += 1;
    else files += 1;
  }

  return { images, videos, files };
}

function getAllTags(posts) {
  const set = new Set();
  posts.forEach((post) => {
    if (Array.isArray(post?.tags)) {
      post.tags.forEach((tag) => {
        const value = String(tag || "").trim();
        if (value) set.add(value);
      });
    }
  });
  return Array.from(set).slice(0, 12);
}

function getFirstImage(media) {
  return Array.isArray(media)
    ? media.find(
        (m) =>
          String(m?.resourceType).toLowerCase() === "image" &&
          (m?.secureUrl || m?.url)
      )
    : null;
}

function getLikeCount(post) {
  return Array.isArray(post?.likes)
    ? post.likes.length
    : Number(post?.likeCount ?? 0);
}

function getCommentCount(post) {
  return Number(post?.commentCount ?? 0);
}

function matchesMediaFilter(post, mediaFilter) {
  if (mediaFilter === "all") return true;
  const summary = mediaSummary(post?.media);
  if (mediaFilter === "image") return summary.images > 0;
  if (mediaFilter === "video") return summary.videos > 0;
  if (mediaFilter === "file") return summary.files > 0;
  if (mediaFilter === "plain") {
    return summary.images === 0 && summary.videos === 0 && summary.files === 0;
  }
  return true;
}

export default function PostListPage() {
  const [keyword, setKeyword] = useState("");
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await postsApi.list({
        page: 1,
        pageSize: 20,
      });

      const data = unwrapList(res);

      setPosts(Array.isArray(data?.items) ? data.items : []);
      setMeta({
        total: Number(data?.total ?? 0),
        page: Number(data?.page ?? 1),
        pageSize: Number(data?.pageSize ?? 20),
      });
    } catch (e) {
      console.error("[PostListPage] load error:", e);
      setErr(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Không tải được danh sách bài viết."
      );
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const availableTags = useMemo(() => getAllTags(posts), [posts]);

  const filteredPosts = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    let list = posts.filter((post) => {
      const title = String(post?.title || "").toLowerCase();
      const content = String(post?.content || "").toLowerCase();
      const tags = Array.isArray(post?.tags)
        ? post.tags.map((t) => String(t).toLowerCase())
        : [];

      const matchesKeyword =
        !q ||
        title.includes(q) ||
        content.includes(q) ||
        tags.some((t) => t.includes(q));

      const matchesTag =
        selectedTag === "all" ||
        tags.includes(String(selectedTag).toLowerCase());

      return matchesKeyword && matchesTag && matchesMediaFilter(post, mediaFilter);
    });

    list.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
      }
      if (sortBy === "likes") {
        return getLikeCount(b) - getLikeCount(a);
      }
      if (sortBy === "comments") {
        return getCommentCount(b) - getCommentCount(a);
      }
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });

    return list;
  }, [posts, keyword, selectedTag, mediaFilter, sortBy]);

  return (
    <div className="space-y-5">
      <GlassCard className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a]/90 p-0 shadow-[0_20px_50px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white">
                  Bài viết
                </div>
                <div className="text-sm text-slate-400">
                  Duyệt bài viết theo bộ lọc ngang và hiển thị dạng lưới.
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-400">
              Hiển thị {filteredPosts.length} / {meta.total} bài viết
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max items-center gap-3 rounded-[24px] border border-white/10 bg-slate-950/40 p-3">
                <div className="relative min-w-[320px] flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm bài viết theo tiêu đề, nội dung hoặc tag..."
                    className="h-12 rounded-2xl border-white/10 bg-slate-950/70 pl-11"
                  />
                </div>

                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="h-12 min-w-[180px] rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-200 outline-none transition focus:border-cyan-400/30"
                >
                  <option value="all">Tất cả tag</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>

                <select
                  value={mediaFilter}
                  onChange={(e) => setMediaFilter(e.target.value)}
                  className="h-12 min-w-[190px] rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-200 outline-none transition focus:border-cyan-400/30"
                >
                  <option value="all">Tất cả loại bài</option>
                  <option value="plain">Chỉ văn bản</option>
                  <option value="image">Có hình ảnh</option>
                  <option value="video">Có video</option>
                  <option value="file">Có tệp đính kèm</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-12 min-w-[180px] rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-200 outline-none"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="likes">Nhiều lượt thích</option>
                  <option value="comments">Nhiều bình luận</option>
                </select>

                <Button
                  onClick={fetchPosts}
                  variant="ghost"
                  className="h-12 min-w-[140px] rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Làm mới
                </Button>

                <div className="inline-flex items-center rounded-2xl border border-white/10 bg-slate-950/70 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "rounded-xl bg-cyan-400/10 px-3 py-2 text-cyan-200"
                        : "rounded-xl px-3 py-2 text-slate-400"
                    }
                    aria-label="Dạng lưới"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "rounded-xl bg-cyan-400/10 px-3 py-2 text-cyan-200"
                        : "rounded-xl px-3 py-2 text-slate-400"
                    }
                    aria-label="Dạng danh sách"
                  >
                    <Rows3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                Bộ lọc nhanh
              </div>

              {availableTags.slice(0, 8).map((tag) => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(active ? "all" : tag)}
                    className={
                      active
                        ? "rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-200"
                        : "rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06]"
                    }
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Tags className="h-3.5 w-3.5" />
                      #{tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <GlassCard className="rounded-[24px] p-5">
          <div className="text-sm text-slate-300">Đang tải danh sách bài viết...</div>
        </GlassCard>
      ) : err ? (
        <GlassCard className="rounded-[24px] p-5">
          <div className="text-sm text-red-300">{err}</div>
        </GlassCard>
      ) : filteredPosts.length === 0 ? (
        <GlassCard className="rounded-[24px] p-5">
          <div className="flex items-center gap-2 text-slate-300">
            <Search className="h-4 w-4" />
            Không có bài viết phù hợp.
          </div>
        </GlassCard>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "grid grid-cols-1 gap-4"
          }
        >
          {filteredPosts.map((post) => {
            const tags = Array.isArray(post?.tags) ? post.tags : [];
            const summary = mediaSummary(post?.media);
            const firstImage = getFirstImage(post?.media);
            const likeCount = getLikeCount(post);
            const commentCount = getCommentCount(post);

            return (
              <GlassCard
                key={post?._id || `${post?.title}-${post?.createdAt}`}
                className={
                  viewMode === "grid"
                    ? "group h-full rounded-[24px] border border-white/10 bg-[#111827]/85 p-0 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
                    : "group rounded-[24px] border border-white/10 bg-[#111827]/85 p-0 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
                }
              >
                <div className={viewMode === "grid" ? "flex h-full flex-col" : "grid gap-0 md:grid-cols-[280px_minmax(0,1fr)]"}>
                  <Link
                    to={`/posts/${encodeURIComponent(post?._id || "")}`}
                    className={
                      viewMode === "grid"
                        ? "block"
                        : "order-2 block md:order-1"
                    }
                  >
                    <div className={viewMode === "grid" ? "relative h-44 overflow-hidden rounded-t-[24px] border-b border-white/10 bg-slate-950/50" : "relative h-full min-h-[220px] overflow-hidden rounded-t-[24px] border-b border-white/10 bg-slate-950/50 md:rounded-l-[24px] md:rounded-tr-none md:border-b-0 md:border-r"}>
                      {firstImage?.secureUrl || firstImage?.url ? (
                        <img
                          src={firstImage.secureUrl || firstImage.url}
                          alt={post?.title || "thumbnail"}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_35%)]">
                          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                            Không có ảnh xem trước
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className={viewMode === "grid" ? "flex flex-1 flex-col p-5" : "order-1 flex flex-col p-5 md:order-2 md:p-6"}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-400">
                        @{post?.authorId || "unknown"}
                      </div>
                      <div className="text-xs text-slate-500">{formatTime(post?.createdAt)}</div>
                    </div>

                    <Link
                      to={`/posts/${encodeURIComponent(post?._id || "")}`}
                      className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-white transition hover:text-cyan-300"
                    >
                      {post?.title || "Không có tiêu đề"}
                    </Link>

                    <div className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300 whitespace-pre-wrap break-words">
                      {post?.content || ""}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.length > 0 ? (
                        tags.slice(0, 6).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-cyan-200/90"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-500">
                          Không có tag
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-5">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <div className="inline-flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {likeCount}
                        </div>

                        <div className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {commentCount}
                        </div>

                        {summary.images > 0 && (
                          <div className="inline-flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {summary.images}
                          </div>
                        )}

                        {summary.videos > 0 && (
                          <div className="inline-flex items-center gap-1">
                            <VideoIcon className="h-3.5 w-3.5" />
                            {summary.videos}
                          </div>
                        )}

                        {summary.files > 0 && (
                          <div className="inline-flex items-center gap-1">
                            <Paperclip className="h-3.5 w-3.5" />
                            {summary.files}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
