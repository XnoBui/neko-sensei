"use client";

const PREFIX = "neko-sensei:";

export type KanaStats = { correct: number; wrong: number; streak: number; best: number };
export type VocabStats = { seen: string[]; known: string[] };

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function getKanaStats(set: "hiragana" | "katakana"): KanaStats {
  return safeGet(`kana:${set}`, { correct: 0, wrong: 0, streak: 0, best: 0 });
}

export function setKanaStats(set: "hiragana" | "katakana", stats: KanaStats) {
  safeSet(`kana:${set}`, stats);
}

export function getVocabStats(): VocabStats {
  return safeGet("vocab", { seen: [], known: [] });
}

export function setVocabStats(stats: VocabStats) {
  safeSet("vocab", stats);
}
