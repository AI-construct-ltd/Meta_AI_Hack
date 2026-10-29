import "server-only";

/**
 * How the guide hears you: Google Gemini native multimodal audio transcription.
 */
export const STT = {
  models: ["gemini-3.8-flash", "gemini-4-argon", "gemini-2.5-flash"],
  label: "Google Gemini Audio",
};

/** Text of one piece of 16 kHz mono WAV transcribed by Gemini. */
export async function transcribe(wav: ArrayBuffer, key: string, signal?: AbortSignal) {
  const b64 = Buffer.from(wav).toString("base64");
  const apiKey = key || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("gemini 401: missing key");

  for (const model of STT.models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = {
        contents: [
          {
            parts: [
              {
                text: "Listen to this microphone audio clip and transcribe the user's speech (for example: 'next', 'step', 'tools', or questions). Output ONLY the exact transcribed text with no quotes, commentary, or punctuation. If silence or no clear words, output an empty response.",
              },
              { inline_data: { mime_type: "audio/wav", data: b64 } },
            ],
          },
        ],
      };
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
      if (r.ok) {
        const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = j.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
        return text;
      }
      if (r.status === 401 || r.status === 402 || r.status === 403) {
        throw new Error(`gemini ${r.status}: ${(await r.text()).slice(0, 160)}`);
      }
    } catch (e) {
      if (signal?.aborted) throw e;
      if ((e as Error).message.includes("401") || (e as Error).message.includes("403")) throw e;
    }
  }
  return "";
}
