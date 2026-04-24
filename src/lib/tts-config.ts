// Shared TTS config — imported by the /api/tts route and the build-time
// pregeneration script so static MP3 filenames (hashed from voice:model:text)
// always line up with what the runtime would request.

// Native Japanese voice "Kana" from the shared ElevenLabs library.
export const DEFAULT_VOICE = "dhGvgIx0X6G3xzSWqOye";

// Flash v2.5: ~75ms generation, fastest model that supports Japanese.
export const DEFAULT_MODEL = "eleven_flash_v2_5";

export const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
} as const;
