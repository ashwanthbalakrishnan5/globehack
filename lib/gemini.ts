import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { NoteType } from "./types";

export type BodyZoneStatus = "pain" | "recovered" | "active";

export type BodyZoneId =
  | "head" | "neck"
  | "left_shoulder" | "right_shoulder" | "chest"
  | "left_arm" | "right_arm"
  | "abdomen" | "lower_back"
  | "left_hip" | "right_hip"
  | "left_thigh" | "right_thigh"
  | "left_knee" | "right_knee"
  | "left_leg" | "right_leg"
  | "feet";

export interface AffectedZone {
  id: BodyZoneId;
  status: BodyZoneStatus;
}

export interface ExtractedNote {
  note_type: NoteType;
  quote: string;
  rationale: string;
  flagged: boolean;
  affectedZones?: AffectedZone[];
}

const SYSTEM_PROMPT = `You are a clinical note tagger for Hydrawav3 recovery sessions.
Given a speaker segment from a session transcript, extract the note type, key insight, and any body zones mentioned.

note_type options:
- complaint: client reports pain, discomfort, or worsening symptom
- preference: client states what they liked or want more of
- offhand: casual remark that may have clinical relevance
- general: neutral statement, no specific clinical signal

Flag the note (flagged: true) if it is a complaint or contains urgent clinical information.

affectedZones: any body part explicitly mentioned, with status:
- "pain" when the speaker mentions pain, soreness, tightness, or discomfort there
- "recovered" when the speaker says it feels better, healed, or no longer bothering them
- "active" when it is simply being used or targeted in the protocol

Allowed zone ids: head, neck, left_shoulder, right_shoulder, chest, left_arm, right_arm, abdomen, lower_back, left_hip, right_hip, left_thigh, right_thigh, left_knee, right_knee, left_leg, right_leg, feet.
Use left/right precisely when the speaker specifies a side. Omit affectedZones if no body area is mentioned.`;

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
          affectedZones: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                status: { type: SchemaType.STRING },
              },
              required: ["id", "status"],
            },
          },
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
