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
        <h1 className="ios-title text-ios-label">AI Chat</h1>
        <p className="text-sm text-ios-label3 mt-1">
          Practice with Neko Sensei. Replies include Japanese, romaji, and English.
        </p>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="h-[58vh] overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-iosLg px-4 py-3 whitespace-pre-wrap leading-relaxed text-[15px] ${
                  m.role === "user"
                    ? "text-white rounded-br-md"
                    : "bg-white/80 border border-ios-strokeSoft text-ios-label rounded-bl-md backdrop-blur"
                }`}
                style={
                  m.role === "user"
                    ? { background: "linear-gradient(180deg,#0a84ff 0%,#0064d8 100%)" }
                    : undefined
                }
              >
                {m.role === "assistant" && (
                  <button
                    onClick={() => speakMsg(m.content)}
                    className="float-right ml-2 text-xs text-ios-blue hover:underline"
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
              <div className="bg-white/80 border border-ios-strokeSoft rounded-iosLg rounded-bl-md px-4 py-3 text-ios-label3 backdrop-blur">
                Neko Sensei is thinking… にゃ〜
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-ios-strokeSoft p-3 flex gap-2 bg-white/60 backdrop-blur">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type in Japanese or English…"
            className="flex-1 rounded-full bg-white/80 border border-ios-stroke px-4 py-2.5 outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/20 placeholder:text-ios-label3"
            disabled={loading}
          />
          <button onClick={send} disabled={loading || !input.trim()} className="btn-primary disabled:opacity-50">
            Send
          </button>
        </div>
      </div>

      {error && (
        <div className="card border-ios-red/40 text-sm">
          <strong className="text-ios-red">Error: </strong>
          <span className="text-ios-label2">{error}</span>
          <div className="mt-1 text-ios-label3">
            Make sure <code className="bg-ios-fill px-1 py-0.5 rounded">ANTHROPIC_API_KEY</code> is set in <code className="bg-ios-fill px-1 py-0.5 rounded">.env.local</code>.
          </div>
        </div>
      )}
    </div>
  );
}
