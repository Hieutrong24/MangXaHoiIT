function textLengthScore(post) {
  const titleLength = String(post.title || "").trim().length;
  const contentLength = String(post.content || "").trim().length;
  let score = 0;
  if (titleLength >= 12) score += 10;
  if (contentLength >= 80) score += 18;
  if (contentLength >= 240) score += 12;
  if (contentLength >= 800) score += 5;
  if (contentLength < 20) score -= 12;
  return score;
}

function mediaCompletenessScore(post) {
  const media = Array.isArray(post.media) ? post.media : [];
  if (!media.length) return 5;
  const complete = media.filter((item) => item?.url && item?.secureUrl && item?.resourceType && item?.publicId).length;
  const ratio = complete / media.length;
  return 10 + ratio * 15;
}

function engagementRatioScore(post) {
  const likes = Number(post.likeCount || 0);
  const comments = Number(post.commentCount || 0);
  const shares = Number(post.shareCount || 0);
  const engagement = likes + comments * 2 + shares * 3;
  const ageHours = Math.max(1, (Date.now() - new Date(post.createdAt || Date.now()).getTime()) / 36e5);
  return Math.min(25, Math.log1p(engagement / Math.sqrt(ageHours)) * 10);
}

function reportPenalty(post) {
  const reportCount = Number(post.reportCount || 0);
  const spamScore = Number(post.spamScore || 0);
  return Math.min(35, reportCount * 8 + spamScore * 0.4);
}

function calculateContentQuality(post = {}) {
  const parts = {
    textLength: textLengthScore(post),
    mediaCompleteness: mediaCompletenessScore(post),
    engagementRatio: engagementRatioScore(post),
    reportPenalty: reportPenalty(post),
  };
  const raw = 45 + parts.textLength + parts.mediaCompleteness + parts.engagementRatio - parts.reportPenalty;
  const score = Math.max(0, Math.min(100, raw));
  const level = score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 35 ? "fair" : "low";
  return {
    score: Math.round(score * 100) / 100,
    level,
    ...Object.fromEntries(Object.entries(parts).map(([key, value]) => [key, Math.round(value * 100) / 100])),
  };
}

function attachContentQuality(post) {
  return {
    ...post,
    contentQuality: calculateContentQuality(post),
  };
}

module.exports = { calculateContentQuality, attachContentQuality };
