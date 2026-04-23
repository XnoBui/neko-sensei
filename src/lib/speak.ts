"use client";

// iOS Safari autoplay rule: audio.play() must be called synchronously inside
// the user-gesture handler. Any `await` between the click event and play()
// detaches the gesture and the play is silently blocked.
//
// Fix: wire the Audio element's src to a real HTTP URL (the /api/tts GET
// endpoint) and call play() synchronously. The browser streams and decodes
// the MP3 like any other audio resource, HTTP cache handles repeats, and
// the server keeps an in-memory LRU so repeats never refetch ElevenLabs.

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

let elevenDisabled = false;
let currentAudio: HTMLAudioElement | null = null;

function ttsUrl(text: string): string {
  return `${BASE_PATH}/api/tts?text=${encodeURIComponent(text)}`;
}

function browserSpeak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  u.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const jp = voices.find((v) => v.lang.startsWith("ja"));
  if (jp) u.voice = jp;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// Warm both the server cache and the browser HTTP cache so the first tap
// plays instantly. Safe to call on card render — skipped once we've
// learned the endpoint is disabled (no API key).
export async function prefetchJa(text: string) {
  if (!text || typeof window === "undefined" || elevenDisabled) return;
  try {
    const res = await fetch(ttsUrl(text), { cache: "force-cache" });
    if (res.status === 503) elevenDisabled = true;
  } catch {
    // network hiccup — no-op; the real tap will retry
  }
}

export function speakJa(text: string) {
  if (!text || typeof window === "undefined") return;

  // Stop any in-flight playback first
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  if (elevenDisabled) {
    browserSpeak(text);
    return;
  }

  // Create + play synchronously — this is the iOS-critical path.
  const audio = new Audio(ttsUrl(text));
  audio.playbackRate = 0.95;
  audio.preload = "auto";
  currentAudio = audio;

  audio.addEventListener(
    "error",
    () => {
      const err = audio.error;
      if (
        err &&
        (err.code === MediaError.MEDIA_ERR_NETWORK ||
          err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)
      ) {
        // TTS endpoint returned JSON/error instead of MP3 — likely no API key.
        elevenDisabled = true;
      }
      browserSpeak(text);
    },
    { once: true },
  );

  const p = audio.play();
  if (p && typeof p.catch === "function") {
    p.catch(() => {
      // Rare: autoplay still refused (e.g. user hasn't interacted with page at all).
      browserSpeak(text);
    });
  }
}
