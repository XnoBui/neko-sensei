"use client";

import { useEffect, useMemo, useState } from "react";
import { hiragana, katakana, type KanaPair } from "@/data/kana";
import { getKanaStats, setKanaStats, type KanaStats } from "@/lib/progress";
import { speakJa } from "@/lib/speak";

type Set = "hiragana" | "katakana";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices(target: KanaPair, pool: KanaPair[]): string[] {
  const wrong = shuffle(pool.filter((p) => p.romaji !== target.romaji)).slice(0, 3).map((p) => p.romaji);
  return shuffle([target.romaji, ...wrong]);
}

export default function KanaPage() {
  const [set, setSet] = useState<Set>("hiragana");
  const pool = set === "hiragana" ? hiragana : katakana;

  const [current, setCurrent] = useState<KanaPair>(pool[0]);
  const [choices, setChoices] = useState<string[]>([]);
  const [answered, setAnswered] = useState<string | null>(null);
  const [stats, setStatsState] = useState<KanaStats>({ correct: 0, wrong: 0, streak: 0, best: 0 });

  useEffect(() => {
    setStatsState(getKanaStats(set));
    next(pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set]);

  const accuracy = useMemo(() => {
    const total = stats.correct + stats.wrong;
    return total === 0 ? 0 : Math.round((stats.correct / total) * 100);
  }, [stats]);

  function next(p: KanaPair[] = pool) {
    const target = p[Math.floor(Math.random() * p.length)];
    setCurrent(target);
    setChoices(buildChoices(target, p));
    setAnswered(null);
  }

  function pick(choice: string) {
    if (answered) return;
    setAnswered(choice);
    speakJa(current.kana);
    const correct = choice === current.romaji;
    const newStats: KanaStats = correct
      ? { ...stats, correct: stats.correct + 1, streak: stats.streak + 1, best: Math.max(stats.best, stats.streak + 1) }
      : { ...stats, wrong: stats.wrong + 1, streak: 0 };
    setStatsState(newStats);
    setKanaStats(set, newStats);
    setTimeout(() => next(), correct ? 650 : 1200);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-sakura-700">Kana Drill</h1>
        <div className="flex gap-1 bg-white rounded-full p-1 border border-sakura-200">
          {(["hiragana", "katakana"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSet(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                set === s ? "bg-sakura-500 text-white" : "text-sakura-700 hover:bg-sakura-50"
              }`}
            >
              {s === "hiragana" ? "ひらがな" : "カタカナ"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="card !p-3"><div className="text-2xl font-bold text-matcha-600">{stats.correct}</div><div className="text-sakura-900/70">Correct</div></div>
        <div className="card !p-3"><div className="text-2xl font-bold text-sakura-600">{accuracy}%</div><div className="text-sakura-900/70">Accuracy</div></div>
        <div className="card !p-3"><div className="text-2xl font-bold text-sakura-600">🔥 {stats.streak}</div><div className="text-sakura-900/70">Streak (best {stats.best})</div></div>
      </div>

      <div className="card flex flex-col items-center gap-6 py-10">
        <button
          onClick={() => speakJa(current.kana)}
          title="Hear it"
          className="jp-big text-sakura-700 hover:scale-110 transition"
        >
          {current.kana}
        </button>
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {choices.map((c) => {
            const isCorrect = c === current.romaji;
            const picked = answered === c;
            const showColor =
              answered && (isCorrect ? "bg-matcha-500 text-white border-matcha-600" : picked ? "bg-sakura-400 text-white border-sakura-500" : "");
            return (
              <button
                key={c}
                onClick={() => pick(c)}
                disabled={!!answered}
                className={`rounded-xl border border-sakura-200 py-3 font-bold text-lg transition ${
                  showColor || "bg-white hover:bg-sakura-50 text-sakura-800"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <button onClick={() => next()} className="btn-ghost text-sm">Skip →</button>
      </div>
    </div>
  );
}
