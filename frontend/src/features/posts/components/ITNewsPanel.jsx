import { useEffect, useMemo, useRef, useState } from "react";
import {
  Flame,
  RefreshCcw,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
  Newspaper,
  Github,
   Loader2,
} from "lucide-react";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function timeAgo(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  return `${day}d ago`;
}

function safeUrl(url) {
  try {
    return url ? new URL(url).toString() : "";
  } catch {
    return "";
  }
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

export default function ITNewsPanel({
  className,
  limit = 10,
  defaultSource = "hn",
  redditSubs = ["programming", "webdev", "netsec", "devops"],
  nvdDays = 7,
}) {
  const [source, setSource] = useState(defaultSource); 
  const [subreddit, setSubreddit] = useState(redditSubs[0] || "programming");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const cacheRef = useRef(new Map()); 
  const TTL_MS = 2 * 60 * 1000

  const key = useMemo(() => {
    if (source === "reddit") return `reddit:${subreddit}:${limit}`;
    if (source === "cve") return `cve:${nvdDays}:${limit}`;
    return `${source}:${limit}`;
  }, [source, subreddit, nvdDays, limit]);

  const sources = useMemo(
    () => [
      { id: "hn", label: "HackerNews", icon: Flame },
      { id: "devto", label: "Dev.to", icon: Newspaper },
      { id: "reddit", label: "Reddit", icon: ExternalLink },
      { id: "cve", label: "CVE (NVD)", icon: ShieldAlert },
 
    ],
    []
  );

  async function fetchHackerNews() {
    // 1) lấy list top story ids
    const idsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    if (!idsRes.ok) throw new Error("HN: không lấy được topstories");
    const ids = await idsRes.json();

    const topIds = (ids || []).slice(0, Math.min(limit, 20));

    // 2) lấy từng item
    const results = await Promise.all(
      topIds.map(async (id) => {
        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!r.ok) return null;
        return r.json();
      })
    );

    // normalize
    return results
      .filter(Boolean)
      .map((x) => ({
        id: `hn:${x.id}`,
        title: x.title || "(no title)",
        url: safeUrl(x.url) || `https://news.ycombinator.com/item?id=${x.id}`,
        source: "HackerNews",
        time: x.time ? x.time * 1000 : null,
        meta: {
          score: x.score,
          comments: x.descendants,
          by: x.by,
        },
      }));
  }

  async function fetchDevTo() {
    const r = await fetch(`https://dev.to/api/articles?per_page=${Math.min(limit, 30)}`);
    if (!r.ok) throw new Error("Dev.to: không lấy được articles");
    const data = await r.json();

    return (data || []).slice(0, limit).map((x) => ({
      id: `devto:${x.id}`,
      title: x.title || "(no title)",
      url: safeUrl(x.url),
      source: "Dev.to",
      time: x.published_timestamp ? new Date(x.published_timestamp).getTime() : null,
      meta: {
        reactions: x.positive_reactions_count,
        comments: x.comments_count,
        author: x.user?.name,
        tags: x.tag_list,
      },
    }));
  }

  async function fetchReddit() {
    const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=${Math.min(
      limit,
      25
    )}&raw_json=1`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "sockioIT/1.0 (web)",
      },
    });
    if (!r.ok) throw new Error("Reddit: không lấy được dữ liệu (có thể bị rate-limit)");
    const data = await r.json();
    const children = data?.data?.children || [];

    return children.slice(0, limit).map((c) => {
      const x = c?.data || {};
      return {
        id: `reddit:${subreddit}:${x.id}`,
        title: x.title || "(no title)",
        url: safeUrl(`https://www.reddit.com${x.permalink}`) || safeUrl(x.url),
        source: `r/${subreddit}`,
        time: x.created_utc ? x.created_utc * 1000 : null,
        meta: {
          score: x.score,
          comments: x.num_comments,
          author: x.author,
          domain: x.domain,
        },
      };
    });
  }

  async function fetchCVE() {
    const end = new Date();
    const start = new Date(Date.now() - nvdDays * 24 * 60 * 60 * 1000);

    const fmt = (d) => d.toISOString();
    const params = new URLSearchParams({
      resultsPerPage: String(Math.min(limit, 20)),
      pubStartDate: fmt(start),
      pubEndDate: fmt(end),
    });

    const r = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?${params.toString()}`);
    if (!r.ok) throw new Error("NVD: không lấy được CVE");
    const data = await r.json();
    const vulns = data?.vulnerabilities || [];

    return vulns.slice(0, limit).map((v) => {
      const cve = v?.cve;
      const id = cve?.id;
      const desc = cve?.descriptions?.find((d) => d?.lang === "en")?.value || "";
      const published = cve?.published ? new Date(cve.published).getTime() : null;

      return {
        id: `cve:${id || Math.random()}`,
        title: id ? `${id} — ${desc.slice(0, 90)}${desc.length > 90 ? "…" : ""}` : "(no id)",
        url: id ? `https://nvd.nist.gov/vuln/detail/${id}` : "",
        source: "NVD (CVE)",
        time: published,
        meta: {
          severity:
            cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity ||
            cve?.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity ||
            cve?.metrics?.cvssMetricV2?.[0]?.cvssData?.baseSeverity ||
            "",
        },
      };
    });
  }

  async function load(force = false) {
    setErr("");

    // cache
    const cached = cacheRef.current.get(key);
    if (!force && cached && Date.now() - cached.ts < TTL_MS) {
      setItems(cached.data);
      return;
    }

    setLoading(true);
    try {
      let data = [];
      if (source === "hn") data = await fetchHackerNews();
      else if (source === "devto") data = await fetchDevTo();
      else if (source === "reddit") data = await fetchReddit();
      else if (source === "cve") data = await fetchCVE();
      else data = [];

      cacheRef.current.set(key, { ts: Date.now(), data });
      setItems(data);
    } catch (e) {
      setErr(e?.message || "Không tải được tin.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(false);
  }, [key]);

  return (
    <div
      className={cx(
        "rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_55px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-cyan-300" />
          <div className="text-sm font-semibold text-white">IT mới nhất</div>
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          className="text-xs px-2 py-1 rounded-lg border border-white/15 text-slate-200 hover:border-cyan-400/70 transition flex items-center gap-1"
          title="Refresh"
        >
          <RefreshCcw className={cx("h-3.5 w-3.5", loading && "animate-spin")} />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {sources.map((s) => {
            const Icon = s.icon;
            const active = source === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSource(s.id)}
                className={cx(
                  "px-3 py-1.5 rounded-xl border text-xs transition flex items-center gap-2",
                  active
                    ? "border-cyan-400/60 bg-cyan-500/10 text-white"
                    : "border-white/15 bg-black/20 text-slate-300 hover:border-white/25"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Reddit subs */}
        {source === "reddit" ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="text-[11px] text-slate-400">Sub:</div>
            {uniq(redditSubs).map((sub) => {
              const active = subreddit === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubreddit(sub)}
                  className={cx(
                    "px-2.5 py-1 rounded-lg border text-[11px] transition",
                    active
                      ? "border-purple-400/60 bg-purple-500/10 text-white"
                      : "border-white/15 bg-black/20 text-slate-300 hover:border-white/25"
                  )}
                >
                  r/{sub}
                </button>
              );
            })}
          </div>
        ) : null}

        {source === "cve" ? (
          <div className="mt-3 text-[11px] text-slate-400">
            Lấy CVE trong {nvdDays} ngày gần nhất
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="px-3 pb-3">
        {err ? (
          <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <div>{err}</div>
          </div>
        ) : null}

        {loading && items.length === 0 ? (
          <div className="px-1 py-6 text-sm text-slate-300 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải...
          </div>
        ) : null}

        <div className="max-h-[520px] overflow-auto pr-1">
          {items.length === 0 && !loading ? (
            <div className="px-1 py-6 text-sm text-slate-400">
              Không có dữ liệu.
            </div>
          ) : null}

          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="rounded-xl border border-white/10 bg-black/25 hover:border-white/20 transition px-3 py-2"
              >
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white hover:underline flex items-start gap-2"
                  title={it.title}
                >
                  <span className="flex-1 line-clamp-2">{it.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 mt-1" />
                </a>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                  <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5">
                    {it.source}
                  </span>
                  {it.time ? <span>{timeAgo(it.time)}</span> : null}

                  {/* meta highlights */}
                  {it.meta?.score != null ? <span>▲ {it.meta.score}</span> : null}
                  {it.meta?.comments != null ? <span>💬 {it.meta.comments}</span> : null}
                  {it.meta?.severity ? (
                    <span className="inline-flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-300" />
                      {it.meta.severity}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer tips for blocked sources */}
        <div className="mt-3 text-[11px] text-slate-500">
          Gợi ý: NewsAPI & GitHub Trending nên gọi qua backend proxy để tránh CORS/lộ key.
        </div>
      </div>
    </div>
  );
}