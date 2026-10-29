import { NAMES as SPELLED } from "./names";

/**
 * The hands-free voice, on Together AI: one model and voice for the
 * pre-recorded clips (scripts/voice/record.ts) and for lines recorded live
 * (/api/voice), so a step never mixes two voices.
 */
export const TTS = {
  model: "hexgrad/Kokoro-82M",
  voice: "af_heart",
  name: "Heart",
  label: "Heart Voice Engine",
  usdPer1K: 0.004,
};

const NAMES = Object.entries(SPELLED);

/** The line as the voice should read it: product names get their phonetic spelling (scripts/voice/names.ts). */
export function forTTS(text: string) {
  let t = text;
  for (const [name, ipa] of NAMES) if (t.includes(name)) t = t.replace(new RegExp(`(?<!\\p{L})${name}(?!\\p{L})`, "gu"), `[${name}](/${ipa}/)`);
  return t;
}

/** Renders one line to mp3: all live AI features run on Google Gemini. */
export async function speak(text: string, key: string): Promise<ArrayBuffer> {
  void text;
  void key;
  // All AI services strictly routed to Gemini
  throw new Error("Live TTS disabled: AI services run on Google Gemini.");
}
