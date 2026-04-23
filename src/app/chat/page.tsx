"use client";

import { useEffect, useRef, useState } from "react";
import { speakJa } from "@/lib/speak";

type Msg = { role: "user" | "assistant"; content: string };

const STARTER: Msg = {
  role: "assistant",
  content:
    "こんにちは! わたし は ねこせんせい です。\n(Konnichiwa! Watashi wa Neko Sensei desu.)\nHello! I'm Neko Sensei. にゃん〜 Try writing a greeting back!",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([STARTER]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function speakMsg(content: string) {
    const firstLine = content.split("\n")[0];
    speakJa(firstLine);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-sakura-700">AI Chat with Neko Sensei</h1>
        <p className="text-sm text-sakura-900/70 mt-1">
          Practice simple Japanese. Neko Sensei replies with Japanese, romaji, and English.
        </p>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="h-[55vh] overflow-y-auto p-4 space-y-3 bg-sakura-50/40">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "bg-sakura-500 text-white rounded-br-sm"
                    : "bg-white border border-sakura-100 rounded-bl-sm"
                }`}
              >
                {m.role === "assistant" && (
                  <button
                    onClick={() => speakMsg(m.content)}
                    className="float-right ml-2 text-xs text-sakura-600 hover:underline"
                    aria-label="Hear message"
                  >
                    🔊
                  </button>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-sakura-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sakura-900/60">
                Neko Sensei is thinking… にゃ〜
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-sakura-100 p-3 flex gap-2 bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type in Japanese or English…"
            className="flex-1 rounded-full border border-sakura-200 px-4 py-2 outline-none focus:border-sakura-500"
            disabled={loading}
          />
          <button onClick={send} disabled={loading || !input.trim()} className="btn-primary disabled:opacity-50">
            Send
          </button>
        </div>
      </div>

      {error && (
        <div className="card bg-sakura-50 border-sakura-300 text-sakura-800 text-sm">
          <strong>Error:</strong> {error}
          <div className="mt-1 text-sakura-700/80">
            Make sure <code>ANTHROPIC_API_KEY</code> is set in <code>.env.local</code>.
          </div>
        </div>
      )}
    </div>
  );
}
