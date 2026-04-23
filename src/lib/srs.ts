"use client";

// Tiny beginner-friendly SRS (inspired by SuperMemo/Leitner).
// Each card sits on a "step"; pressing Good advances it to the next step,
// Easy skips an extra step, Again drops it back to step 0 (short re-queue).

const PREFIX = "neko-sensei:srs:";

export type SrsResult = "again" | "good" | "easy";

export type SrsCard = {
  id: string;
  step: number;        // 0 = new / relearning
  dueAt: number;       // ms since epoch
  lastReviewed: number | null;
  reviews: number;     // total successful reviews
};

export type SrsDeck = Record<string, SrsCard>;

// Intervals in milliseconds. Step 0 = "again" queue (10 min).
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
export const STEP_INTERVALS_MS: number[] = [
  10 * MIN,   // 0 — just failed / brand new
  1 * DAY,    // 1
  3 * DAY,    // 2
  7 * DAY,    // 3
  14 * DAY,   // 4
  30 * DAY,   // 5
  90 * DAY,   // 6 — mature
  180 * DAY,  // 7 — known
];

const MAX_STEP = STEP_INTERVALS_MS.length - 1;

export function getDeck(deckKey: string): SrsDeck {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PREFIX + deckKey);
    return raw ? (JSON.parse(raw) as SrsDeck) : {};
  } catch {
    return {};
  }
}

export function saveDeck(deckKey: string, deck: SrsDeck) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + deckKey, JSON.stringify(deck));
  } catch {
    // ignore quota errors
  }
}

export function reviewCard(
  deckKey: string,
  id: string,
  result: SrsResult,
  now: number = Date.now(),
): SrsDeck {
  const deck = getDeck(deckKey);
  const prev = deck[id] ?? { id, step: 0, dueAt: now, lastReviewed: null, reviews: 0 };

  let nextStep = prev.step;
  let reviews = prev.reviews;

  if (result === "again") {
    nextStep = 0;
  } else if (result === "good") {
    nextStep = Math.min(MAX_STEP, prev.step + 1);
    reviews += 1;
  } else {
    // easy: skip an extra step
    nextStep = Math.min(MAX_STEP, prev.step + 2);
    reviews += 1;
  }

  const interval = STEP_INTERVALS_MS[nextStep];
  deck[id] = {
    id,
    step: nextStep,
    dueAt: now + interval,
    lastReviewed: now,
    reviews,
  };
  saveDeck(deckKey, deck);
  return deck;
}

/**
 * Queue strategy for a session:
 *   1. Cards currently due (dueAt <= now), oldest-due first
 *   2. Then up to `newPerSession` cards the user hasn't seen yet
 * Falls back to least-recently-due cards if nothing is strictly due,
 * so the user always has something to study.
 */
export function buildQueue(
  deck: SrsDeck,
  allIds: string[],
  opts: { newPerSession?: number; now?: number } = {},
): string[] {
  const now = opts.now ?? Date.now();
  const newPerSession = opts.newPerSession ?? 10;

  const due: SrsCard[] = [];
  const unseen: string[] = [];
  for (const id of allIds) {
    const card = deck[id];
    if (!card) {
      unseen.push(id);
    } else if (card.dueAt <= now) {
      due.push(card);
    }
  }
  due.sort((a, b) => a.dueAt - b.dueAt);

  const queue = [...due.map((c) => c.id), ...unseen.slice(0, newPerSession)];
  if (queue.length > 0) return queue;

  // Nothing due and no new cards left — fall back to the earliest-due seen cards
  // so the user can still drill. Dedupes with Set to avoid accidental loops.
  const ordered = allIds
    .map((id) => deck[id])
    .filter((c): c is SrsCard => Boolean(c))
    .sort((a, b) => a.dueAt - b.dueAt)
    .map((c) => c.id);
  return Array.from(new Set(ordered));
}

export type SrsStats = {
  total: number;
  due: number;
  learning: number;  // step 1..3
  known: number;     // step >= 4
  newLeft: number;   // never seen
};

export function computeStats(
  deck: SrsDeck,
  allIds: string[],
  now: number = Date.now(),
): SrsStats {
  let due = 0;
  let learning = 0;
  let known = 0;
  let newLeft = 0;
  for (const id of allIds) {
    const card = deck[id];
    if (!card) {
      newLeft += 1;
      continue;
    }
    if (card.dueAt <= now) due += 1;
    if (card.step >= 4) known += 1;
    else if (card.step >= 1) learning += 1;
  }
  return { total: allIds.length, due, learning, known, newLeft };
}

export function formatDueIn(ms: number): string {
  if (ms < MIN) return "now";
  if (ms < 60 * MIN) return `${Math.round(ms / MIN)}m`;
  if (ms < DAY) return `${Math.round(ms / (60 * MIN))}h`;
  if (ms < 30 * DAY) return `${Math.round(ms / DAY)}d`;
  return `${Math.round(ms / (30 * DAY))}mo`;
}
