import Link from "next/link";
import NekoMascot from "@/components/NekoMascot";

const features = [
  {
    href: "/kana",
    icon: "あ",
    tint: "from-ios-blue/20 to-ios-indigo/10",
    iconColor: "text-ios-blue",
    title: "Kana Drills",
    blurb: "Master Hiragana & Katakana with fast flashcard quizzes.",
  },
  {
    href: "/vocab",
    icon: "📚",
    tint: "from-ios-green/20 to-ios-blue/10",
    iconColor: "text-ios-green",
    title: "Vocab Flashcards",
    blurb: "N5 words with audio — powered by your browser's voice.",
  },
  {
    href: "/chat",
    icon: "💬",
    tint: "from-ios-indigo/20 to-ios-pink/10",
    iconColor: "text-ios-indigo",
    title: "AI Chat Practice",
    blurb: "Chat with Neko Sensei in simple Japanese, get gentle corrections.",
  },
];

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="flex flex-col-reverse md:flex-row items-center gap-8">
        <div className="flex-1 space-y-5 text-center md:text-left">
          <div className="chip">はじめまして · JLPT N5</div>
          <h1 className="ios-title text-ios-label">
            Learn Japanese with a <span className="text-ios-blue">tiny tutor</span>.
          </h1>
          <p className="text-lg text-ios-label2 max-w-xl leading-relaxed">
            Neko Sensei is your friendly cat teacher. Drill kana, build vocabulary,
            and practice real conversation — all in one tiny web app. No account, no tracking.
          </p>
          <div className="flex gap-3 justify-center md:justify-start">
            <Link href="/kana" className="btn-primary">Start with Kana</Link>
            <Link href="/vocab" className="btn-ghost">Browse Vocab</Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-white/70 rounded-full" />
            <div className="relative">
              <NekoMascot size={260} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`card group bg-gradient-to-br ${f.tint} hover:-translate-y-0.5 transition-transform`}
          >
            <div className={`text-3xl font-jp mb-3 ${f.iconColor}`}>{f.icon}</div>
            <h3 className="text-lg font-semibold tracking-tight mb-1 text-ios-label">
              {f.title}
            </h3>
            <p className="text-sm text-ios-label2">{f.blurb}</p>
            <div className="mt-4 text-sm font-medium text-ios-blue inline-flex items-center gap-1">
              Open <span className="transition-transform group-hover:translate-x-0.5">›</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold tracking-tight mb-3 text-ios-label">
          Why Neko Sensei? 🐾
        </h2>
        <ul className="space-y-2 text-ios-label2 text-[15px]">
          <li>✨ Designed for true beginners — no prior knowledge needed.</li>
          <li>🎧 Hear every word spoken aloud with your browser's built-in voice.</li>
          <li>🔒 Your progress stays on your device. No login, no tracking.</li>
          <li>🤖 Optional AI chat tutor powered by Claude.</li>
        </ul>
      </section>
    </div>
  );
}
