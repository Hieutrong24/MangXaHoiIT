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

  const filteredPosts = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((post) => {
      const title = String(post?.title || "").toLowerCase();
      const content = String(post?.content || "").toLowerCase();
      const tags = Array.isArray(post?.tags)
        ? post.tags.map((t) => String(t).toLowerCase())
        : [];

      return (
        title.includes(q) ||
        content.includes(q) ||
        tags.some((t) => t.includes(q))
      );
    });
  }, [posts, keyword]);

  return (
    <div className="grid gap-4">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-300" />
            <div className="text-xl font-extrabold tracking-tight text-white">
              Bài viết
            </div>
          </div>

          <div className="text-sm text-slate-400">
            Tổng: <span className="text-slate-200 font-semibold">{meta.total}</span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <div className="flex-1">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm bài viết theo tiêu đề / nội dung / tag..."
            />
          </div>

          <Button onClick={fetchPosts} variant="ghost">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </GlassCard>

      {loading ? (
        <GlassCard className="p-5">
          <div className="text-sm text-slate-300">Đang tải danh sách bài viết...</div>
        </GlassCard>
      ) : err ? (
        <GlassCard className="p-5">
          <div className="text-sm text-red-300">{err}</div>
        </GlassCard>
      ) : filteredPosts.length === 0 ? (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-slate-300">
            <Search className="h-4 w-4" />
            Không có bài viết phù hợp.
          </div>
        </GlassCard>
      ) : (
        filteredPosts.map((post) => {
          const tags = Array.isArray(post?.tags) ? post.tags : [];
          const summary = mediaSummary(post?.media);
          const firstImage = Array.isArray(post?.media)
            ? post.media.find(
                (m) => String(m?.resourceType).toLowerCase() === "image" && (m?.secureUrl || m?.url)
              )
            : null;

          const likeCount = Array.isArray(post?.likes)
            ? post.likes.length
            : Number(post?.likeCount ?? 0);

          const commentCount = Number(post?.commentCount ?? 0);

          return (
            <GlassCard key={post?._id || Math.random()} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-400">
                    @{post?.authorId || "unknown"} • {formatTime(post?.createdAt)}
                  </div>

                  <Link
                    to={`/posts/${encodeURIComponent(post?._id || "")}`}
                    className="mt-2 block text-lg font-bold text-white hover:text-cyan-300 transition break-words"
                  >
                    {post?.title || "Không có tiêu đề"}
                  </Link>

                  <div className="mt-2 text-sm text-slate-300 whitespace-pre-wrap break-words line-clamp-4">
                    {post?.content || ""}
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.slice(0, 8).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-200/90"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
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

                {firstImage?.secureUrl || firstImage?.url ? (
                  <Link
                    to={`/posts/${encodeURIComponent(post?._id || "")}`}
                    className="hidden sm:block shrink-0"
                  >
                    <img
                      src={firstImage.secureUrl || firstImage.url}
                      alt={post?.title || "thumbnail"}
                      className="h-24 w-32 rounded-xl object-cover border border-white/10"
                      loading="lazy"
                    />
                  </Link>
                ) : null}
              </div>
            </GlassCard>
          );
        })
      )}
    </div>
  );
}