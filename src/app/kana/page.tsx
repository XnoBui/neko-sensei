"use client";

import { useEffect, useMemo, useState } from "react";
import {
  hiragana,
  katakana,
  hiraganaGojuon,
  katakanaGojuon,
  hiraganaDakuon,
  katakanaDakuon,
  hiraganaHandakuon,
  katakanaHandakuon,
  hiraganaYoon,
  katakanaYoon,
  type KanaPair,
} from "@/data/kana";
import {
  getKanaCharStats,
  getKanaStats,
  kanaMastery,
  recordKanaChar,
  setKanaStats,
  type KanaCharStats,
  type KanaStats,
} from "@/lib/progress";
import { speakJa } from "@/lib/speak";

type Script = "hiragana" | "katakana" | "kanji";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices(target: KanaPair, pool: KanaPair[]): string[] {
  const uniqueRomaji = Array.from(new Set(pool.map((p) => p.romaji))).filter(
    (r) => r !== target.romaji,
  );
  const wrong = shuffle(uniqueRomaji).slice(0, 3);
  return shuffle([target.romaji, ...wrong]);
}

// --- overview tile -----------------------------------------------------------

function KanaTile({
  pair,
  mastery,
  highlighted,
  onClick,
}: {
  pair: KanaPair | null;
  mastery: number;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  if (!pair) {
    return (
      <div className="aspect-square rounded-ios bg-ios-fill2/50 border border-ios-strokeSoft/60" />
    );
  }
  const bg = highlighted
    ? "bg-ios-orange/15 border-ios-orange/60"
    : "bg-white/75 border-ios-stroke hover:bg-white";
  const textColor = highlighted ? "text-ios-orange" : "text-ios-label";
  const barColor = mastery >= 1 ? "bg-ios-green" : "bg-ios-orange";
  return (
    <button
      onClick={onClick}
      className={`group relative aspect-square rounded-ios border ${bg} backdrop-blur transition flex flex-col items-center justify-center gap-0.5 px-1.5 pt-2 pb-2.5`}
    >
      <span className={`font-jp text-[26px] leading-none ${textColor}`}>{pair.kana}</span>
      <span className="text-[10px] font-medium text-ios-label3 tracking-wide">
        {pair.romaji}
      </span>
      <span className="absolute left-2 right-2 bottom-1.5 h-1 rounded-full bg-ios-fill overflow-hidden">
        <span
          className={`block h-full ${barColor} transition-all`}
          style={{ width: `${Math.round(mastery * 100)}%` }}
        />
      </span>
    </button>
  );
}

function SectionGrid({
  items,
  cols,
  stats,
  highlights,
  onTile,
}: {
  items: (KanaPair | null)[];
  cols: number;
  stats: KanaCharStats;
  highlights: Set<string>;
  onTile: (p: KanaPair) => void;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map((p, i) => (
        <KanaTile
          key={i}
          pair={p}
          mastery={p ? kanaMastery(stats, p.kana) : 0}
          highlighted={!!p && highlights.has(p.kana)}
          onClick={p ? () => onTile(p) : undefined}
        />
      ))}
    </div>
  );
}

// --- drill overlay -----------------------------------------------------------

