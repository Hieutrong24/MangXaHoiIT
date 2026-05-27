const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function rootPath(filename) {
  return path.resolve(__dirname, "../../", filename);
}

function ensureFile(filename, fallback = []) {
  const full = rootPath(filename);
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, JSON.stringify(fallback, null, 2), "utf8");
  }
}

function randomObjectId() {
  return crypto.randomBytes(12).toString("hex");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || randomObjectId().slice(0, 8);
}

function parseMongoLikeDate(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.$date) return value.$date;
  return null;
}

function parseMongoLikeId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.$oid) return value.$oid;
  return null;
}

function safeReadArray(filename) {
  const full = rootPath(filename);
  if (!fs.existsSync(full)) return [];

  try {
    const raw = fs.readFileSync(full, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function safeWriteArray(filename, arr) {
  const full = rootPath(filename);
  fs.writeFileSync(full, JSON.stringify(arr, null, 2), "utf8");
}

function normalizeMediaFromLegacy(post) {
  const media = [];

  for (const url of Array.isArray(post?.images) ? post.images : []) {
    media.push({
      url,
      secureUrl: url,
      publicId: randomObjectId(),
      resourceType: "image",
      format: "",
      bytes: 0,
      originalName: "",
      mimeType: "",
      width: null,
      height: null,
      duration: null,
    });
  }

  for (const url of Array.isArray(post?.videos) ? post.videos : []) {
    media.push({
      url,
      secureUrl: url,
      publicId: randomObjectId(),
      resourceType: "video",
      format: "",
      bytes: 0,
      originalName: "",
      mimeType: "",
      width: null,
      height: null,
      duration: null,
    });
  }

  for (const url of Array.isArray(post?.others) ? post.others : []) {
    media.push({
      url,
      secureUrl: url,
      publicId: randomObjectId(),
      resourceType: "raw",
      format: "",
      bytes: 0,
      originalName: "",
      mimeType: "",
      width: null,
      height: null,
      duration: null,
    });
  }

  return media;
}

function normalizePost(post) {
  const id = parseMongoLikeId(post?._id) || randomObjectId();
  const likes = Array.isArray(post?.likes)
    ? post.likes.map((x) => parseMongoLikeId(x) || String(x)).filter(Boolean)
    : [];

  const media = Array.isArray(post?.media) && post.media.length > 0 ? post.media : normalizeMediaFromLegacy(post);
  const title = String(post?.title || "Bài viết").trim();
  const content = String(post?.content || "").trim();
  const tags = Array.isArray(post?.tags) ? post.tags.map(String) : [];
  const shareCount = Array.isArray(post?.shares) ? post.shares.length : Number(post?.shareCount || 0);
  const commentCount = Array.isArray(post?.comments) ? post.comments.length : Number(post?.commentCount || 0);

  return {
    _id: id,
    authorId: String(parseMongoLikeId(post?.author) || post?.authorId || "system"),
    title: title || "Bài viết",
    content,
    tags,
    isPublic: post?.isPublic !== false,
    media,
    likes,
    likeCount: typeof post?.likeCount === "number" ? post.likeCount : likes.length,
    shareCount,
    commentCount,
    postType: String(post?.postType || (post?.groupId ? "group" : "feed")).toLowerCase(),
    visibility: String(post?.visibility || (post?.groupId ? "group" : "public")).toLowerCase(),
    groupId: post?.groupId ? String(post.groupId) : null,
    moderationStatus: String(post?.moderationStatus || (post?.groupId ? "approved" : "approved")).toLowerCase(),
    approvedAt: parseMongoLikeDate(post?.approvedAt) || null,
    approvedBy: post?.approvedBy ? String(post.approvedBy) : null,
    rejectionReason: post?.rejectionReason ? String(post.rejectionReason) : "",
    spamStatus: ["clear", "review", "blocked"].includes(String(post?.spamStatus || "clear").toLowerCase()) ? String(post?.spamStatus || "clear").toLowerCase() : "clear",
    spamScore: Number(post?.spamScore || 0),
    spamReasons: Array.isArray(post?.spamReasons) ? post.spamReasons.map(String) : [],
    reportCount: Number(post?.reportCount || 0),
    qualityScore: Number(post?.qualityScore || 0),
    qualityBreakdown: post?.qualityBreakdown && typeof post.qualityBreakdown === "object" ? post.qualityBreakdown : {},
    sharedPostId: post?.sharedPostId ? String(post.sharedPostId) : null,
    createdAt: parseMongoLikeDate(post?.createdAt) || new Date().toISOString(),
    updatedAt: parseMongoLikeDate(post?.updatedAt) || new Date().toISOString(),
  };
}

function normalizeComment(comment) {
  return {
    _id: parseMongoLikeId(comment?._id) || randomObjectId(),
    postId: String(parseMongoLikeId(comment?.postId) || comment?.postId || ""),
    authorId: String(comment?.authorId || parseMongoLikeId(comment?.author) || "system"),
    content: String(comment?.content || comment?.text || "").trim(),
    createdAt: parseMongoLikeDate(comment?.createdAt) || new Date().toISOString(),
    updatedAt: parseMongoLikeDate(comment?.updatedAt) || new Date().toISOString(),
  };
}

function normalizeGroup(group) {
  const id = parseMongoLikeId(group?._id) || randomObjectId();
  const members = Array.isArray(group?.members) ? group.members : [];
  const normalizedMembers = members
    .map((m) => ({
      userId: String(m?.userId || m?.id || "").trim(),
      role: ["owner", "admin", "moderator", "member"].includes(String(m?.role || "member").toLowerCase())
        ? String(m?.role || "member").toLowerCase()
        : "member",
      status: String(m?.status || "active").toLowerCase() === "banned" ? "banned" : "active",
      joinedAt: parseMongoLikeDate(m?.joinedAt) || new Date().toISOString(),
      bannedAt: parseMongoLikeDate(m?.bannedAt) || null,
    }))
    .filter((m) => m.userId);

  return {
    _id: id,
    name: String(group?.name || "Nhóm cộng đồng").trim(),
    slug: String(group?.slug || slugify(group?.name || id)).trim(),
    description: String(group?.description || "").trim(),
    avatarUrl: String(group?.avatarUrl || "").trim(),
    coverUrl: String(group?.coverUrl || "").trim(),
    category: String(group?.category || "general").trim().toLowerCase(),
    privacy: ["public", "private"].includes(String(group?.privacy || "public").toLowerCase()) ? String(group?.privacy || "public").toLowerCase() : "public",
    joinCode: String(group?.joinCode || slugify(group?.name || id).replace(/-/g, "").slice(0, 8).toUpperCase()),
    ownerId: String(group?.ownerId || normalizedMembers.find((m) => m.role === "owner")?.userId || "").trim(),
    location: String(group?.location || "").trim(),
    website: String(group?.website || "").trim(),
    contactEmail: String(group?.contactEmail || "").trim(),
    rules: Array.isArray(group?.rules) ? group.rules.map(String) : [],
    topics: Array.isArray(group?.topics) ? group.topics.map(String) : [],
    members: normalizedMembers,
    memberCount: Number(group?.memberCount || normalizedMembers.length || 0),
    postCount: Number(group?.postCount || 0),
    pendingPostCount: Number(group?.pendingPostCount || 0),
    createdAt: parseMongoLikeDate(group?.createdAt) || new Date().toISOString(),
    updatedAt: parseMongoLikeDate(group?.updatedAt) || new Date().toISOString(),
  };
}

function normalizeGroupInvite(item) {
  return {
    _id: parseMongoLikeId(item?._id) || randomObjectId(),
    groupId: String(item?.groupId || "").trim(),
    recipientId: String(item?.recipientId || item?.inviteeId || "").trim(),
    invitedBy: String(item?.invitedBy || item?.actorId || "").trim(),
    role: ["member", "moderator", "admin"].includes(String(item?.role || "member").toLowerCase()) ? String(item?.role || "member").toLowerCase() : "member",
    status: ["pending", "accepted", "rejected", "cancelled"].includes(String(item?.status || "pending").toLowerCase()) ? String(item?.status || "pending").toLowerCase() : "pending",
    note: String(item?.note || "").trim(),
    respondedAt: parseMongoLikeDate(item?.respondedAt) || null,
    createdAt: parseMongoLikeDate(item?.createdAt) || new Date().toISOString(),
    updatedAt: parseMongoLikeDate(item?.updatedAt) || new Date().toISOString(),
  };
}


function normalizeGroupJoinRequest(item) {
  return {
    _id: parseMongoLikeId(item?._id) || randomObjectId(),
    groupId: String(item?.groupId || "").trim(),
    userId: String(item?.userId || item?.requesterId || "").trim(),
    note: String(item?.note || "").trim(),
    status: ["pending", "approved", "rejected", "cancelled"].includes(String(item?.status || "pending").toLowerCase()) ? String(item?.status || "pending").toLowerCase() : "pending",
    reviewedBy: item?.reviewedBy ? String(item.reviewedBy) : null,
    reviewedAt: parseMongoLikeDate(item?.reviewedAt) || null,
    createdAt: parseMongoLikeDate(item?.createdAt) || new Date().toISOString(),
    updatedAt: parseMongoLikeDate(item?.updatedAt) || new Date().toISOString(),
  };
}

function normalizeJob(job) {
  return {
    _id: parseMongoLikeId(job?._id) || randomObjectId(),
    title: String(job?.title || "Vị trí IT").trim(),
    company: String(job?.company || "Công ty công nghệ").trim(),
    companyLogoUrl: String(job?.companyLogoUrl || "").trim(),
    location: String(job?.location || "Hồ Chí Minh").trim(),
    employmentType: String(job?.employmentType || "full-time").trim().toLowerCase(),
    level: String(job?.level || "junior").trim().toLowerCase(),
    salaryRange: String(job?.salaryRange || "Thoả thuận").trim(),
    description: String(job?.description || "").trim(),
    responsibilities: Array.isArray(job?.responsibilities) ? job.responsibilities.map(String) : [],
    requirements: Array.isArray(job?.requirements) ? job.requirements.map(String) : [],
    benefits: Array.isArray(job?.benefits) ? job.benefits.map(String) : [],
    skills: Array.isArray(job?.skills) ? job.skills.map(String) : [],
    applyUrl: String(job?.applyUrl || "").trim(),
    source: String(job?.source || "manual").trim().toLowerCase(),
    recruiterName: String(job?.recruiterName || "Nhà tuyển dụng").trim(),
    recruiterEmail: String(job?.recruiterEmail || "").trim(),
    postedBy: String(job?.postedBy || "system").trim(),
    tags: Array.isArray(job?.tags) ? job.tags.map(String) : [],
    isActive: job?.isActive !== false,
    createdAt: parseMongoLikeDate(job?.createdAt) || new Date().toISOString(),
    updatedAt: parseMongoLikeDate(job?.updatedAt) || new Date().toISOString(),
    publishedAt: parseMongoLikeDate(job?.publishedAt) || new Date().toISOString(),
  };
}

function normalizeJobApplication(item) {
  return {
    _id: parseMongoLikeId(item?._id) || randomObjectId(),
    jobId: String(item?.jobId || "").trim(),
    applicantId: String(item?.applicantId || item?.userId || "").trim(),
    fullName: String(item?.fullName || "").trim(),
    email: String(item?.email || "").trim(),
    phone: String(item?.phone || "").trim(),
    coverLetter: String(item?.coverLetter || "").trim(),
    cvUrl: String(item?.cvUrl || "").trim(),
    cvName: String(item?.cvName || item?.resumeName || "").trim(),
    portfolioUrl: String(item?.portfolioUrl || "").trim(),
    status: ["submitted", "reviewing", "shortlisted", "rejected", "hired"].includes(String(item?.status || "submitted").toLowerCase()) ? String(item?.status || "submitted").toLowerCase() : "submitted",
    createdAt: parseMongoLikeDate(item?.createdAt) || new Date().toISOString(),
    updatedAt: parseMongoLikeDate(item?.updatedAt) || new Date().toISOString(),
  };
}

function loadPosts() { ensureFile("posts.json", []); return safeReadArray("posts.json").map(normalizePost); }
function savePosts(posts) { safeWriteArray("posts.json", posts); }
function loadComments() { ensureFile("comments.json", []); return safeReadArray("comments.json").map(normalizeComment); }
function saveComments(comments) { safeWriteArray("comments.json", comments); }
function loadGroups() { ensureFile("groups.json", []); return safeReadArray("groups.json").map(normalizeGroup); }
function saveGroups(groups) { safeWriteArray("groups.json", groups); }
function loadGroupInvites() { ensureFile("group-invites.json", []); return safeReadArray("group-invites.json").map(normalizeGroupInvite); }
function saveGroupInvites(items) { safeWriteArray("group-invites.json", items); }
function loadGroupJoinRequests() { ensureFile("group-join-requests.json", []); return safeReadArray("group-join-requests.json").map(normalizeGroupJoinRequest); }
function saveGroupJoinRequests(items) { safeWriteArray("group-join-requests.json", items); }
function loadJobs() { ensureFile("jobs.json", []); return safeReadArray("jobs.json").map(normalizeJob); }
function saveJobs(jobs) { safeWriteArray("jobs.json", jobs); }
function loadJobApplications() { ensureFile("job-applications.json", []); return safeReadArray("job-applications.json").map(normalizeJobApplication); }
function saveJobApplications(items) { safeWriteArray("job-applications.json", items); }

module.exports = {
  randomObjectId,
  slugify,
  loadPosts,
  savePosts,
  loadComments,
  saveComments,
  loadGroups,
  saveGroups,
  loadGroupInvites,
  saveGroupInvites,
  loadGroupJoinRequests,
  saveGroupJoinRequests,
  loadJobs,
  saveJobs,
  loadJobApplications,
  saveJobApplications,
};
