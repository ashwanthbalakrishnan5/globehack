export type NoteType = "complaint" | "preference" | "offhand" | "general";
export type Severity = "low" | "medium" | "high";

export interface Practitioner {
  id: string;
  name: string;
  title: string;
  clinic: string;
  email: string;
}

export interface Client {
  id: string;
  practitioner_id: string;
  name: string;
  initials: string;
  age: number;
  profile: string;
  paired_on: string;
  session_count: number;
  next_booked_on: string | null;
}

export interface HealthSnapshot {
  id: string;
  client_id: string;
  captured_on: string;
  hrv_ms: number;
  resting_hr_bpm: number;
  sleep_score: number;
}

export interface Session {
  id: string;
  client_id: string;
  practitioner_id: string;
  started_at: string;
  ended_at: string | null;
  protocol_used: string | null;
  transcript_raw: string | null;
  summary_card: SummaryCard | null;
}

export interface SessionNote {
  id: string;
  session_id: string;
  speaker: string;
  text: string;
  note_type: NoteType;
  quote: string | null;
  rationale: string | null;
  flagged: boolean;
  start_sec: number | null;
  end_sec: number | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  session_id: string;
  client_id: string;
  protocol: string;
  parameters: Record<string, string | number>;
  reasoning: ReasoningLine[];
  confidence: "high" | "medium" | "low";
  created_at: string;
}

export interface RelapseFlag {
  id: string;
  client_id: string;
  practitioner_id: string;
  severity: Severity;
  reason: string;
  signals: string[];
  addressed: boolean;
  created_at: string;
}

export interface SummaryCard {
  headline: string;
  protocol_used: string;
  duration_min: number;
  key_notes: string[];
  next_steps: string;
  hrv_at_session: number;
  quote: string | null;
}

export interface Protocol {
  id: string;
  displayName: string;
  duration_min: number;
  parameters: {
    frequency_hz?: number;
    emphasis?: string;
    sequence?: string;
    placement?: string;
  };
}

export interface ReasoningLine {
  signal: string;
  evidence: string;
  mapsTo: string;
  color: "hrv" | "hr" | "sleep" | "note" | "default";
}

export interface Slot {
  time: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  tag: string;
  readiness: number;
  protocol: string;
  state: "done" | "now" | "soon";
}

export interface Flag {
  id: string;
  clientId: string;
  clientName: string;
  severity: Severity;
  reason: string;
  signals: string[];
  lastVisit: string;
  hrvTrend: number[];
}
