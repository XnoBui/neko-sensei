import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Native Japanese voice "Kana" from the shared library — best fit for a kana-drill app.
const DEFAULT_VOICE = "dhGvgIx0X6G3xzSWqOye";
// Flash v2.5: ~75ms generation, warms under 500ms end-to-end. Japanese supported.
const DEFAULT_MODEL = "eleven_flash_v2_5";

// simple in-memory cache so repeat drills don't re-hit the API.
// key = `${voice}:${model}:${text}`; value = MP3 bytes.
const cache = new Map<string, Buffer>();
const MAX_CACHE = 300;

function cacheGet(key: string) {
  const hit = cache.get(key);
  if (!hit) return null;
  // touch: move to end (LRU)
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

function cacheSet(key: string, value: Buffer) {
  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, value);
}

async function handleTts({ text, voiceId }: { text: string; voiceId?: string }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ELEVENLABS_API_KEY is not set" }, { status: 503 });
  }
  if (!text) return Response.json({ error: "text is required" }, { status: 400 });
  if (text.length > 400) return Response.json({ error: "text too long" }, { status: 400 });

  const vid = voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
  const model = process.env.ELEVENLABS_MODEL || DEFAULT_MODEL;
  const cacheKey = `${vid}:${model}:${text}`;

  const cached = cacheGet(cacheKey);
  if (cached) {
    return new Response(new Uint8Array(cached), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Cache": "HIT",
      },
    });
  }

  // Use the streaming endpoint so audio arrives as chunks (lower perceived latency).
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(vid)}/stream?optimize_streaming_latency=3`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return Response.json(
      { error: `ElevenLabs ${res.status}: ${errText.slice(0, 300)}` },
      { status: res.status },
    );
  }

  const audio = Buffer.from(await res.arrayBuffer());
  cacheSet(cacheKey, audio);

  return new Response(new Uint8Array(audio), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Cache": "MISS",
    },
  });
}

// GET lets the client use the URL directly as an <audio> / Audio() src, so
// playback can start synchronously inside a user gesture. iOS Safari blocks
// audio that comes from an awaited fetch/blob flow.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const text = (url.searchParams.get("text") ?? "").trim();
  const voiceId = url.searchParams.get("voiceId") ?? undefined;
  return handleTts({ text, voiceId });
}

export async function POST(req: NextRequest) {
  let body: { text?: string; voiceId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const text = (body.text ?? "").trim();
  return handleTts({ text, voiceId: body.voiceId });
}
