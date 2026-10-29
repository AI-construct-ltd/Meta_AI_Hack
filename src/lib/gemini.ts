import "server-only";

const BASE = process.env.GEMINI_BASE_URL || process.env.OPENAI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";

export const MODELS = {
  // laying out a scanned manual: Google Gemini models
  plan: list(process.env.GEMINI_PLAN_MODEL || process.env.LLM_MODEL, "gemini-3.8-flash,gemini-4-argon,gemini-2.5-flash,gemini-1.5-flash"),
  // product lookups and the "Stuck?" chat: Google Gemini
  text: list(process.env.GEMINI_TEXT_MODEL || process.env.LLM_MODEL, "gemini-3.8-flash,gemini-4-argon,gemini-2.5-flash,gemini-1.5-flash"),
  // box labels and loose parts: Google Gemini Multimodal
  vision: list(process.env.GEMINI_VISION_MODEL || process.env.LLM_MODEL, "gemini-3.8-flash,gemini-4-argon,gemini-2.5-flash,gemini-1.5-flash"),
  // reading manual pages: Google Gemini
  read: list(process.env.GEMINI_READ_MODEL || process.env.LLM_MODEL, "gemini-3.8-flash,gemini-4-argon,gemini-2.5-flash,gemini-1.5-flash"),
};

function list(env: string | undefined, fallback: string) {
  return (env?.trim() || fallback).split(",").map((m) => m.trim()).filter(Boolean);
}

type Content = string | ({ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } })[];
export interface Msg {
  role: "system" | "user" | "assistant";
  content: Content;
}

interface ChatOpts {
  models: string[];
  messages: Msg[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  signal?: AbortSignal;
  /** The Gemini API key: user-provided or from server env. */
  key?: string;
  reasoning?: "low" | "medium" | "high";
}

export class GeminiError extends Error {
  status: number;
  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.status = status;
  }
}
export const TogetherError = GeminiError;
export type TogetherError = GeminiError;

/** Calls Google Gemini via its OpenAI-compatible endpoint, falling back through Gemini models when one is unavailable. */
export async function chat(o: ChatOpts): Promise<{ res: Response; model: string }> {
  const key = o.key?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  if (!key) throw new GeminiError("missing key", 401);
  let lastErr: GeminiError | null = null;
  const baseUrl = BASE.replace(/\/+$/, "");

  for (const model of o.models.map((m) => m.trim()).filter(Boolean)) {
    const body = {
      model,
      messages: o.messages,
      max_tokens: o.maxTokens ?? 1400,
      temperature: o.temperature ?? 0.3,
      stream: !!o.stream,
      ...(o.json ? { response_format: { type: "json_object" } } : {}),
    };
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: o.signal,
      });
    } catch (e) {
      lastErr = new GeminiError((e as Error).message, 502);
      break;
    }
    if (res.ok) return { res, model };
    const text = await res.text().catch(() => "");
    lastErr = new GeminiError(text.slice(0, 300) || res.statusText, res.status);
    if (res.status === 401 || res.status === 402 || res.status === 403 || res.status === 429) throw lastErr;
    if (res.status !== 400 && res.status !== 404) break;
  }
  throw lastErr ?? new GeminiError("no model available", 503);
}

export async function chatText(o: Omit<ChatOpts, "stream">) {
  for (let models = o.models; ; ) {
    const { res, model } = await chat({ ...o, models });
    const j = await res.json();
    const text: string = j?.choices?.[0]?.message?.content ?? "";
    const rest = models.slice(models.indexOf(model) + 1);
    if (text.trim() || !rest.length) return { text, model };
    models = rest;
  }
}

export function extractJson(text: string): unknown {
  const t = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1] : t;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

const hits = new Map<string, number[]>();

export function rateLimited(bucket: string, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(bucket) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(bucket, arr);
    return true;
  }
  arr.push(now);
  hits.set(bucket, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}

export const DEV_KEY = "aiconstruct-dev-mock-key-000000";

export function isDevKey(req: Request) {
  const k = req.headers.get("x-gemini-key")?.trim() || req.headers.get("x-together-key")?.trim();
  return process.env.NODE_ENV !== "production" && k === DEV_KEY;
}

export function userKey(req: Request) {
  if (isDevKey(req)) return process.env.GEMINI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || "dev";
  const k = req.headers.get("x-gemini-key")?.trim() || req.headers.get("x-together-key")?.trim() || "";
  if (k.length >= 10 && k.length <= 250) return k;
  const envKey = process.env.GEMINI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  return envKey || undefined;
}

export function keyTrouble(status: number) {
  return status === 401 || status === 403 ? "key" : status === 402 ? "credits" : null;
}

export function fromApp(req: Request, json = true) {
  if (json && !(req.headers.get("content-type") ?? "").includes("application/json")) return false;
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export function ipOf(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
