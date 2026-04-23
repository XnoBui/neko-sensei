// Builds a randomized N5 mock-test session from the existing decks.
// The real JLPT N5 mixes kanji readings, vocabulary meaning, and grammar.
// We generate a balanced sample with the same question types.

import { kanji, type KanjiItem } from "@/data/kanji";
import { vocab, type VocabItem } from "@/data/vocab";
import { grammar, type GrammarDrill } from "@/data/grammar";

export type MockType =
  | "kanji-reading"     // see kanji → pick reading
  | "kanji-meaning"     // see kanji → pick English meaning
  | "vocab-meaning"     // see JP word → pick English meaning
  | "vocab-from-en"     // see English → pick JP word
  | "listening"         // hear JP (TTS) → pick English meaning
  | "grammar";          // grammar fill-in drill

export type MockQuestion = {
  id: string;
  type: MockType;
  prompt: string;
  promptKanji?: string;      // for listening: the JP to speak
  subPrompt?: string;        // e.g. English translation shown under grammar blanks
  choices: string[];
  answer: number;
  explain?: string;
};

export type MockResult = {
  startedAt: number;
  durationMs: number;
  total: number;
  correct: number;
  byType: Record<MockType, { correct: number; total: number }>;
  wrong: Array<{ q: MockQuestion; picked: number }>;
};

const RESULTS_KEY = "neko-sensei:mock:history";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function firstReading(k: KanjiItem): string {
  // Prefer a kun reading when available, else on, else first example reading.
  if (k.kunyomi[0]) return k.kunyomi[0].replace(/\(.*\)/g, "");
  if (k.onyomi[0]) return k.onyomi[0];
  return k.examples[0]?.reading ?? "?";
}

function distractorReadings(correct: string, pool: KanjiItem[], count: number): string[] {
  const used = new Set<string>([correct]);
  const candidates: string[] = [];
  for (const k of shuffle(pool)) {
    for (const r of [...k.kunyomi, ...k.onyomi]) {
      const clean = r.replace(/\(.*\)/g, "");
      if (!clean || used.has(clean)) continue;
      used.add(clean);
      candidates.push(clean);
      if (candidates.length >= count) return candidates;
    }
  }
  while (candidates.length < count) candidates.push("—");
  return candidates;
}

function distractorMeanings(correct: string, pool: Array<{ meaning: string }>, count: number): string[] {
  const used = new Set<string>([correct]);
  const out: string[] = [];
  for (const item of shuffle(pool)) {
    if (used.has(item.meaning)) continue;
    used.add(item.meaning);
    out.push(item.meaning);
    if (out.length >= count) break;
  }
  while (out.length < count) out.push("—");
  return out;
}

function distractorWords(correct: string, pool: Array<{ word: string }>, count: number): string[] {
  const used = new Set<string>([correct]);
  const out: string[] = [];
  for (const item of shuffle(pool)) {
    if (used.has(item.word)) continue;
    used.add(item.word);
    out.push(item.word);
    if (out.length >= count) break;
  }
  while (out.length < count) out.push("—");
  return out;
}

function buildChoices(correct: string, distractors: string[]): { choices: string[]; answer: number } {
  const all = shuffle([correct, ...distractors]);
  return { choices: all, answer: all.indexOf(correct) };
}

function makeKanjiReading(k: KanjiItem, i: number): MockQuestion {
  const correct = firstReading(k);
  const { choices, answer } = buildChoices(correct, distractorReadings(correct, kanji, 3));
  return {
    id: `kr-${i}-${k.kanji}`,
    type: "kanji-reading",
    prompt: k.kanji,
    subPrompt: "Pick the reading",
    choices,
    answer,
    explain: `${k.kanji} = ${k.meaning}`,
  };
}

function makeKanjiMeaning(k: KanjiItem, i: number): MockQuestion {
  const { choices, answer } = buildChoices(k.meaning, distractorMeanings(k.meaning, kanji, 3));
  return {
    id: `km-${i}-${k.kanji}`,
    type: "kanji-meaning",
    prompt: k.kanji,
    subPrompt: "Pick the meaning",
    choices,
    answer,
    explain: `Reading: ${firstReading(k)}`,
  };
}

function makeVocabMeaning(v: VocabItem, i: number): MockQuestion {
  const { choices, answer } = buildChoices(v.meaning, distractorMeanings(v.meaning, vocab, 3));
  return {
    id: `vm-${i}-${v.word}`,
    type: "vocab-meaning",
    prompt: v.word,
    subPrompt: v.reading,
    choices,
    answer,
    explain: `${v.word} (${v.reading}) — ${v.meaning}`,
  };
}

