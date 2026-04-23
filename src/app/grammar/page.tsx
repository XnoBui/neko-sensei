"use client";

import { useEffect, useMemo, useState } from "react";
import { grammar, type GrammarLesson } from "@/data/grammar";
import { speakJa } from "@/lib/speak";

const PREFIX = "neko-sensei:grammar:";

type LessonStats = { correct: number; wrong: number; completed: boolean };
type AllStats = Record<string, LessonStats>;

function loadStats(): AllStats {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PREFIX + "stats");
    return raw ? (JSON.parse(raw) as AllStats) : {};
  } catch {
    return {};
  }
}

function saveStats(s: AllStats) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + "stats", JSON.stringify(s));
  } catch {
    // ignore
  }
}

const categoryLabels: Record<GrammarLesson["category"], string> = {
  basics: "Basics",
  particles: "Particles",
  verbs: "Verbs",
  adjectives: "Adjectives",
  connectors: "Connectors",
};

export default function GrammarPage() {
  const [stats, setStats] = useState<AllStats>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const byCategory = useMemo(() => {
    const groups: Record<string, GrammarLesson[]> = {};
    for (const lesson of grammar) {
      (groups[lesson.category] ??= []).push(lesson);
    }
    return groups;
  }, []);

  const activeLesson = activeId ? grammar.find((g) => g.id === activeId) : null;

  function recordDrill(lessonId: string, correct: boolean, completed: boolean) {
    setStats((prev) => {
      const cur = prev[lessonId] ?? { correct: 0, wrong: 0, completed: false };
      const next: LessonStats = {
        correct: cur.correct + (correct ? 1 : 0),
        wrong: cur.wrong + (correct ? 0 : 1),
        completed: cur.completed || completed,
      };
      const out = { ...prev, [lessonId]: next };
      saveStats(out);
      return out;
    });
  }

  if (activeLesson) {
    return (
      <LessonView
        lesson={activeLesson}
        stats={stats[activeLesson.id]}
        onBack={() => setActiveId(null)}
        onDrill={(ok, done) => recordDrill(activeLesson.id, ok, done)}
      />
    );
  }

  const completedCount = Object.values(stats).filter((s) => s.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="ios-title text-ios-label">Grammar</h1>
        <div className="text-sm text-ios-label3">
          <span className="font-semibold text-ios-label">{completedCount}</span> / {grammar.length} completed
        </div>
      </div>

      <p className="text-ios-label2 text-[15px] leading-relaxed">
        The core N5 grammar patterns. Read the explanation, study the examples, then
        drill the fill-in-the-blank questions. Mastery beats speed.
      </p>

      {Object.keys(categoryLabels).map((cat) => {
        const lessons = byCategory[cat];
        if (!lessons?.length) return null;
        return (
          <section key={cat} className="space-y-2">
            <h2 className="text-sm uppercase tracking-wide text-ios-label3 font-semibold px-1">
              {categoryLabels[cat as GrammarLesson["category"]]}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {lessons.map((l) => {
                const s = stats[l.id];
                const done = s?.completed;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveId(l.id)}
                    className="card text-left hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="font-jp text-ios-blue text-sm font-semibold">{l.pattern}</div>
                      {done && (
                        <span className="text-[10px] uppercase tracking-wide text-ios-green font-semibold">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <div className="text-ios-label font-semibold tracking-tight mb-1">{l.title}</div>
                    <div className="text-xs text-ios-label3 leading-relaxed">{l.summary}</div>
                    {s && (s.correct + s.wrong > 0) && (
                      <div className="text-[11px] text-ios-label3 mt-3">
                        {s.correct} correct · {s.wrong} wrong
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LessonView({
  lesson,
  stats,
  onBack,
  onDrill,
}: {
  lesson: GrammarLesson;
  stats?: LessonStats;
  onBack: () => void;
  onDrill: (correct: boolean, completed: boolean) => void;
}) {
  const [drillIdx, setDrillIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const drill = lesson.drills[drillIdx];
  const isLast = drillIdx === lesson.drills.length - 1;

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    onDrill(i === drill.answer, isLast && i === drill.answer);
  }

  function next() {
    setPicked(null);
    setDrillIdx((n) => (n + 1) % lesson.drills.length);
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="btn-ghost !px-3 !py-1.5 text-sm">
        ← Back to grammar
      </button>

      <div className="card space-y-3">
        <div className="font-jp text-ios-blue text-sm font-semibold">{lesson.pattern}</div>
        <h1 className="text-2xl font-bold tracking-tight text-ios-label">{lesson.title}</h1>
        <p className="text-ios-label2 text-[15px] leading-relaxed">{lesson.explanation}</p>
      </div>

      <section className="card space-y-3">
        <h2 className="text-sm uppercase tracking-wide text-ios-label3 font-semibold">
          Examples
        </h2>
        <ul className="space-y-3">
          {lesson.examples.map((ex) => (
            <li key={ex.jp} className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="font-jp text-ios-label text-lg leading-snug">{ex.jp}</div>
                <button
                  onClick={() => speakJa(ex.jp)}
                  className="btn-ghost !px-2 !py-1 text-xs shrink-0"
                  aria-label="Hear the sentence"
                >
                  🔊
                </button>
              </div>
              <div className="text-xs text-ios-label3">{ex.reading}</div>
              <div className="text-sm text-ios-label2">{ex.en}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-wide text-ios-label3 font-semibold">
            Drill {drillIdx + 1} / {lesson.drills.length}
          </h2>
          {stats && (
            <div className="text-[11px] text-ios-label3">
              {stats.correct} correct · {stats.wrong} wrong
            </div>
          )}
        </div>

        <div className="font-jp text-2xl text-ios-label text-center py-2">
          {drill.prompt}
        </div>
        <div className="text-center text-sm text-ios-label3">{drill.translation}</div>

        <div className="grid grid-cols-2 gap-2">
          {drill.choices.map((c, i) => {
            const isAnswer = i === drill.answer;
            const isPicked = picked === i;
            const show = picked !== null;
            let classes = "btn-ghost !py-3 font-jp text-lg";
            if (show && isAnswer) classes += " !bg-ios-green/20 !text-ios-green";
            else if (show && isPicked && !isAnswer) classes += " !bg-ios-red/20 !text-ios-red";
            return (
              <button key={i} onClick={() => choose(i)} className={classes} disabled={show}>
                {c}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="text-sm text-ios-label2 space-y-2">
            <div>
              {picked === drill.answer ? (
                <span className="text-ios-green font-semibold">Correct! ✓</span>
              ) : (
                <span className="text-ios-red font-semibold">
                  Not quite. Answer: {drill.choices[drill.answer]}
                </span>
              )}
            </div>
            {drill.explain && <div className="text-ios-label3 text-xs">{drill.explain}</div>}
            <button onClick={next} className="btn-primary !py-2 !px-5 text-sm">
              {isLast ? "Restart drills" : "Next →"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
