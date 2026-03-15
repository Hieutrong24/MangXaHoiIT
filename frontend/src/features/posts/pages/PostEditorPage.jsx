import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import PostEditor from "../components/PostEditor";
import ITNewsPanel from "../components/ITNewsPanel";
import { postsApi } from "../api/posts.api";
import { uploadApi } from "../../uploads/api/upload.api";

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return [...new Set(tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))];
  }

  if (typeof tags === "string") {
    return [
      ...new Set(
        tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
  }

  return [];
}

function unwrap(res) {
  return res?.data ?? res;
}

function mapUploadToMedia(uploaded, fallbackAttachment) {
  if (!uploaded) return null;

  const resourceType = String(
    uploaded.resourceType || uploaded.resource_type || "raw"
  ).toLowerCase();

  const url = uploaded.url || uploaded.secureUrl || uploaded.secure_url || "";
  const secureUrl = uploaded.secureUrl || uploaded.secure_url || uploaded.url || "";

  if (!url || !secureUrl) return null;

  return {
    url,
    secureUrl,
    publicId: uploaded.publicId || uploaded.public_id || "",
    resourceType,
    format: uploaded.format || "",
    bytes: Number(uploaded.bytes || fallbackAttachment?.size || 0),
    originalName:
      uploaded.originalName || fallbackAttachment?.name || uploaded.original_filename || "",
    mimeType: uploaded.mimeType || fallbackAttachment?.mime || "",
    width: uploaded.width ?? null,
    height: uploaded.height ?? null,
    duration: uploaded.duration ?? null,
  };
}

export default function PostEditorPage({ mode }) {
  const navigate = useNavigate();
  const { id: postId } = useParams();
  const isEdit = mode === "edit";

  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [initialTags, setInitialTags] = useState([]);

  const headerText = useMemo(
    () => (isEdit ? "Chỉnh sửa bài viết" : "Đăng bài mới"),
    [isEdit]
  );

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!isEdit) return;
      if (!postId) {
        setError("Thiếu postId để chỉnh sửa.");
        return;
      }

      setInitialLoading(true);
      setError("");

      try {
        const res = await postsApi.getById(postId);
        const post = unwrap(res);

        if (!mounted) return;

        setTitle(post?.title ?? "");
        setContent(post?.content ?? "");
        setInitialTags(normalizeTags(post?.tags));
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.error ||
            e?.response?.data?.message ||
            e?.message ||
            "Không tải được bài viết."
        );
      } finally {
        if (mounted) setInitialLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [isEdit, postId]);

  const handleSubmit = async ({ title, content, tags, attachments }) => {
    setSaving(true);
    setError("");

    try {
      const userId =
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        localStorage.getItem("uid");

      if (!userId) throw new Error("Bạn chưa đăng nhập.");

      const safeTitle = String(title || "").trim();
      const safeContent = String(content || "").trim();

      if (!safeTitle) throw new Error("Vui lòng nhập tiêu đề.");
      if (!safeContent) throw new Error("Vui lòng nhập nội dung.");

      const list = Array.isArray(attachments) ? attachments : [];

      const uploadedList = await Promise.all(
        list.map(async (attachment) => {
          if (!attachment?.file) return null;

          const kind = attachment.kind === "file" ? "raw" : attachment.kind;
          const uploaded = await uploadApi.uploadToCloudinary(attachment.file, kind);
          return mapUploadToMedia(uploaded, attachment);
        })
      );

      const media = uploadedList.filter(Boolean);

      const payload = {
        authorId: userId,
        title: safeTitle,
        content: safeContent,
        tags: normalizeTags(tags),
        isPublic: true,
        media,
      };

      console.log("[POST SUBMIT] payload:", payload);

      let res;

      if (isEdit) {
        throw new Error("Chức năng cập nhật bài viết chưa được backend hỗ trợ.");
      } else {
        res = await postsApi.create(payload);
      }

      const saved = unwrap(res);
      const newId = saved?._id || saved?.id || postId;

      navigate(newId ? `/posts/${encodeURIComponent(newId)}` : "/posts");
    } catch (e) {
      console.log("[POST SUBMIT ERROR]", {
        status: e?.response?.status,
        data: e?.response?.data,
        message: e?.message,
      });

      setError(
        e?.response?.data?.upstream?.data?.error ||
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Đăng bài thất bại."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
            <Sparkles className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            {headerText}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Markdown • Đính kèm tệp/ảnh/video • Tin IT bên phải
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-slate-200 hover:border-white/25 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
      </div>

      {error ? (
        <div className="mb-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {initialLoading ? (
        <div className="mt-6 flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải bài viết...
        </div>
      ) : (
        <PostEditor
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          onSubmit={handleSubmit}
          initialTags={initialTags}
          submitting={saving}
          submitLabel={isEdit ? "Lưu thay đổi" : "Đăng bài"}
          rightPanel={<ITNewsPanel />}
        />
      )}
    </div>
  );
}