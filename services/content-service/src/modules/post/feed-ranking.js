function listFrom(value) {
  if (Array.isArray(value)) return value.map(String).map((x) => x.trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeSet(value) {
  return new Set(listFrom(value).map((x) => x.toLowerCase()));
}

function ageHours(date) {
  const ts = new Date(date || Date.now()).getTime();
  if (!Number.isFinite(ts)) return 9999;
  return Math.max(0, (Date.now() - ts) / 36e5);
}

function freshnessScore(post) {
  const hours = ageHours(post.createdAt);
  return 35 * Math.exp(-hours / 36);
}

function engagementScore(post) {
  const likes = Number(post.likeCount || (Array.isArray(post.likes) ? post.likes.length : 0));
  const comments = Number(post.commentCount || 0);
  const shares = Number(post.shareCount || 0);
  return Math.log1p(likes * 2 + comments * 4 + shares * 5) * 14;
}

function qualityScore(post) {
  const titleLength = String(post.title || "").trim().length;
  const contentLength = String(post.content || "").trim().length;
  const tagCount = Array.isArray(post.tags) ? post.tags.filter(Boolean).length : 0;
  const mediaCount = Array.isArray(post.media) ? post.media.length : 0;

  let score = 0;
  if (titleLength >= 12) score += 4;
  if (contentLength >= 80) score += 7;
  if (contentLength >= 240) score += 4;
  if (tagCount > 0) score += Math.min(6, tagCount * 2);
  if (mediaCount > 0) score += Math.min(8, mediaCount * 3);
  if (contentLength < 15) score -= 8;
  if (titleLength > 180) score -= 3;
  return score;
}

function affinityScore(post, context) {
  const authorId = String(post.authorId || "");
  const groupId = String(post.groupId || "");
  const tags = Array.isArray(post.tags) ? post.tags.map((x) => String(x).toLowerCase()) : [];

  let score = 0;
  if (context.viewerId && authorId === String(context.viewerId)) score += 7;
  if (context.friendIds.has(authorId)) score += 28;
  if (context.followingIds.has(authorId)) score += 20;
  if (groupId && context.joinedGroupIds.has(groupId)) score += 14;
  score += tags.filter((tag) => context.interests.has(tag)).length * 6;
  return score;
}

function negativePenalty(post, context) {
  const authorId = String(post.authorId || "");
  const postId = String(post._id || post.id || "");
  const groupId = String(post.groupId || "");
  const tags = Array.isArray(post.tags) ? post.tags.map((x) => String(x).toLowerCase()) : [];

  let penalty = 0;
  if (context.hiddenPostIds.has(postId)) penalty += 1000;
  if (context.blockedAuthorIds.has(authorId)) penalty += 1000;
  if (context.hiddenAuthorIds.has(authorId)) penalty += 70;
  if (groupId && context.mutedGroupIds.has(groupId)) penalty += 55;
  penalty += tags.filter((tag) => context.mutedTags.has(tag)).length * 20;
  return penalty;
}

function buildContext(query = {}) {
  return {
    viewerId: query.viewerId || query.userId || null,
    friendIds: new Set(listFrom(query.friendIds)),
    followingIds: new Set(listFrom(query.followingIds)),
    joinedGroupIds: new Set(listFrom(query.joinedGroupIds)),
    hiddenPostIds: new Set(listFrom(query.hiddenPostIds)),
    hiddenAuthorIds: new Set(listFrom(query.hiddenAuthorIds)),
    blockedAuthorIds: new Set(listFrom(query.blockedAuthorIds)),
    mutedGroupIds: new Set(listFrom(query.mutedGroupIds)),
    interests: normalizeSet(query.interests || query.tags),
    mutedTags: normalizeSet(query.mutedTags),
  };
}

function addDiversity(scoredItems) {
  const authorCounts = new Map();
  const groupCounts = new Map();

  return scoredItems
    .map((item) => {
      const authorId = String(item.post.authorId || "");
      const groupId = String(item.post.groupId || "");
      const authorSeen = authorCounts.get(authorId) || 0;
      const groupSeen = groupId ? groupCounts.get(groupId) || 0 : 0;
      authorCounts.set(authorId, authorSeen + 1);
      if (groupId) groupCounts.set(groupId, groupSeen + 1);

      const diversityPenalty = authorSeen * 10 + groupSeen * 5;
      return { ...item, score: item.score - diversityPenalty, diversityPenalty };
    })
    .sort((a, b) => b.score - a.score);
}

function rankFeed(posts, query = {}) {
  const context = buildContext(query);

  const scored = posts
    .filter((post) => String(post.moderationStatus || "approved") === "approved")
    .map((post) => {
      const parts = {
        freshness: freshnessScore(post),
        affinity: affinityScore(post, context),
        engagement: engagementScore(post),
        quality: qualityScore(post),
        negative: negativePenalty(post, context),
      };
      const score = parts.freshness + parts.affinity + parts.engagement + parts.quality - parts.negative;
      return { post, score, parts };
    })
    .filter((item) => item.score > -500)
    .sort((a, b) => b.score - a.score);

  return addDiversity(scored).map((item) => ({
    ...item.post,
    ranking: {
      score: Math.round(item.score * 100) / 100,
      freshness: Math.round(item.parts.freshness * 100) / 100,
      affinity: Math.round(item.parts.affinity * 100) / 100,
      engagement: Math.round(item.parts.engagement * 100) / 100,
      quality: Math.round(item.parts.quality * 100) / 100,
      negative: Math.round(item.parts.negative * 100) / 100,
      diversityPenalty: Math.round((item.diversityPenalty || 0) * 100) / 100,
    },
  }));
}

module.exports = { rankFeed, listFrom };
