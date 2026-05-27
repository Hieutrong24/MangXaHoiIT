const PRIORITY_WEIGHTS = {
  friend_request_sent: 85,
  friend_request_accepted: 82,
  message_sent: 80,
  comment_created: 70,
  group_invite: 75,
  group_member_invited: 75,
  group_post_rejected: 72,
  group_post_pending: 62,
  group_post_approved: 55,
  job_application_created: 78,
  job_application_submitted: 78,
  job_application_status_changed: 76,
  job_published: 58,
  job_created: 58,
};

function targetKey(payload = {}) {
  const data = payload.data || {};
  return (
    data.postId ||
    data.commentId ||
    data.messageId ||
    data.chatId ||
    data.groupId ||
    data.jobId ||
    data.applicationId ||
    data.requestId ||
    payload.actorId ||
    "general"
  );
}

function buildDedupKey(payload = {}) {
  return [
    payload.recipientId || "unknown",
    payload.type || "unknown",
    targetKey(payload),
  ]
    .map((x) => String(x || "unknown").trim().toLowerCase())
    .join(":");
}

function priorityFor(payload = {}) {
  const type = String(payload.type || "").toLowerCase();
  const data = payload.data || {};
  const base = PRIORITY_WEIGHTS[type] || 45;
  const actorBoost = payload.actorId ? 4 : 0;
  const directBoost = data.chatType === "direct" || data.direct === true ? 8 : 0;
  const adminBoost = data.admin === true || data.moderation === true ? 10 : 0;
  const score = Math.max(0, Math.min(100, base + actorBoost + directBoost + adminBoost));
  const priority = score >= 80 ? "high" : score >= 60 ? "normal" : "low";
  return { score, priority };
}

module.exports = { buildDedupKey, priorityFor };
