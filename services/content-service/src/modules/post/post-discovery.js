const { listFrom } = require("./feed-ranking");

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9_+#.-]+/i)
    .map((x) => x.trim())
    .filter(Boolean);
}

function postTokens(post) {
  return [
    ...tokenize(post.title),
    ...tokenize(post.content),
    ...(Array.isArray(post.tags) ? post.tags.flatMap(tokenize) : []),
  ];
}

function vectorFromTokens(tokens) {
  const vector = new Map();
  for (const token of tokens) vector.set(token, (vector.get(token) || 0) + 1);
  return vector;
}

function cosine(a, b) {
  if (!a.size || !b.size) return 0;
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;
  for (const value of a.values()) aNorm += value * value;
  for (const value of b.values()) bNorm += value * value;
  for (const [key, value] of a.entries()) dot += value * (b.get(key) || 0);
  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
}

function ageHours(date) {
  const ts = new Date(date || Date.now()).getTime();
  if (!Number.isFinite(ts)) return 9999;
  return Math.max(0, (Date.now() - ts) / 36e5);
}

function engagement(post) {
  return Number(post.likeCount || 0) * 2 + Number(post.commentCount || 0) * 4 + Number(post.shareCount || 0) * 5;
}

function recency(post, halfLifeHours = 72) {
  return Math.exp(-ageHours(post?.createdAt) / halfLifeHours);
}

function approvedFeedPost(post) {
  return String(post.moderationStatus || "approved") === "approved" && !post.groupId;
}

function buildUserVector(query = {}, likedPosts = []) {
  const interests = listFrom(query.interests || query.tags);
  const likedTags = listFrom(query.likedTags);
  const tokens = [...interests, ...likedTags];
  for (const post of likedPosts) tokens.push(...postTokens(post));
  return vectorFromTokens(tokens.flatMap(tokenize));
}

function recommendPosts(posts, query = {}) {
  const targetPost = query.targetPostId
    ? posts.find((post) => String(post._id || post.id) === String(query.targetPostId))
    : null;
  const viewedPostIds = new Set(listFrom(query.viewedPostIds));
  const likedPostIds = new Set(listFrom(query.likedPostIds));
  const likedAuthorIds = new Set(listFrom(query.likedAuthorIds));
  const followingIds = new Set(listFrom(query.followingIds));
  const friendIds = new Set(listFrom(query.friendIds));
  const likedPosts = posts.filter((post) => likedPostIds.has(String(post._id || post.id)));
  const userVector = buildUserVector(query, likedPosts);
  const targetVector = vectorFromTokens(postTokens(targetPost || {}));

  return posts
    .filter(approvedFeedPost)
    .filter((post) => !viewedPostIds.has(String(post._id || post.id)))
    .filter((post) => !targetPost || String(post._id || post.id) !== String(targetPost._id || targetPost.id))
    .map((post) => {
      const authorId = String(post.authorId || "");
      const postVector = vectorFromTokens(postTokens(post));
      const tagUserEmbedding = cosine(userVector, postVector) * 45;
      const similarPost = targetPost ? cosine(targetVector, postVector) * 35 : 0;
      const collaborative =
        (likedAuthorIds.has(authorId) ? 20 : 0) +
        (followingIds.has(authorId) ? 12 : 0) +
        (friendIds.has(authorId) ? 10 : 0);
      const popularity = Math.log1p(engagement(post)) * 8;
      const recencyBoost = recency(post, 96) * 12;
      const score = tagUserEmbedding + similarPost + collaborative + popularity + recencyBoost;

      return {
        ...post,
        recommendation: {
          score: Math.round(score * 100) / 100,
          tagUserEmbedding: Math.round(tagUserEmbedding * 100) / 100,
          collaborative: Math.round(collaborative * 100) / 100,
          similarPost: Math.round(similarPost * 100) / 100,
          popularity: Math.round(popularity * 100) / 100,
          recency: Math.round(recencyBoost * 100) / 100,
        },
      };
    })
    .filter((post) => post.recommendation.score > 0)
    .sort((a, b) => b.recommendation.score - a.recommendation.score);
}

function searchPosts(posts, query = {}) {
  const keyword = String(query.q || query.keyword || "").trim();
  const queryTokens = tokenize(keyword);
  const queryVector = vectorFromTokens(queryTokens);
  const friendIds = new Set(listFrom(query.friendIds));
  const followingIds = new Set(listFrom(query.followingIds));

  return posts
    .filter(approvedFeedPost)
    .map((post) => {
      const title = String(post.title || "").toLowerCase();
      const content = String(post.content || "").toLowerCase();
      const tags = Array.isArray(post.tags) ? post.tags.map((x) => String(x).toLowerCase()) : [];
      const textRelevance =
        cosine(queryVector, vectorFromTokens(postTokens(post))) * 55 +
        queryTokens.filter((token) => title.includes(token)).length * 10 +
        queryTokens.filter((token) => tags.includes(token)).length * 12 +
        queryTokens.filter((token) => content.includes(token)).length * 3;
      const popularity = Math.log1p(engagement(post)) * 8;
      const recencyBoost = recency(post, 120) * 15;
      const relationshipBoost =
        friendIds.has(String(post.authorId || "")) ? 18 : followingIds.has(String(post.authorId || "")) ? 12 : 0;
      const score = textRelevance + popularity + recencyBoost + relationshipBoost;

      return {
        ...post,
        search: {
          score: Math.round(score * 100) / 100,
          textRelevance: Math.round(textRelevance * 100) / 100,
          popularity: Math.round(popularity * 100) / 100,
          recency: Math.round(recencyBoost * 100) / 100,
          relationshipBoost,
        },
      };
    })
    .filter((post) => !keyword || post.search.textRelevance > 0)
    .sort((a, b) => b.search.score - a.search.score);
}

function trendingPosts(posts, query = {}) {
  const windowHours = Math.max(1, Math.min(720, Number(query.windowHours) || 168));
  const now = Date.now();

  return posts
    .filter(approvedFeedPost)
    .filter((post) => now - new Date(post.createdAt || now).getTime() <= windowHours * 36e5)
    .map((post) => {
      const hours = Math.max(1, ageHours(post));
      const velocity = engagement(post) / Math.sqrt(hours);
      const timeDecay = Math.exp(-hours / windowHours);
      const spamPenalty = Number(post.spamScore || 0) * 15 + (String(post.spamStatus || "clear") !== "clear" ? 20 : 0);
      const score = velocity * 18 + Math.log1p(engagement(post)) * 10 + timeDecay * 20 - spamPenalty;

      return {
        ...post,
        trending: {
          score: Math.round(score * 100) / 100,
          engagementVelocity: Math.round(velocity * 100) / 100,
          timeDecay: Math.round(timeDecay * 100) / 100,
          spamPenalty: Math.round(spamPenalty * 100) / 100,
        },
      };
    })
    .filter((post) => post.trending.score > 0)
    .sort((a, b) => b.trending.score - a.trending.score);
}

module.exports = { recommendPosts, searchPosts, trendingPosts, tokenize };
