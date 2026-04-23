import { NextRequest } from "next/server";

export const runtime = "nodejs";

// default: Japanese-friendly voice. Override with ELEVENLABS_VOICE_ID.
// 21m00Tcm4TlvDq8ikWAM = "Rachel" (multilingual v2 handles Japanese)
const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL = "eleven_multilingual_v2";

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

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ELEVENLABS_API_KEY is not set" },
      { status: 503 },
    );
  }

  let body: { text?: string; voiceId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) return Response.json({ error: "text is required" }, { status: 400 });
  if (text.length > 400)
    return Response.json({ error: "text too long" }, { status: 400 });

  const voiceId = body.voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
  const model = process.env.ELEVENLABS_MODEL || DEFAULT_MODEL;
  const cacheKey = `${voiceId}:${model}:${text}`;

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

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
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
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0.2,
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
