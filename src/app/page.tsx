import Link from "next/link";
import NekoMascot from "@/components/NekoMascot";

const features = [
  {
    href: "/kana",
    emoji: "あ",
    title: "Kana Drills",
    blurb: "Master Hiragana & Katakana with fast flashcard quizzes.",
  },
  {
    href: "/vocab",
    emoji: "📚",
    title: "Vocab Flashcards",
    blurb: "N5 words with audio — powered by your browser's voice.",
  },
  {
    href: "/chat",
    emoji: "💬",
    title: "AI Chat Practice",
    blurb: "Chat with Neko Sensei in simple Japanese, get gentle corrections.",
  },
];

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="flex flex-col-reverse md:flex-row items-center gap-8">
        <div className="flex-1 space-y-5 text-center md:text-left">
          <p className="inline-block rounded-full bg-sakura-100 text-sakura-700 px-3 py-1 text-sm font-semibold">
            はじめまして! For JLPT N5 beginners
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-sakura-700 leading-tight">
            Learn Japanese the <span className="text-matcha-600">cute</span> way.
          </h1>
          <p className="text-lg text-sakura-900/80 max-w-xl">
            Neko Sensei is your friendly cat teacher. Drill kana, build vocab, and
            practice real conversation — all in one tiny web app. No account needed.
          </p>
          <div className="flex gap-3 justify-center md:justify-start">
            <Link href="/kana" className="btn-primary">Start with Kana →</Link>
            <Link href="/vocab" className="btn-ghost">Browse Vocab</Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-sakura-200 rounded-full" />
            <div className="relative">
              <NekoMascot size={260} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="card hover:-translate-y-1 transition-transform">
            <div className="text-4xl font-jp text-sakura-500 mb-3">{f.emoji}</div>
            <h3 className="text-xl font-bold mb-1">{f.title}</h3>
            <p className="text-sm text-sakura-900/70">{f.blurb}</p>
          </Link>
        ))}
      </section>

      <section className="card bg-gradient-to-br from-sakura-50 to-white">
        <h2 className="text-2xl font-bold mb-2">Why Neko Sensei? 🐾</h2>
        <ul className="space-y-2 text-sakura-900/80">
          <li>✨ Designed for true beginners — no prior knowledge needed.</li>
          <li>🎧 Hear every word spoken aloud with your browser's built-in voice.</li>
          <li>🔒 Your progress stays on your device. No login, no tracking.</li>
          <li>🤖 Optional AI chat tutor powered by Claude.</li>
        </ul>
      </section>
    </div>
  );
}
