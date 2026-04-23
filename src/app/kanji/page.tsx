"use client";

import { useEffect, useMemo, useState } from "react";
import { kanji, type KanjiItem } from "@/data/kanji";
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

const DECK_KEY = "kanji";

const categories: Array<KanjiItem["category"] | "all"> = [
  "all",
  "numbers",
  "time",
  "people",
  "directions",
  "body",
  "nature",
  "verbs",
  "descriptive",
  "things",
];

export default function KanjiPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState<SrsDeck>({});
  const [queue, setQueue] = useState<string[]>([]);

  const filtered = useMemo(
    () => (category === "all" ? kanji : kanji.filter((k) => k.category === category)),
    [category],
  );
  const byId = useMemo(() => {
    const m = new Map<string, KanjiItem>();
    for (const k of kanji) m.set(k.kanji, k);
    return m;
  }, []);

  useEffect(() => {
    const d = getDeck(DECK_KEY);
    setDeck(d);
    setQueue(buildQueue(d, filtered.map((k) => k.kanji), { newPerSession: 8 }));
    setFlipped(false);
  }, [filtered]);

  const stats: SrsStats = useMemo(
    () => computeStats(deck, kanji.map((k) => k.kanji)),
    [deck],
  );
  const filteredStats: SrsStats = useMemo(
    () => computeStats(deck, filtered.map((k) => k.kanji)),
    [deck, filtered],
  );

  const currentId = queue[0];
  const card = currentId ? byId.get(currentId) : undefined;
  const cardState = currentId ? deck[currentId] : undefined;

  // Warm audio for the current card + the next one so the Play tap is instant.
  // Kanji audio uses the first example word (same phrase the Play button speaks).
  useEffect(() => {
    const phrase = card?.examples[0]?.word ?? card?.kanji;
    if (phrase) prefetchJa(phrase);
    const nextId = queue[1];
    const nextCard = nextId ? byId.get(nextId) : undefined;
    const nextPhrase = nextCard?.examples[0]?.word ?? nextCard?.kanji;
    if (nextPhrase) prefetchJa(nextPhrase);
  }, [card, queue, byId]);

  function review(result: SrsResult) {
    if (!currentId) return;
    const next = reviewCard(DECK_KEY, currentId, result);
    setDeck(next);
    const remaining = queue.slice(1);
    if (remaining.length === 0) {
      setQueue(buildQueue(next, filtered.map((k) => k.kanji), { newPerSession: 8 }));
    } else {
      setQueue(remaining);
    }
    setFlipped(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="ios-title text-ios-label">Kanji Study</h1>
        <div className="text-xs text-ios-label3 flex gap-3 flex-wrap">
          <span><span className="font-semibold text-ios-blue">{filteredStats.due}</span> due</span>
          <span><span className="font-semibold text-ios-orange">{filteredStats.learning}</span> learning</span>
          <span><span className="font-semibold text-ios-green">{stats.known}</span>/{kanji.length} known</span>
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
            className="card relative cursor-pointer select-none min-h-[360px] flex flex-col items-center justify-center text-center py-10"
          >
            {!flipped ? (
              <>
                <div className="font-jp text-ios-label" style={{ fontSize: "9rem", lineHeight: 1 }}>
                  {card.kanji}
                </div>
                <div className="mt-3 text-xs text-ios-label3">{card.strokes} strokes</div>
                <p className="mt-4 text-ios-label3 text-sm">Tap to reveal reading & meaning</p>
              </>
            ) : (
              <div className="w-full max-w-md space-y-4">
                <div className="font-jp text-7xl text-ios-label">{card.kanji}</div>
                <div className="text-2xl font-semibold tracking-tight text-ios-label">{card.meaning}</div>
                <div className="grid grid-cols-2 gap-3 text-left text-sm">
                  <div className="card !p-3 !shadow-none bg-white/60">
                    <div className="text-[11px] uppercase tracking-wide text-ios-label3 mb-1">On'yomi</div>
                    <div className="text-ios-label">
                      {card.onyomi.length ? card.onyomi.join(" ・ ") : "—"}
                    </div>
                  </div>
                  <div className="card !p-3 !shadow-none bg-white/60">
                    <div className="text-[11px] uppercase tracking-wide text-ios-label3 mb-1">Kun'yomi</div>
                    <div className="text-ios-label">
                      {card.kunyomi.length ? card.kunyomi.join(" ・ ") : "—"}
                    </div>
                  </div>
                </div>
                {card.examples.length > 0 && (
                  <div className="text-left">
                    <div className="text-[11px] uppercase tracking-wide text-ios-label3 mb-1">Examples</div>
                    <ul className="space-y-1.5">
                      {card.examples.map((ex) => (
                        <li key={ex.word} className="flex items-baseline justify-between gap-3">
                          <span className="font-jp text-ios-label">{ex.word}</span>
                          <span className="text-ios-label2 text-xs">{ex.reading}</span>
                          <span className="text-ios-label3 text-xs flex-1 text-right truncate">
                            {ex.meaning}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="absolute top-3 left-3 text-[11px] text-ios-label3">
              {cardState
                ? `step ${cardState.step} · ${cardState.reviews} reviews`
                : "new card"}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const phrase = card.examples[0]?.word ?? card.kanji;
                speakJa(phrase);
              }}
              className="absolute top-3 right-3 btn-ghost !px-3 !py-1.5 text-sm"
              aria-label="Hear the kanji"
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
