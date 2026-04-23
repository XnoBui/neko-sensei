"use client";

import { useEffect, useMemo, useState } from "react";
import { vocab, type VocabItem } from "@/data/vocab";
import { prefetchJa, speakJa } from "@/lib/speak";
import {
  buildQueue,
  computeStats,
  getDeck,
  reviewCard,
  STEP_INTERVALS_MS,
  formatDueIn,
  type SrsDeck,
  type SrsResult,
  type SrsStats,
} from "@/lib/srs";

const DECK_KEY = "vocab";

const categories: Array<VocabItem["category"] | "all"> = [
  "all",
  "greetings",
  "people",
  "family",
  "food",
  "numbers",
  "counters",
  "time",
  "days",
  "months",
  "places",
  "transport",
  "directions",
  "verbs",
  "adjectives",
  "colors",
  "body",
  "weather",
  "nature",
  "animals",
  "objects",
  "school",
  "questions",
];

export default function VocabPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState<SrsDeck>({});
  const [queue, setQueue] = useState<string[]>([]);

  const filtered = useMemo(
    () => (category === "all" ? vocab : vocab.filter((v) => v.category === category)),
    [category],
  );
  const byId = useMemo(() => {
    const m = new Map<string, VocabItem>();
    for (const v of vocab) m.set(v.word, v);
    return m;
  }, []);

  useEffect(() => {
    const d = getDeck(DECK_KEY);
    setDeck(d);
    setQueue(buildQueue(d, filtered.map((v) => v.word), { newPerSession: 15 }));
    setFlipped(false);
  }, [filtered]);

  const stats: SrsStats = useMemo(
    () => computeStats(deck, vocab.map((v) => v.word)),
    [deck],
  );
  const filteredStats: SrsStats = useMemo(
    () => computeStats(deck, filtered.map((v) => v.word)),
    [deck, filtered],
  );

  const currentId = queue[0];
  const card = currentId ? byId.get(currentId) : undefined;
  const cardState = currentId ? deck[currentId] : undefined;

  // Warm audio for the current card + the next one, so the Play button is instant.
  useEffect(() => {
    if (card?.word) prefetchJa(card.word);
    const nextId = queue[1];
    const nextCard = nextId ? byId.get(nextId) : undefined;
    if (nextCard?.word) prefetchJa(nextCard.word);
  }, [card, queue, byId]);

  function review(result: SrsResult) {
    if (!currentId) return;
    const next = reviewCard(DECK_KEY, currentId, result);
    setDeck(next);
    const remaining = queue.slice(1);
    if (remaining.length === 0) {
      setQueue(buildQueue(next, filtered.map((v) => v.word), { newPerSession: 15 }));
    } else {
      setQueue(remaining);
    }
    setFlipped(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="ios-title text-ios-label">Vocab Flashcards</h1>
        <div className="text-xs text-ios-label3 flex gap-3 flex-wrap">
          <span><span className="font-semibold text-ios-blue">{filteredStats.due}</span> due</span>
          <span><span className="font-semibold text-ios-orange">{filteredStats.learning}</span> learning</span>
          <span><span className="font-semibold text-ios-green">{stats.known}</span>/{vocab.length} known</span>
          <span><span className="font-semibold text-ios-label2">{filteredStats.newLeft}</span> new</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} data-active={category === c} onClick={() => setCategory(c)} className="chip capitalize">
            {c}
          </button>
        ))}
      </div>

      {card ? (
        <>
          <div
            onClick={() => setFlipped((f) => !f)}
            className="card relative cursor-pointer select-none min-h-[300px] flex flex-col items-center justify-center text-center py-10"
          >
            {!flipped ? (
              <>
                <div className="jp-big text-ios-label">{card.word}</div>
                <p className="mt-5 text-ios-label3 text-sm">Tap to reveal meaning</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold tracking-tight text-ios-label mb-2">{card.meaning}</div>
                <div className="font-jp text-3xl text-ios-label">{card.word}</div>
                <div className="text-ios-label3 mt-1 text-sm">{card.reading}</div>
              </>
            )}
            <div className="absolute top-3 left-3 text-[11px] text-ios-label3">
              {cardState
                ? `step ${cardState.step} · ${cardState.reviews} reviews`
                : "new card"}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakJa(card.word);
              }}
              className="absolute top-3 right-3 btn-ghost !px-3 !py-1.5 text-sm"
              aria-label="Hear the word"
            >
              🔊 Play
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => review("again")} className="btn-ghost !py-3 flex flex-col items-center">
              <span className="font-semibold text-ios-red">Again</span>
              <span className="text-[11px] text-ios-label3">{formatDueIn(STEP_INTERVALS_MS[0])}</span>
            </button>
            <button onClick={() => review("good")} className="btn-primary !py-3 flex flex-col items-center">
              <span className="font-semibold">Good</span>
              <span className="text-[11px] opacity-80">
                {formatDueIn(STEP_INTERVALS_MS[Math.min(STEP_INTERVALS_MS.length - 1, (cardState?.step ?? 0) + 1)])}
              </span>
            </button>
            <button onClick={() => review("easy")} className="btn-ghost !py-3 flex flex-col items-center">
              <span className="font-semibold text-ios-green">Easy</span>
              <span className="text-[11px] text-ios-label3">
                {formatDueIn(STEP_INTERVALS_MS[Math.min(STEP_INTERVALS_MS.length - 1, (cardState?.step ?? 0) + 2)])}
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-lg font-semibold text-ios-label">All caught up!</div>
          <p className="text-sm text-ios-label3 mt-2">
            No cards due right now in this category. Come back later or pick another deck.
          </p>
        </div>
      )}
    </div>
  );
}
