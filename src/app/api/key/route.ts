import { fromApp, ipOf, isDevKey, rateLimited, userKey } from "@/lib/gemini";

const BASE = process.env.GEMINI_BASE_URL || process.env.OPENAI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";

/** Checks that a pasted Gemini API key works, without storing it. */
export async function POST(req: Request) {
  if (!fromApp(req, false)) return Response.json({ ok: false, reason: "forbidden" }, { status: 403 });
  if (isDevKey(req)) return Response.json({ ok: true });
  const key = userKey(req);
  if (!key) return Response.json({ ok: false, reason: "format" });
  if (rateLimited(ipOf(req) + ":key", 12, 10 * 60_000)) return Response.json({ ok: false, reason: "busy" }, { status: 429 });
  try {
    const baseUrl = BASE.replace(/\/+$/, "");
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3.8-flash",
        max_tokens: 5,
        messages: [{ role: "user", content: "ping" }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) return Response.json({ ok: true });
    return Response.json({ ok: false, reason: r.status === 401 || r.status === 403 ? "rejected" : "unavailable" });
  } catch {
    return Response.json({ ok: false, reason: "unavailable" });
  }
}
