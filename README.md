# Neko Sensei 🐱

A cute, beginner-friendly **Japanese learning web app** for absolute beginners (JLPT N5).
Meet your friendly cat teacher and learn kana, vocabulary, and basic conversation — all in one tiny browser app.

![neko-sensei](https://img.shields.io/badge/level-N5-ff5e8f) ![stack](https://img.shields.io/badge/Next.js-15-black) ![license](https://img.shields.io/badge/license-MIT-green)

## Features

- 🅰️ **Kana Drills** — Hiragana & Katakana multiple-choice quiz with streak tracking.
- 📚 **Vocab Flashcards** — Flip cards organized by topic (greetings, food, verbs…) with audio.
- 💬 **AI Chat with Neko Sensei** — Practice simple Japanese. Replies come with romaji + English translation.
- 🔊 **Built-in pronunciation** — Every Japanese word can be spoken aloud using your browser's SpeechSynthesis API.
- 💾 **Private by default** — Progress lives in `localStorage`. No account, no server, no tracking.

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [`@anthropic-ai/sdk`](https://github.com/anthropics/anthropic-sdk-typescript) for the AI chat route
- Web Speech API for pronunciation

## Getting started

```bash
npm install
cp .env.example .env.local    # then paste your Anthropic key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI chat setup

The `/chat` page calls `/api/chat`, which uses `ANTHROPIC_API_KEY` from `.env.local`.
Without a key the other pages still work — only the chat feature requires one.

## Project layout

```
src/
  app/
    page.tsx          # Landing page with mascot
    kana/page.tsx     # Hiragana/Katakana drill
    vocab/page.tsx    # Flashcards
    chat/page.tsx     # AI chat UI
    api/chat/route.ts # Claude backend route
  components/
    NekoMascot.tsx    # SVG cat mascot
  data/
    kana.ts           # Hiragana + Katakana tables
    vocab.ts          # N5 vocabulary
  lib/
    progress.ts       # localStorage helpers
    speak.ts          # Browser TTS wrapper
```

## Roadmap

- [ ] Kanji SRS (spaced repetition)
- [ ] Grammar lessons
- [ ] Listening comprehension drills
- [ ] Optional cloud sync

にゃん〜 Happy studying!
