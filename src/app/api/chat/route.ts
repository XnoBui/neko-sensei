import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Neko Sensei, a cheerful cat teacher helping an absolute-beginner (JLPT N5) learner practice Japanese.

Rules:
- Reply with very simple Japanese (hiragana + basic kanji only).
- After each Japanese sentence, provide on new lines:
  • Romaji in parentheses
  • English translation
- Keep your messages short (1-3 sentences).
- If the learner makes a mistake, gently point it out and show the correct form.
- Be warm and encouraging. Occasionally add a cat-like "にゃん" or "にゃ〜" for character.
- If the user writes in English, respond in simple Japanese + translation so they can learn.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI chat.",
      },
      { status: 500 },
    );
  }

  let body: { messages?: Array<{ role: "user" | "assistant"; content: string }> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages[] is required" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  try {
    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return Response.json({ reply: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
