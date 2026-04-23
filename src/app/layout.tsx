import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Neko Sensei 🐱 — Learn Japanese the cute way",
  description: "A friendly N5 Japanese web app: kana drills, vocab flashcards, and AI chat practice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-sakura-100 bg-white/80 backdrop-blur sticky top-0 z-10">
          <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-sakura-700">
              <span className="text-2xl" aria-hidden>🐱</span>
              <span>Neko Sensei</span>
            </Link>
            <div className="flex gap-1 text-sm">
              <Link className="btn-ghost !px-3 !py-1.5" href="/kana">Kana</Link>
              <Link className="btn-ghost !px-3 !py-1.5" href="/vocab">Vocab</Link>
              <Link className="btn-ghost !px-3 !py-1.5" href="/chat">AI Chat</Link>
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="max-w-5xl mx-auto px-4 py-10 text-center text-sm text-sakura-700/70">
          にゃん〜 Made with love for beginner Japanese learners.
        </footer>
      </body>
    </html>
  );
}
