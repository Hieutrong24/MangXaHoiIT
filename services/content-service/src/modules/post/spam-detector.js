const { tokenize } = require("./post-discovery");

const SUSPICIOUS_HOST_RE = /(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|ow\.ly|shorte\.st|adf\.ly|free-crypto|airdrop|casino|betting)/i;
const URL_RE = /https?:\/\/[^\s]+/gi;

function normalizeText(value) {
  return tokenize(value).join(" ");
}

function similarity(a, b) {
  const aSet = new Set(normalizeText(a).split(" ").filter(Boolean));
  const bSet = new Set(normalizeText(b).split(" ").filter(Boolean));
  if (!aSet.size || !bSet.size) return 0;
  let overlap = 0;
  for (const token of aSet) if (bSet.has(token)) overlap += 1;
  return overlap / Math.max(aSet.size, bSet.size);
}

function suspiciousLinks(text) {
  const links = String(text || "").match(URL_RE) || [];
  return links.filter((link) => SUSPICIOUS_HOST_RE.test(link));
}

function recent(items, minutes) {
  const since = Date.now() - minutes * 60 * 1000;
  return items.filter((item) => new Date(item.createdAt || 0).getTime() >= since);
}

function assessPostSpam({ title, content, recentPosts = [] }) {
  const text = `${title || ""} ${content || ""}`;
  const reasons = [];
  let score = 0;

  const duplicates = recentPosts.filter((post) => similarity(`${post.title || ""} ${post.content || ""}`, text) >= 0.9);
  if (duplicates.length > 0) {
    score += 35;
    reasons.push("duplicate_content");
  }

  const burstCount = recent(recentPosts, 10).length;
  if (burstCount >= 5) {
    score += Math.min(35, burstCount * 6);
    reasons.push("burst_posting");
  }

  const badLinks = suspiciousLinks(text);
  if (badLinks.length > 0) {
    score += Math.min(30, badLinks.length * 15);
    reasons.push("suspicious_links");
  }

  if (normalizeText(text).length < 8) {
    score += 8;
    reasons.push("low_information_content");
  }

  return {
    score,
    status: score >= 60 ? "blocked" : score >= 30 ? "review" : "clear",
    reasons,
  };
}

function assessCommentSpam({ content, recentComments = [] }) {
  const reasons = [];
  let score = 0;

  const repeated = recent(recentComments, 30).filter((comment) => similarity(comment.content, content) >= 0.95);
  if (repeated.length >= 2) {
    score += 45;
    reasons.push("repeated_comments");
  }

  const burstCount = recent(recentComments, 5).length;
  if (burstCount >= 8) {
    score += 30;
    reasons.push("burst_commenting");
  }

  const badLinks = suspiciousLinks(content);
  if (badLinks.length > 0) {
    score += Math.min(35, badLinks.length * 18);
    reasons.push("suspicious_links");
  }

  return {
    score,
    status: score >= 60 ? "blocked" : score >= 35 ? "review" : "clear",
    reasons,
  };
}

module.exports = { assessPostSpam, assessCommentSpam };
