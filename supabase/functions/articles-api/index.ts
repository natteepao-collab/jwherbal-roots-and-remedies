// Public API for external AI agents (e.g. Codex) to create/update articles
// Auth: send header `x-api-key: <ARTICLES_API_KEY>`
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const REQUIRED_FIELDS = [
  "slug",
  "title_th",
  "title_en",
  "title_zh",
  "excerpt_th",
  "excerpt_en",
  "excerpt_zh",
  "content_th",
  "content_en",
  "content_zh",
  "image_url",
  "category",
  "author",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0E00-\u0E7F\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth
  const apiKey = req.headers.get("x-api-key");
  const expected = Deno.env.get("ARTICLES_API_KEY");
  if (!expected) return json({ error: "Server not configured" }, 500);
  if (!apiKey || apiKey !== expected) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const url = new URL(req.url);

  try {
    // GET — fetch by slug or list latest
    if (req.method === "GET") {
      const slug = url.searchParams.get("slug");
      if (slug) {
        const { data, error } = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Not found" }, 404);
        return json({ article: data });
      }
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title_th, category, author, published_date, is_featured, updated_at")
        .order("published_date", { ascending: false })
        .limit(limit);
      if (error) return json({ error: error.message }, 500);
      return json({ articles: data });
    }

    // DELETE — remove by slug
    if (req.method === "DELETE") {
      const slug = url.searchParams.get("slug");
      if (!slug) return json({ error: "slug query param required" }, 400);
      const { error } = await supabase.from("articles").delete().eq("slug", slug);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, slug });
    }

    // POST/PUT — upsert article
    if (req.method === "POST" || req.method === "PUT") {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json({ error: "Invalid JSON body" }, 400);

      // Auto-generate slug from title_th if missing
      if (!body.slug && body.title_th) body.slug = slugify(body.title_th);

      // Validate required fields (only for POST, PUT allows partial)
      if (req.method === "POST") {
        const missing = REQUIRED_FIELDS.filter((f) => !body[f]);
        if (missing.length) return json({ error: `Missing required fields: ${missing.join(", ")}` }, 400);
      } else {
        if (!body.slug) return json({ error: "slug required for update" }, 400);
      }

      // Whitelist columns
      const allowed = [
        ...REQUIRED_FIELDS,
        "published_date",
        "is_featured",
        "reviewer",
        "references_text",
        "likes",
      ];
      const payload: Record<string, unknown> = {};
      for (const k of allowed) if (k in body) payload[k] = body[k];

      if (req.method === "PUT") {
        const { data, error } = await supabase
          .from("articles")
          .update(payload)
          .eq("slug", body.slug)
          .select()
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Article not found" }, 404);
        return json({ success: true, action: "updated", article: data });
      }

      // POST → upsert on slug
      const { data, error } = await supabase
        .from("articles")
        .upsert(payload, { onConflict: "slug" })
        .select()
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, action: "upserted", article: data });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
