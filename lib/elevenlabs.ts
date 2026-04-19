import type { SessionNote } from "./types";

export interface TranscribeResult {
  segments: Array<{
    start: number;
    end: number;
    speaker: string;
    text: string;
  }>;
}

export async function transcribe(audioUrl: string): Promise<TranscribeResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: "scribe_v1",
      audio_url: audioUrl,
      diarize: true,
      language_code: "en",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ElevenLabs STT failed: ${res.status} ${text}`);
  }

  const json = await res.json();

  const segments: TranscribeResult["segments"] = (json.words ?? [])
    .reduce((acc: TranscribeResult["segments"], w: Record<string, unknown>) => {
      const last = acc[acc.length - 1];
      if (last && last.speaker === w.speaker_id) {
        last.text += " " + w.text;
        last.end = w.end as number;
      } else {
        acc.push({
          start: w.start as number,
          end: w.end as number,
          speaker: (w.speaker_id as string) ?? "unknown",
          text: w.text as string,
        });
      }
      return acc;
    }, []);

  return { segments };
}
