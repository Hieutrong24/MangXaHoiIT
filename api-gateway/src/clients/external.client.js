// src/clients/external.client.js
const axios = require("axios");
const xml2js = require("xml2js");



async function fetchJson(url) {
  const r = await axios.get(url, { timeout: 15000 });
  return r.data;
}

async function fetchXml(url) {
  const r = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
      Accept: "application/xml,text/xml,*/*",
    },
  });
  return xml2js.parseStringPromise(r.data);
}

function safeStr(x) {
  return x == null ? "" : String(x);
}

function pickFirst(arr) {
  return Array.isArray(arr) ? arr[0] : arr;
}

function toIsoMaybe(d) {
  if (!d) return null;
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return null;
  return t.toISOString();
}



exports.itNews = async ({ limit = 20, q = "" }) => {
  const [devto, hnTop] = await Promise.all([
    fetchJson("https://dev.to/api/articles?per_page=10"),
    fetchJson("https://hacker-news.firebaseio.com/v0/topstories.json"),
  ]);

  const hnIds = (hnTop || []).slice(0, 10);
  const hnItems = await Promise.all(
    hnIds.map((id) => fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
  );

  const out = [];

  for (const a of devto || []) {
    out.push({
      id: `devto:${a.id}`,
      title: a.title,
      url: a.url,
      source: "Dev.to",
      createdAt: a.published_at,
    });
  }

  for (const it of hnItems || []) {
    if (!it) continue;
    out.push({
      id: `hn:${it.id}`,
      title: it.title,
      url: it.url || `https://news.ycombinator.com/item?id=${it.id}`,
      source: "HackerNews",
      createdAt: it.time ? new Date(it.time * 1000).toISOString() : null,
    });
  }

  const qq = q.trim().toLowerCase();
  const filtered = qq ? out.filter((x) => safeStr(x.title).toLowerCase().includes(qq)) : out;

  filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return filtered.slice(0, limit);
};


async function fetchRemotive(q, limit) {
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}`;
  const data = await fetchJson(url);

  return (data?.jobs || []).slice(0, limit).map((j) => ({
    id: `remotive:${j.id}`,
    title: j.title,
    url: j.url,
    source: "Remotive",
    createdAt: j.publication_date,
    company: j.company_name,
    location: j.candidate_required_location || "Remote",
  }));
}


async function fetchITViecFromSitemap(limit) {
  try {
    const xml = await fetchXml("https://itviec.com/job-sitemap.xml");
    const urls = xml?.urlset?.url || [];

    const jobs = urls.slice(0, limit).map((u, idx) => {
      const loc = pickFirst(u.loc);
      const lastmod = pickFirst(u.lastmod);

      const slug = safeStr(loc).split("/").pop();
      const title = slug
        ? slug.replace(/-/g, " ").replace(/\.html$/i, "")
        : "ITviec job";

      return {
        id: `itviec:${idx}`,
        title,
        url: loc,
        source: "ITviec",
        createdAt: lastmod || null,
        company: "ITviec",
        location: "Vietnam",
      };
    });

    return jobs.filter((x) => x.url);
  } catch (err) {
    console.error("ITViec fetch error:", err.message);
    return [];
  }
}


async function fetchRssJobs({ feedUrl, source, limit }) {
  try {
    const xml = await fetchXml(feedUrl);

  
    const items =
      xml?.rss?.channel?.[0]?.item ||
      xml?.feed?.entry || 
      [];

    // RSS
    if (Array.isArray(items) && xml?.rss) {
      return items.slice(0, limit).map((it, idx) => {
        const title = pickFirst(it.title);
        const link = pickFirst(it.link);
        const pubDate = pickFirst(it.pubDate);
        const guid = pickFirst(it.guid);

      
        const url =
          typeof link === "string"
            ? link
            : (link && (link._ || link.href)) || "";

        return {
          id: `${source.toLowerCase()}:${safeStr(guid || url || idx)}`,
          title: safeStr(title) || "Job",
          url,
          source,
          createdAt: toIsoMaybe(pubDate) || null,
          company: null,
          location: "Vietnam",
        };
      }).filter((x) => x.url);
    }

    // Atom
    if (Array.isArray(items) && xml?.feed) {
      return items.slice(0, limit).map((it, idx) => {
        const title = pickFirst(it.title);
        const published = pickFirst(it.published) || pickFirst(it.updated);
        const links = it.link || [];
 
        const url =
          (Array.isArray(links) ? links.find((l) => l?.$?.href)?.$?.href : null) ||
          (links?.$?.href) ||
          "";

        return {
          id: `${source.toLowerCase()}:${safeStr(url || idx)}`,
          title: safeStr(title) || "Job",
          url,
          source,
          createdAt: toIsoMaybe(published) || null,
          company: null,
          location: "Vietnam",
        };
      }).filter((x) => x.url);
    }

    return [];
  } catch (err) {
    console.error(`${source} RSS fetch error:`, err.message);
    return [];
  }
}



exports.itJobs = async ({ limit = 20, q = "software" }) => {
  try {
 
    const per = Math.max(5, Math.ceil(limit / 4));

    // TODO: điền RSS URL thật nếu có
    const VIETNAMWORKS_RSS = process.env.VIETNAMWORKS_RSS || "";
    const CAREERBUILDER_RSS = process.env.CAREERBUILDER_RSS || "";
    const TOPCV_RSS = process.env.TOPCV_RSS || "";

    const tasks = [
      fetchRemotive(q, per),
      fetchITViecFromSitemap(per),
    ];

    if (VIETNAMWORKS_RSS) {
      tasks.push(fetchRssJobs({ feedUrl: VIETNAMWORKS_RSS, source: "VietnamWorks", limit: per }));
    }
    if (CAREERBUILDER_RSS) {
      tasks.push(fetchRssJobs({ feedUrl: CAREERBUILDER_RSS, source: "CareerBuilder", limit: per }));
    }
    if (TOPCV_RSS) {
      tasks.push(fetchRssJobs({ feedUrl: TOPCV_RSS, source: "TopCV", limit: per }));
    }

    const results = await Promise.all(tasks);
    const merged = results.flat();

    merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

   
    const seen = new Set();
    const uniq = [];
    for (const it of merged) {
      const key = it.url || it.id;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      uniq.push(it);
    }

    return uniq.slice(0, limit);
  } catch (err) {
    console.error("itJobs error:", err.message);
    return [];
  }
};