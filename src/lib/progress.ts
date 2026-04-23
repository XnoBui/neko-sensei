"use client";

const PREFIX = "neko-sensei:";

export type KanaStats = { correct: number; wrong: number; streak: number; best: number };
export type VocabStats = { seen: string[]; known: string[] };
// per-character correct count — maps to a 0..1 progress bar (caps at MASTERY_TARGET correct)
export type KanaCharStats = Record<string, { correct: number; wrong: number }>;

export const MASTERY_TARGET = 5;

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

export function getKanaCharStats(set: "hiragana" | "katakana"): KanaCharStats {
  return safeGet(`kana-char:${set}`, {} as KanaCharStats);
}

export function recordKanaChar(
  set: "hiragana" | "katakana",
  kana: string,
  correct: boolean,
): KanaCharStats {
  const all = getKanaCharStats(set);
  const prev = all[kana] ?? { correct: 0, wrong: 0 };
  all[kana] = correct
    ? { ...prev, correct: prev.correct + 1 }
    : { ...prev, wrong: prev.wrong + 1 };
  safeSet(`kana-char:${set}`, all);
  return all;
}

export function kanaMastery(stats: KanaCharStats, kana: string): number {
  const s = stats[kana];
  if (!s) return 0;
  return Math.min(1, s.correct / MASTERY_TARGET);
}

export function getVocabStats(): VocabStats {
  return safeGet("vocab", { seen: [], known: [] });
}

export function setVocabStats(stats: VocabStats) {
  safeSet("vocab", stats);
}

export type KanjiStats = { seen: string[]; known: string[] };

export function getKanjiStats(): KanjiStats {
  return safeGet("kanji", { seen: [], known: [] });
}

export function setKanjiStats(stats: KanjiStats) {
  safeSet("kanji", stats);
}
