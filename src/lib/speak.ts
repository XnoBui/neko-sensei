"use client";

// client-side LRU of decoded blob URLs, keyed by text.
// repeat plays during a session are instant and cost nothing.
const urlCache = new Map<string, string>();
const MAX_URLS = 200;

function urlCacheGet(key: string) {
  const hit = urlCache.get(key);
  if (!hit) return null;
  urlCache.delete(key);
  urlCache.set(key, hit);
  return hit;
}

function urlCacheSet(key: string, value: string) {
  if (urlCache.size >= MAX_URLS) {
    const firstKey = urlCache.keys().next().value;
    if (firstKey) {
      const old = urlCache.get(firstKey);
      if (old) URL.revokeObjectURL(old);
      urlCache.delete(firstKey);
    }
  }
  urlCache.set(key, value);
}

// if ElevenLabs has failed once (e.g. no key), stop retrying for the session
let elevenDisabled = false;
let currentAudio: HTMLAudioElement | null = null;

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

async function fetchTts(text: string): Promise<string | null> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      // 503 = no key configured. Don't retry this session.
      if (res.status === 503) elevenDisabled = true;
      return null;
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function speakJa(text: string) {
  if (!text) return;
  if (typeof window === "undefined") return;

  // stop whatever is currently playing
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

  let url = urlCacheGet(text);
  if (!url) {
    url = await fetchTts(text);
    if (!url) {
      browserSpeak(text);
      return;
    }
    urlCacheSet(text, url);
  }

  const audio = new Audio(url);
  audio.playbackRate = 0.95;
  currentAudio = audio;
  try {
    await audio.play();
  } catch {
    // autoplay blocked or decode error — fall back
    browserSpeak(text);
  }
}
