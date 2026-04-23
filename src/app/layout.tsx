import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Neko Sensei 🐱 — Learn Japanese",
  description: "A friendly N5 Japanese web app: kana drills, vocab flashcards, and AI chat practice.",
};

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/kana", label: "Kana", icon: "あ" },
  { href: "/kanji", label: "Kanji", icon: "漢" },
  { href: "/vocab", label: "Vocab", icon: "📚" },
  { href: "/grammar", label: "Grammar", icon: "文" },
  { href: "/mock", label: "Mock", icon: "📝" },
  { href: "/chat", label: "Chat", icon: "💬" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-28 md:pb-10">
        {/* Top nav (glass) */}
        <header className="sticky top-0 z-20">
          <div className="glass-strong border-b border-ios-stroke/40">
            <nav className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
              <Link href="/" className="flex items-center gap-2 font-semibold text-ios-label">
                <span className="text-xl" aria-hidden>🐱</span>
                <span className="tracking-tight">Neko Sensei</span>
              </Link>
              <div className="hidden md:flex items-center gap-1 text-sm">
                {nav.slice(1).map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="px-3 py-1.5 rounded-full text-ios-label2 hover:bg-white/70 transition"
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">{children}</main>

        {/* Bottom tab bar (iOS style, mobile) */}
        <nav className="md:hidden fixed bottom-3 left-3 right-3 z-20 glass-strong rounded-iosXl p-1.5 flex justify-around">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-iosLg text-[11px] font-medium text-ios-label2 hover:bg-white/70 transition"
            >
              <span className="text-lg leading-none">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>

        <footer className="max-w-5xl mx-auto px-6 py-10 text-center text-xs text-ios-label3">
          にゃん〜 Made with love for beginner Japanese learners.
        </footer>
      </body>
    </html>
  );
}
