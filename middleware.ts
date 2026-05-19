/**
 * Vercel Edge Middleware — Bot-detection proxy for OG previews
 *
 * วางไฟล์นี้ที่ root ของ Vercel project (ชื่อต้องเป็น `middleware.ts`)
 * แล้ว deploy ผ่าน Vercel
 *
 * พฤติกรรม:
 * - ถ้า request เป็น bot (Facebook, LINE, Twitter, Google, etc.) บนหน้า /articles/:slug
 *   → proxy ไปที่ Supabase Edge Function (share-article) ที่ส่ง HTML พร้อม OG tags ครบ
 * - ถ้าเป็น user จริง → ปล่อยให้ Vercel serve SPA ตามปกติ
 *
 * ผลลัพธ์: ลิงก์ https://www.jwherbal.com/articles/xxx จะขึ้นรูป preview บน FB/LINE
 * โดยที่ URL ยังคงสวยงาม และ user เห็นเว็บปกติ
 */

import { next, rewrite } from "@vercel/edge";

export const config = {
  matcher: "/articles/:slug*",
};

const SUPABASE_PROJECT_REF = "guauobzuxgvkluxwfvxt";
const SHARE_FUNCTION_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/share-article`;

// Bot user-agent patterns ที่ต้อง serve OG HTML
const BOT_UA_REGEX =
  /facebookexternalhit|facebookcatalog|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|Line\/|LineBot|Discordbot|Pinterest|redditbot|Applebot|Googlebot|bingbot|DuckDuckBot|YandexBot|Baiduspider|SkypeUriPreview|vkShare|W3C_Validator|embedly|quora link preview|outbrain|nuzzel|bitlybot/i;

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";

  // เฉพาะหน้า article detail (มี slug)
  const match = url.pathname.match(/^\/articles\/([^\/]+)\/?$/);
  if (!match) return next();

  const slug = match[1];
  const isBot = BOT_UA_REGEX.test(userAgent);

  if (!isBot) {
    // User จริง → ใช้ SPA ปกติ
    return next();
  }

  // Bot → rewrite ไป edge function ที่มี OG tags ครบ
  const target = `${SHARE_FUNCTION_URL}?slug=${encodeURIComponent(
    slug
  )}&site=${encodeURIComponent(url.origin)}`;

  return rewrite(target);
}
