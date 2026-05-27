const { listFrom } = require("../post/feed-ranking");

function textTokens(values) {
  return new Set(
    listFrom(values)
      .flatMap((value) => String(value || "").toLowerCase().split(/[^a-z0-9_+#.-]+/i))
      .map((x) => x.trim())
      .filter(Boolean)
  );
}

function activeMembers(group) {
  return Array.isArray(group.members)
    ? group.members.filter((member) => String(member.status || "active") !== "banned")
    : [];
}

function isMember(group, userId) {
  if (!userId) return false;
  return activeMembers(group).some((member) => String(member.userId) === String(userId));
}

function topicOverlapScore(group, interests) {
  const groupTokens = textTokens([
    group.name,
    group.description,
    group.category,
    ...(Array.isArray(group.topics) ? group.topics : []),
  ]);
  let matches = 0;
  for (const item of interests) {
    if (groupTokens.has(String(item).toLowerCase())) matches += 1;
  }
  return Math.min(30, matches * 10);
}

function friendsJoinedScore(group, friendIds) {
  const friends = activeMembers(group).filter((member) => friendIds.has(String(member.userId))).length;
  return Math.min(30, friends * 8);
}

function activityScore(group) {
  const members = Number(group.memberCount || activeMembers(group).length || 0);
  const posts = Number(group.postCount || 0);
  const pending = Number(group.pendingPostCount || 0);
  const createdAt = new Date(group.createdAt || Date.now()).getTime();
  const ageDays = Math.max(1, (Date.now() - createdAt) / 864e5);
  const velocity = posts / Math.sqrt(ageDays);
  return Math.min(28, Math.log1p(members) * 4 + Math.log1p(posts) * 5 + velocity * 2 - pending);
}

function majorClassScore(group, profile = {}) {
  const tokens = textTokens([
    group.name,
    group.description,
    group.category,
    ...(Array.isArray(group.topics) ? group.topics : []),
  ]);
  let score = 0;
  for (const value of [profile.major, profile.className, profile.department]) {
    const normalized = String(value || "").toLowerCase().trim();
    if (!normalized) continue;
    const parts = normalized.split(/[^a-z0-9_+#.-]+/i).filter(Boolean);
    if (tokens.has(normalized) || parts.some((part) => tokens.has(part))) score += 8;
  }
  return Math.min(20, score);
}

function recommendGroups(groups, query = {}) {
  const viewerId = query.viewerId || query.userId || null;
  const friendIds = new Set(listFrom(query.friendIds));
  const interests = textTokens(query.interests || query.tags || []);
  const profile = {
    major: query.major,
    className: query.className,
    department: query.department,
  };

  return groups
    .filter((group) => !isMember(group, viewerId))
    .map((group) => {
      const parts = {
        topicOverlap: topicOverlapScore(group, interests),
        friendsJoined: friendsJoinedScore(group, friendIds),
        activity: activityScore(group),
        majorClass: majorClassScore(group, profile),
        publicBoost: String(group.privacy || "public") === "public" ? 5 : 0,
      };
      const score = Object.values(parts).reduce((sum, value) => sum + value, 0);
      return {
        ...group,
        recommendation: {
          score: Math.round(score * 100) / 100,
          topicOverlap: Math.round(parts.topicOverlap * 100) / 100,
          friendsJoined: Math.round(parts.friendsJoined * 100) / 100,
          activity: Math.round(parts.activity * 100) / 100,
          majorClass: Math.round(parts.majorClass * 100) / 100,
          publicBoost: parts.publicBoost,
        },
      };
    })
    .sort((a, b) => (b.recommendation?.score || 0) - (a.recommendation?.score || 0));
}

module.exports = { recommendGroups };
