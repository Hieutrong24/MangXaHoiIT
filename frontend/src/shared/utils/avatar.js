export function safeUrl(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.startsWith("/")) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

export function pickAvatarSeed(user) {
  return (
    user?.username ||
    user?.userId ||
    user?.id ||
    user?.tdmuEmail ||
    user?.fullName ||
    user?.name ||
    "user"
  );
}

export function buildAvatarFallbacks(seed) {
  const s = seed || "user";
  return [
    `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(s)}&size=256`,
    `https://robohash.org/${encodeURIComponent(s)}.png?size=256x256&set=set4`,
    `https://i.pravatar.cc/256?u=${encodeURIComponent(s)}`,
  ];
}

export function buildAvatarCandidates(user) {
  const avatarBackend = safeUrl(
    user?.avatarUrl || user?.avatar || user?.profilePicture || user?.photoUrl
  );

  const seed = pickAvatarSeed(user);
  const fallbacks = buildAvatarFallbacks(seed);

  return avatarBackend ? [avatarBackend, ...fallbacks] : fallbacks;
}
