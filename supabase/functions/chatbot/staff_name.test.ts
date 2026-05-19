// Verifies the server-side enforcement: once a session has an assigned
// AI staff name, subsequent calls (multiple messages, view switches, re-login)
// MUST return the same staff name — even when the client tries to send a
// different name.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/chatbot`;

const STAFF_NAMES = ["เอมอร", "นันนพัส", "ธัญญ์สิริน", "ชญานิศ", "ณัฐวรินทร์"];

async function callChat(opts: {
  sessionId: string;
  userMessage: string;
  staffName?: string;
}): Promise<string | null> {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      sessionId: opts.sessionId,
      language: "th",
      staffName: opts.staffName,
      messages: [{ role: "user", content: opts.userMessage }],
    }),
  });
  const staff = res.headers.get("x-ai-staff-name");
  // Consume body to avoid resource leak (stream or json)
  try { await res.body?.cancel(); } catch { /* ignore */ }
  return staff;
}

Deno.test("server assigns and persists a valid staff name on first call", async () => {
  const sessionId = `test-${crypto.randomUUID()}`;
  const staff = await callChat({ sessionId, userMessage: "สวัสดี" });
  assert(staff, "expected x-ai-staff-name header to be set");
  assert(STAFF_NAMES.includes(staff!), `expected one of STAFF_NAMES, got ${staff}`);
});

Deno.test("same session keeps the same staff name across multiple messages", async () => {
  const sessionId = `test-${crypto.randomUUID()}`;
  const first = await callChat({ sessionId, userMessage: "ข้อความที่ 1" });
  const second = await callChat({ sessionId, userMessage: "ข้อความที่ 2" });
  const third = await callChat({ sessionId, userMessage: "ข้อความที่ 3" });
  assertEquals(second, first, "staff name must not change on 2nd message");
  assertEquals(third, first, "staff name must not change on 3rd message");
});

Deno.test("server ignores client-sent staff name that conflicts with persisted one", async () => {
  const sessionId = `test-${crypto.randomUUID()}`;
  const original = await callChat({ sessionId, userMessage: "init", staffName: "เอมอร" });
  assert(original);
  // Client tries to switch to a different valid name — server must reject the change
  const other = STAFF_NAMES.find((n) => n !== original)!;
  const after = await callChat({ sessionId, userMessage: "พยายามเปลี่ยนชื่อ", staffName: other });
  assertEquals(after, original, "server must enforce the persisted staff name");
});

Deno.test("simulates re-login / view switch — reusing sessionId keeps staff name", async () => {
  const sessionId = `test-${crypto.randomUUID()}`;
  const original = await callChat({ sessionId, userMessage: "ครั้งแรก" });
  // Simulate user closing tab and coming back (no client-side staff name sent)
  const afterReturn = await callChat({ sessionId, userMessage: "กลับมาใหม่" });
  assertEquals(afterReturn, original, "returning to the same session must reuse the staff name");
});
