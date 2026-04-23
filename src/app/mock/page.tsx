"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  generateMock,
  saveResult,
  loadHistory,
  formatDuration,
  QUESTION_TYPE_LABELS,
  type MockQuestion,
  type MockResult,
  type MockType,
} from "@/lib/mock";
import { speakJa } from "@/lib/speak";

type Phase = "intro" | "running" | "review";

const QUESTION_COUNTS = [10, 20, 30] as const;
const TIMER_PRESETS = [
  { label: "10 min", ms: 10 * 60 * 1000 },
  { label: "15 min", ms: 15 * 60 * 1000 },
  { label: "25 min", ms: 25 * 60 * 1000 },
  { label: "No timer", ms: 0 },
] as const;

export default function MockPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [idx, setIdx] = useState(0);
  const [questionCount, setQuestionCount] = useState<(typeof QUESTION_COUNTS)[number]>(20);
  const [durationMs, setDurationMs] = useState<number>(TIMER_PRESETS[1].ms);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [result, setResult] = useState<MockResult | null>(null);
  const [history, setHistory] = useState<MockResult[]>([]);

  // Initialize history once
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;

  // Timer
  useEffect(() => {
    if (phase !== "running" || durationMs === 0) return;
    const tick = () => {
      const remaining = startedAt + durationMs - Date.now();
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        // auto-submit on timeout
        finish();
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startedAt, durationMs]);

  function start() {
    const qs = generateMock(questionCount);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setIdx(0);
    setStartedAt(Date.now());
    setTimeLeft(durationMs);
    setResult(null);
    setPhase("running");
  }

  function answer(choiceIdx: number) {
    setAnswers((prev) => {
      const out = [...prev];
      out[idx] = choiceIdx;
      return out;
    });
  }

  function finish() {
    if (phaseRef.current !== "running") return;
    const endedAt = Date.now();
    const byType: MockResult["byType"] = {
      "kanji-reading": { correct: 0, total: 0 },
      "kanji-meaning": { correct: 0, total: 0 },
      "vocab-meaning": { correct: 0, total: 0 },
      "vocab-from-en": { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
    };
    const wrong: MockResult["wrong"] = [];
    let correct = 0;
    questions.forEach((q, i) => {
      byType[q.type].total += 1;
      if (answers[i] === q.answer) {
        correct += 1;
        byType[q.type].correct += 1;
      } else {
        wrong.push({ q, picked: answers[i] ?? -1 });
      }
    });
    const res: MockResult = {
      startedAt,
      durationMs: endedAt - startedAt,
      total: questions.length,
      correct,
      byType,
      wrong,
    };
    saveResult(res);
    setHistory(loadHistory());
    setResult(res);
    setPhase("review");
  }

  const current = questions[idx];
  const answered = answers.filter((a) => a !== null).length;
  const remaining = questions.length - idx - 1;

  if (phase === "intro") {
    return (
      <IntroView
        questionCount={questionCount}
        durationMs={durationMs}
        history={history}
        onChangeCount={setQuestionCount}
        onChangeDuration={setDurationMs}
        onStart={start}
      />
    );
  }

  if (phase === "review" && result) {
    return <ReviewView result={result} onRestart={() => setPhase("intro")} />;
  }

  if (!current) return null;

  const pickedForCurrent = answers[idx];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-ios-label2 font-medium">
          Question <span className="text-ios-label">{idx + 1}</span> / {questions.length}
          <span className="ml-3 text-ios-label3">{QUESTION_TYPE_LABELS[current.type]}</span>
        </div>
        <div className="flex items-center gap-3">
          {durationMs > 0 && (
            <div
              className={`text-sm font-semibold tabular-nums ${
                timeLeft < 60_000 ? "text-ios-red" : "text-ios-label"
              }`}
            >
              ⏱ {formatDuration(timeLeft)}
            </div>
          )}
          <button onClick={finish} className="btn-ghost !px-3 !py-1 text-xs">Submit</button>
        </div>
      </div>

      {/* progress bar */}
      <div className="h-1.5 rounded-full bg-ios-fill overflow-hidden">
        <div
          className="h-full bg-ios-blue transition-all"
          style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="card min-h-[260px] flex flex-col items-center justify-center text-center py-10 space-y-4">
        {current.type === "listening" ? (
          <>
            <div className="text-6xl mb-2">🔊</div>
            <button
              onClick={() => current.promptKanji && speakJa(current.promptKanji)}
              className="btn-primary"
            >
              Play audio
            </button>
          </>
        ) : (
          <div className="font-jp text-ios-label" style={{ fontSize: current.prompt.length > 8 ? "2rem" : "5rem", lineHeight: 1.1 }}>
            {current.prompt}
          </div>
        )}
        {current.subPrompt && (
          <div className="text-sm text-ios-label3">{current.subPrompt}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {current.choices.map((c, i) => {
          const isPicked = pickedForCurrent === i;
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              className={`btn-ghost !py-3 font-jp text-lg ${
                isPicked ? "!bg-ios-blue/20 !text-ios-blue font-semibold" : ""
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="btn-ghost !py-2 text-sm disabled:opacity-40"
        >
          ← Prev
        </button>
        <div className="text-xs text-ios-label3">
          {answered} answered · {remaining} remaining
        </div>
        {idx < questions.length - 1 ? (
          <button onClick={() => setIdx((i) => i + 1)} className="btn-primary !py-2 !px-5 text-sm">
            Next →
          </button>
        ) : (
          <button onClick={finish} className="btn-primary !py-2 !px-5 text-sm">
            Finish
          </button>
        )}
      </div>
    </div>
  );
}

function IntroView({
  questionCount,
  durationMs,
  history,
  onChangeCount,
  onChangeDuration,
  onStart,
}: {
  questionCount: number;
  durationMs: number;
  history: MockResult[];
  onChangeCount: (n: 10 | 20 | 30) => void;
  onChangeDuration: (ms: number) => void;
  onStart: () => void;
}) {
  const best = useMemo(() => {
    if (!history.length) return null;
    return [...history].sort((a, b) => b.correct / b.total - a.correct / a.total)[0];
  }, [history]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ios-title text-ios-label">N5 Mock Test</h1>
        <p className="text-ios-label2 text-[15px] mt-2 leading-relaxed">
          Timed practice test built from your kanji, vocab, and grammar decks.
          Mix of kanji readings, vocabulary meaning, English→JP, listening, and grammar.
          Passing target: <span className="font-semibold text-ios-label">60%</span>.
        </p>
      </div>

      <section className="card space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-ios-label3 font-semibold mb-2">
            Questions
          </div>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                data-active={questionCount === n}
                onClick={() => onChangeCount(n)}
                className="chip"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-ios-label3 font-semibold mb-2">
            Time limit
          </div>
          <div className="flex gap-2 flex-wrap">
            {TIMER_PRESETS.map((t) => (
              <button
                key={t.label}
                data-active={durationMs === t.ms}
                onClick={() => onChangeDuration(t.ms)}
                className="chip"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onStart} className="btn-primary w-full !py-3 mt-2">
          Start test
        </button>
      </section>

      {history.length > 0 && (
        <section className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold tracking-tight text-ios-label">Recent results</h2>
            {best && (
              <div className="text-xs text-ios-label3">
                Best: <span className="font-semibold text-ios-green">
                  {Math.round((best.correct / best.total) * 100)}%
                </span>
              </div>
            )}
          </div>
          <ul className="space-y-2">
            {history.slice(0, 5).map((h) => {
              const pct = Math.round((h.correct / h.total) * 100);
              const passed = pct >= 60;
              return (
                <li
                  key={h.startedAt}
                  className="flex items-center justify-between text-sm py-2 border-b border-ios-strokeSoft last:border-0"
                >
                  <span className="text-ios-label2">
                    {new Date(h.startedAt).toLocaleDateString()} · {h.total} Q
                  </span>
                  <span className={passed ? "text-ios-green font-semibold" : "text-ios-red font-semibold"}>
                    {h.correct}/{h.total} · {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function ReviewView({ result, onRestart }: { result: MockResult; onRestart: () => void }) {
  const pct = Math.round((result.correct / result.total) * 100);
  const passed = pct >= 60;

  return (
    <div className="space-y-5">
      <div className="card text-center py-8 space-y-3">
        <div className="text-5xl">{passed ? "🎉" : "📘"}</div>
        <div className="text-ios-label2 text-sm">Your score</div>
        <div className={`text-5xl font-bold tracking-tight ${passed ? "text-ios-green" : "text-ios-label"}`}>
          {pct}%
        </div>
        <div className="text-ios-label2">
          {result.correct} / {result.total} correct · {formatDuration(result.durationMs)}
        </div>
        <div className={`inline-block text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${
          passed ? "bg-ios-green/15 text-ios-green" : "bg-ios-red/15 text-ios-red"
        }`}>
          {passed ? "Pass (≥60%)" : "Below passing"}
        </div>
      </div>

      <section className="card space-y-3">
        <h2 className="text-sm uppercase tracking-wide text-ios-label3 font-semibold">
          By section
        </h2>
        <ul className="space-y-2">
          {(Object.keys(result.byType) as MockType[]).map((t) => {
            const s = result.byType[t];
            if (!s.total) return null;
            const sectionPct = Math.round((s.correct / s.total) * 100);
            return (
              <li key={t} className="flex items-center gap-3 text-sm">
                <span className="flex-1 text-ios-label2">{QUESTION_TYPE_LABELS[t]}</span>
                <div className="flex-1 h-1.5 bg-ios-fill rounded-full overflow-hidden">
                  <div
                    className={sectionPct >= 60 ? "bg-ios-green h-full" : "bg-ios-red h-full"}
                    style={{ width: `${sectionPct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-ios-label font-medium tabular-nums">
                  {s.correct}/{s.total}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {result.wrong.length > 0 && (
        <section className="card space-y-3">
          <h2 className="text-sm uppercase tracking-wide text-ios-label3 font-semibold">
            Review wrong answers ({result.wrong.length})
          </h2>
          <ul className="space-y-3">
            {result.wrong.map(({ q, picked }) => (
              <li key={q.id} className="text-sm border-b border-ios-strokeSoft pb-3 last:border-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-jp text-ios-label text-lg">{q.prompt}</div>
                  <div className="text-[11px] text-ios-label3 uppercase tracking-wide">
                    {QUESTION_TYPE_LABELS[q.type]}
                  </div>
                </div>
                {q.subPrompt && <div className="text-xs text-ios-label3">{q.subPrompt}</div>}
                <div className="mt-2 space-y-0.5">
                  <div className="text-ios-red text-xs">
                    Your answer: <span className="font-jp">{picked >= 0 ? q.choices[picked] : "— skipped —"}</span>
                  </div>
                  <div className="text-ios-green text-xs">
                    Correct: <span className="font-jp">{q.choices[q.answer]}</span>
                  </div>
                  {q.explain && <div className="text-ios-label3 text-xs">{q.explain}</div>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button onClick={onRestart} className="btn-primary w-full !py-3">
        Take another test
      </button>
    </div>
  );
}
