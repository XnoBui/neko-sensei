"use client";

export function speakJa(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  u.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const jp = voices.find((v) => v.lang.startsWith("ja"));
  if (jp) u.voice = jp;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
