"use client";

import { useEffect, useMemo, useState } from "react";
import { vocab, type VocabItem } from "@/data/vocab";
import { getVocabStats, setVocabStats, type VocabStats } from "@/lib/progress";
import { speakJa } from "@/lib/speak";

const categories: Array<VocabItem["category"] | "all"> = [
  "all", "greetings", "people", "food", "numbers", "time", "places", "verbs",
];

export default function VocabPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStatsState] = useState<VocabStats>({ seen: [], known: [] });

  useEffect(() => {
    setStatsState(getVocabStats());
  }, []);

  const deck = useMemo(
    () => (category === "all" ? vocab : vocab.filter((v) => v.category === category)),
    [category],
  );

  useEffect(() => {
    setIdx(0);
    setFlipped(false);
  }, [category]);

  const card = deck[idx % deck.length];

  function mark(known: boolean) {
    const newStats: VocabStats = {
      seen: Array.from(new Set([...stats.seen, card.word])),
      known: known
        ? Array.from(new Set([...stats.known, card.word]))
        : stats.known.filter((w) => w !== card.word),
    };
    setStatsState(newStats);
    setVocabStats(newStats);
    setFlipped(false);
    setIdx((i) => (i + 1) % deck.length);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="ios-title text-ios-label">Vocab Flashcards</h1>
        <div className="text-sm text-ios-label3">
          <span className="font-semibold text-ios-label">{stats.known.length}</span> / {vocab.length} known
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} data-active={category === c} onClick={() => setCategory(c)} className="chip capitalize">
            {c}
          </button>
        ))}
      </div>

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

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => mark(false)} className="btn-ghost !py-3">Still learning</button>
        <button onClick={() => mark(true)} className="btn-primary !py-3">I know it ✓</button>
      </div>
    </div>
  );
}