function DrillOverlay({
  script,
  pool,
  onClose,
  onProgress,
  initial,
}: {
  script: "hiragana" | "katakana";
  pool: KanaPair[];
  onClose: () => void;
  onProgress: () => void;
  initial?: KanaPair;
}) {
  const [current, setCurrent] = useState<KanaPair>(initial ?? pool[0]);
  const [choices, setChoices] = useState<string[]>(() => buildChoices(initial ?? pool[0], pool));
  const [answered, setAnswered] = useState<string | null>(null);
  const [stats, setStatsState] = useState<KanaStats>({ correct: 0, wrong: 0, streak: 0, best: 0 });

  useEffect(() => {
    setStatsState(getKanaStats(script));
  }, [script]);

  const accuracy = useMemo(() => {
    const total = stats.correct + stats.wrong;
    return total === 0 ? 0 : Math.round((stats.correct / total) * 100);
  }, [stats]);

  function next() {
    // weighted: prefer less-mastered characters
    const charStats = getKanaCharStats(script);
    const weights = pool.map((p) => {
      const m = kanaMastery(charStats, p.kana);
      return 1 + (1 - m) * 3;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) { idx = i; break; }
    }
    const target = pool[idx];
    setCurrent(target);
    setChoices(buildChoices(target, pool));
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
    setKanaStats(script, newStats);
    recordKanaChar(script, current.kana, correct);
    onProgress();
    setTimeout(() => next(), correct ? 650 : 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="card glass-strong w-full max-w-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="chip">
            {script === "hiragana" ? "ひらがな" : "カタカナ"} drill
          </div>
          <button onClick={onClose} className="btn-ghost !py-1.5 !px-3 text-sm">Close</button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="card !p-3">
            <div className="text-xl font-semibold text-ios-green">{stats.correct}</div>
            <div className="text-[11px] text-ios-label3 mt-0.5">Correct</div>
          </div>
          <div className="card !p-3">
            <div className="text-xl font-semibold text-ios-blue">{accuracy}%</div>
            <div className="text-[11px] text-ios-label3 mt-0.5">Accuracy</div>
          </div>
          <div className="card !p-3">
            <div className="text-xl font-semibold text-ios-orange">🔥 {stats.streak}</div>
            <div className="text-[11px] text-ios-label3 mt-0.5">best {stats.best}</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 py-4">
          <button
            onClick={() => speakJa(current.kana)}
            title="Hear it"
            className="jp-big text-ios-label hover:scale-105 transition-transform"
          >
            {current.kana}
          </button>
          <div className="grid grid-cols-2 gap-3 w-full">
            {choices.map((c) => {
              const isCorrect = c === current.romaji;
              const picked = answered === c;
              const base =
                "rounded-iosLg py-3.5 font-semibold text-lg transition border backdrop-blur";
              let state = "bg-white/70 border-ios-stroke text-ios-label hover:bg-white";
              if (answered) {
                if (isCorrect) state = "bg-ios-green text-white border-transparent";
                else if (picked) state = "bg-ios-red text-white border-transparent";
                else state = "bg-white/50 border-ios-strokeSoft text-ios-label3";
              }
              return (
                <button key={c} onClick={() => pick(c)} disabled={!!answered} className={`${base} ${state}`}>
                  {c}
                </button>
              );
            })}
          </div>
          <button onClick={() => next()} className="btn-ghost text-sm">Skip →</button>
        </div>
      </div>
    </div>
  );
}

// --- page --------------------------------------------------------------------

export default function KanaPage() {
  const [script, setScript] = useState<Script>("hiragana");
  const [drill, setDrill] = useState<{ initial?: KanaPair } | null>(null);
  const [charStatsHira, setCharStatsHira] = useState<KanaCharStats>({});
  const [charStatsKata, setCharStatsKata] = useState<KanaCharStats>({});

  function refreshStats() {
    setCharStatsHira(getKanaCharStats("hiragana"));
    setCharStatsKata(getKanaCharStats("katakana"));
  }

  useEffect(() => {
    refreshStats();
  }, []);

  const activeScript: "hiragana" | "katakana" | null =
    script === "kanji" ? null : script;

  const stats = script === "katakana" ? charStatsKata : charStatsHira;
  const gojuon = script === "katakana" ? katakanaGojuon : hiraganaGojuon;
  const dakuon = script === "katakana" ? katakanaDakuon : hiraganaDakuon;
  const handakuon = script === "katakana" ? katakanaHandakuon : hiraganaHandakuon;
  const yoon = script === "katakana" ? katakanaYoon : hiraganaYoon;

  const pool = script === "katakana" ? katakana : hiragana;

  // highlight the next few characters the user should focus on (lowest mastery)
  const focusSet = useMemo(() => {
    if (!activeScript) return new Set<string>();
    const ranked = [...pool].sort(
      (a, b) => kanaMastery(stats, a.kana) - kanaMastery(stats, b.kana),
    );
    const topN = ranked.slice(0, 5).filter((p) => kanaMastery(stats, p.kana) < 1);
    return new Set(topN.map((p) => p.kana));
  }, [pool, stats, activeScript]);

  const totalMastered = useMemo(() => {
    if (!activeScript) return 0;
    return pool.filter((p) => kanaMastery(stats, p.kana) >= 1).length;
  }, [pool, stats, activeScript]);

  function openDrill(initial?: KanaPair) {
    if (!activeScript) return;
    setDrill({ initial });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="ios-title text-ios-label">Characters</h1>
        {activeScript && (
          <div className="text-sm text-ios-label3">
            {totalMastered} / {pool.length} mastered
          </div>
        )}
      </div>

      {/* script tabs */}
      <div className="flex gap-6 border-b border-ios-strokeSoft">
        {(["hiragana", "katakana", "kanji"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScript(s)}
            className={`relative pb-2.5 text-sm font-bold tracking-wider uppercase transition ${
              script === s ? "text-ios-blue" : "text-ios-label3 hover:text-ios-label2"
            }`}
          >
            {s}
            {script === s && (
              <span className="absolute left-0 right-0 -bottom-px h-[3px] rounded-full bg-ios-blue" />
            )}
          </button>
        ))}
      </div>

      {activeScript ? (
        <>
          <button
            onClick={() => openDrill()}
            className="w-full btn-primary !rounded-iosLg !py-4 text-base tracking-wider"
          >
            LEARN THE CHARACTERS
          </button>

          <section className="space-y-3">
            <SectionGrid
              items={gojuon}
              cols={5}
              stats={stats}
              highlights={focusSet}
              onTile={(p) => openDrill(p)}
            />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-ios-label">Dakuon and Handakuon</h2>
              <p className="text-sm text-ios-label3">Add a symbol to change the sound</p>
            </div>
            <SectionGrid
              items={[...dakuon, ...handakuon]}
              cols={5}
              stats={stats}
              highlights={focusSet}
              onTile={(p) => openDrill(p)}
            />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-ios-label">Yōon</h2>
              <p className="text-sm text-ios-label3">Combine with small や・ゆ・よ</p>
            </div>
            <SectionGrid
              items={yoon}
              cols={3}
              stats={stats}
              highlights={focusSet}
              onTile={(p) => openDrill(p)}
            />
          </section>
        </>
      ) : (
        <div className="card text-center py-12 space-y-2">
          <div className="font-jp text-5xl text-ios-label">漢字</div>
          <div className="text-ios-label2 font-semibold">Kanji — coming soon</div>
          <p className="text-sm text-ios-label3 max-w-sm mx-auto">
            Start with Hiragana and Katakana first. Kanji practice lands in a future update.
          </p>
        </div>
      )}

      {drill && activeScript && (
        <DrillOverlay
          script={activeScript}
          pool={pool}
          initial={drill.initial}
          onClose={() => {
            setDrill(null);
            refreshStats();
          }}
          onProgress={refreshStats}
        />
      )}
    </div>
  );
}
