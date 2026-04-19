import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { NoteType } from "./types";

export interface ExtractedNote {
  note_type: NoteType;
  quote: string;
  rationale: string;
  flagged: boolean;
}

const SYSTEM_PROMPT = `You are a clinical note tagger for Hydrawav3 recovery sessions.
Given a speaker segment from a session transcript, extract the note type and key insight.

note_type options:
- complaint: client reports pain, discomfort, or worsening symptom
- preference: client states what they liked or want more of
- offhand: casual remark that may have clinical relevance
- general: neutral statement, no specific clinical signal

Flag the note (flagged: true) if it is a complaint or contains urgent clinical information.`;

let _client: GoogleGenerativeAI | null = null;

function getClient() {
  if (!_client) {
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return _client;
}

export async function extractNote(
  segment: { speaker: string; text: string },
  ctx: { clientName: string; sessionProtocol: string }
): Promise<ExtractedNote> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          note_type: { type: SchemaType.STRING },
          quote: { type: SchemaType.STRING },
          rationale: { type: SchemaType.STRING },
          flagged: { type: SchemaType.BOOLEAN },
        },
        required: ["note_type", "quote", "rationale", "flagged"],
      },
    },
  });

  const prompt = `Client: ${ctx.clientName}. Protocol: ${ctx.sessionProtocol}.\n\n${segment.speaker}: "${segment.text}"`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as ExtractedNote;
  } catch {
    return {
      note_type: "general",
      quote: segment.text,
      rationale: "Could not extract",
      flagged: false,
    };
  }
}