function makeVocabFromEn(v: VocabItem, i: number): MockQuestion {
  const { choices, answer } = buildChoices(v.word, distractorWords(v.word, vocab, 3));
  return {
    id: `ve-${i}-${v.word}`,
    type: "vocab-from-en",
    prompt: v.meaning,
    subPrompt: "Pick the Japanese word",
    choices,
    answer,
    explain: `${v.word} (${v.reading})`,
  };
}

function makeListening(v: VocabItem, i: number): MockQuestion {
  const { choices, answer } = buildChoices(v.meaning, distractorMeanings(v.meaning, vocab, 3));
  return {
    id: `ls-${i}-${v.word}`,
    type: "listening",
    prompt: "🔊 Listen and pick the meaning",
    promptKanji: v.word,
    subPrompt: "Press play to hear again",
    choices,
    answer,
    explain: `${v.word} (${v.reading}) — ${v.meaning}`,
  };
}

function makeGrammar(d: GrammarDrill, i: number): MockQuestion {
  return {
    id: `g-${i}-${d.prompt}`,
    type: "grammar",
    prompt: d.prompt,
    subPrompt: d.translation,
    choices: d.choices,
    answer: d.answer,
    explain: d.explain,
  };
}

export function generateMock(questionCount: number = 20): MockQuestion[] {
  // Aim for a balanced mix:
  //   ~25% kanji reading, ~15% kanji meaning, ~25% vocab meaning,
  //   ~15% vocab from English, ~10% listening, ~10% grammar.
  const plan: Array<[MockType, number]> = [
    ["kanji-reading", Math.round(questionCount * 0.25)],
    ["kanji-meaning", Math.round(questionCount * 0.15)],
    ["vocab-meaning", Math.round(questionCount * 0.25)],
    ["vocab-from-en", Math.round(questionCount * 0.15)],
    ["listening", Math.round(questionCount * 0.1)],
    ["grammar", Math.round(questionCount * 0.1)],
  ];
  // Adjust rounding drift
  let sum = plan.reduce((a, [, n]) => a + n, 0);
  while (sum < questionCount) { plan[0][1] += 1; sum += 1; }
  while (sum > questionCount) { plan[0][1] -= 1; sum -= 1; }

  const kanjiPool = shuffle(kanji);
  const vocabPool = shuffle(vocab);
  const grammarDrills: GrammarDrill[] = grammar.flatMap((g) => g.drills);

  const questions: MockQuestion[] = [];
  let kIdx = 0;
  let vIdx = 0;

  for (const [type, n] of plan) {
    for (let i = 0; i < n; i++) {
      switch (type) {
        case "kanji-reading":
          questions.push(makeKanjiReading(kanjiPool[kIdx++ % kanjiPool.length], questions.length));
          break;
        case "kanji-meaning":
          questions.push(makeKanjiMeaning(kanjiPool[kIdx++ % kanjiPool.length], questions.length));
          break;
        case "vocab-meaning":
          questions.push(makeVocabMeaning(vocabPool[vIdx++ % vocabPool.length], questions.length));
          break;
        case "vocab-from-en":
          questions.push(makeVocabFromEn(vocabPool[vIdx++ % vocabPool.length], questions.length));
          break;
        case "listening":
          questions.push(makeListening(vocabPool[vIdx++ % vocabPool.length], questions.length));
          break;
        case "grammar": {
          const d = grammarDrills[Math.floor(Math.random() * grammarDrills.length)];
          questions.push(makeGrammar(d, questions.length));
          break;
        }
      }
    }
  }

  return shuffle(questions);
}

export function saveResult(result: MockResult) {
  if (typeof window === "undefined") return;
  try {
    const prev = loadHistory();
    const next = [result, ...prev].slice(0, 20);
    window.localStorage.setItem(RESULTS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function loadHistory(): MockResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESULTS_KEY);
    return raw ? (JSON.parse(raw) as MockResult[]) : [];
  } catch {
    return [];
  }
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export const QUESTION_TYPE_LABELS: Record<MockType, string> = {
  "kanji-reading": "Kanji reading",
  "kanji-meaning": "Kanji meaning",
  "vocab-meaning": "Vocab meaning",
  "vocab-from-en": "English → JP",
  listening: "Listening",
  grammar: "Grammar",
};
