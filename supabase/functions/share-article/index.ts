// Public share endpoint that returns Open Graph meta tags for social crawlers
// (Facebook, LINE, Twitter, etc.) and redirects human visitors to the real article page.
//
// Usage: https://<project-ref>.supabase.co/functions/v1/share-article?slug=<slug>&site=<origin>
//
// Why this exists: the site is a SPA, so crawlers that don't execute JS only see the
// default <head> in index.html. This edge function serves per-article OG tags so that
// links shared on Facebook/LINE show the article image and title.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const DEFAULT_SITE = "https://jwherbal-roots-and-remedies.lovable.app";
const DEFAULT_IMAGE = `${DEFAULT_SITE}/favicon.png`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeOgImage(rawImage: string | null | undefined, site: string): {
  url: string;
  type: string;
} {
  let image = (rawImage || "").trim() || DEFAULT_IMAGE;

  if (!/^https?:\/\//i.test(image)) {
    image = image.startsWith("/") ? `${site}${image}` : `${site}/${image}`;
  }

  try {
    const parsed = new URL(image);

    if (parsed.hostname.includes("unsplash.com") || parsed.hostname.includes("imgix.net")) {
      parsed.searchParams.set("fm", "jpg");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", "1200");
      parsed.searchParams.set("h", "630");
      parsed.searchParams.set("q", "85");
      parsed.searchParams.delete("auto");

      return {
        url: parsed.toString(),
        type: "image/jpeg",
      };
    }

    const pathname = parsed.pathname.toLowerCase();
    if (pathname.endsWith(".png")) {
      return { url: parsed.toString(), type: "image/png" };
    }
    if (pathname.endsWith(".webp")) {
      return { url: parsed.toString(), type: "image/webp" };
    }

    return { url: parsed.toString(), type: "image/jpeg" };
  } catch {
    return { url: image, type: "image/jpeg" };
  }
}

function escapeHtml(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isCrawler(ua: string): boolean {
  if (!ua) return true; // safer: treat unknown as crawler so they get OG tags
  const bots = [
    "facebookexternalhit",
    "facebot",
    "twitterbot",
    "linebot",
    "line-poker",
    "slackbot",
    "discordbot",
    "telegrambot",
    "whatsapp",
    "pinterest",
    "linkedinbot",
    "googlebot",
    "bingbot",
    "yandex",
    "applebot",
    "embedly",
    "skypeuripreview",
    "vkshare",
    "redditbot",
  ];
  const lower = ua.toLowerCase();
  return bots.some((b) => lower.includes(b));
}

function renderHtml(opts: {
  title: string;
  description: string;
  image: string;
  imageType: string;
  url: string;
  redirect: string;
}): string {
  const { title, description, image, imageType, url, redirect } = opts;
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />

<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:secure_url" content="${escapeHtml(image)}" />
<meta property="og:image:type" content="${escapeHtml(imageType)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${escapeHtml(url)}" />
<meta property="og:site_name" content="JW HERBAL" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<link rel="canonical" href="${escapeHtml(redirect)}" />
<meta http-equiv="refresh" content="0; url=${escapeHtml(redirect)}" />
<script>window.location.replace(${JSON.stringify(redirect)});</script>
</head>
<body>
<p>Redirecting to <a href="${escapeHtml(redirect)}">${escapeHtml(title)}</a>…</p>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") || "").trim();
    const siteParam = (url.searchParams.get("site") || "").trim();
    const site = /^https?:\/\//i.test(siteParam) ? siteParam.replace(/\/$/, "") : DEFAULT_SITE;
    const ua = req.headers.get("user-agent") || "";

    if (!slug) {
      return new Response("Missing slug", { status: 400, headers: corsHeaders });
    }

    const redirectUrl = `${site}/articles/${encodeURIComponent(slug)}`;

    // Humans: redirect immediately — no need to render OG.
    if (!isCrawler(ua)) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: redirectUrl },
      });
    }

    // Crawlers: fetch article and render OG tags.
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: article } = await sb
      .from("articles")
      .select("title_th, title_en, title_zh, excerpt_th, excerpt_en, excerpt_zh, image_url")
      .eq("slug", slug)
      .maybeSingle();

    const title = article?.title_th || article?.title_en || "JW HERBAL";
    const description =
      article?.excerpt_th ||
      article?.excerpt_en ||
      "บทความสุขภาพและสมุนไพรจาก JW HERBAL";

    const ogImage = normalizeOgImage(article?.image_url, site);

    const html = renderHtml({
      title,
      description,
      image: ogImage.url,
      imageType: ogImage.type,
      url: redirectUrl,
      redirect: redirectUrl,
    });

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (err) {
    console.error("share-article error", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
