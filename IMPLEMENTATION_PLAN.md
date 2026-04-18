# Implementation Plan — Hydrawav3 GlobeHack Project

## 1. Product Snapshot

A two-sided platform connecting client wearable health data and session audio to Hydrawav3 practitioner workflows. One Next.js application serves two distinct experiences: a mobile-locked client companion app and a desktop-locked practitioner dashboard. Demo-grade features include real-time QR check-in, wearable context display, rule-based protocol recommendation, ambient session transcription with auto-extracted notes, post-session summary cards, and a relapse flag for rebooking intelligence.

## 2. Success Criteria Mapped To Judging Rubric

The build must produce visible, demoable artifacts for each scoring dimension.

**Practitioner Impact (25 points).** Show a practitioner walking into a session already knowing what is going on in the client's body. Visible proof: dashboard populates the instant the QR scan completes, protocol recommendation appears with plain-language reasoning, auto-extracted notes appear during the session without any typing.

**Technical Feasibility (20 points).** Real data flowing through a real backend end-to-end. Visible proof: QR scan fires a realtime event through Insforge that updates the practitioner view instantly. Ambient audio runs through a real ElevenLabs Scribe pipeline and returns diarized transcripts.

**Platform Integration (20 points).** Recommendation output references Hydrawav3 protocol parameters using the exact language from the brief (thermal modulation, photobiomodulation, resonance-based mechanical stimulation, Sun and Moon pad placement). Wellness terminology rules are enforced everywhere in the copy.

**Path to Product (20 points).** Business model slide with unit economics. Clear explanation of what is demo-mocked versus production. Roadmap for the Health Connect integration.

**User Experience (15 points).** Two visually distinct, polished, production-grade interfaces. Mobile for client, desktop for practitioner. Neither experience looks like a hackathon project.

**Loop Coverage (+10).** Before (wearable context + QR check-in), during (ambient listening + recommendation), after (summary card + relapse flag). Three stages visibly present in the demo.

**Live Data Demo (+5).** Real backend, real realtime events, real transcription pipeline. No faked UI transitions.

**Business Model (+3).** Unit economics paragraph built into the pitch deck and quoted on stage.

## 3. Tech Stack

**Framework.** Next.js 15 with App Router and TypeScript. One repository, one deployment.

**Styling.** Tailwind CSS as base. shadcn/ui for primitive components. Magic UI and Aceternity UI for distinctive, non-generic visual elements that separate the project from standard AI-generated aesthetics. Framer Motion for transitions.

**Backend.** Insforge via MCP. Handles authentication, database, storage, and realtime channels. Schema provisioning and queries are performed through the Insforge MCP tools. No Supabase, no Firebase, no custom Node backend.

**Audio.** ElevenLabs via MCP. Scribe endpoint for speech-to-text with speaker diarization. Voice cloning is not needed for this build because diarization is handled by Scribe's speaker separation without explicit voice prints (voice prints stay in the narrative as a production feature).

**Charting.** Recharts for health data visualization. Small, focused charts rather than dashboards.

**QR.** `qrcode.react` for generation on the practitioner side. `@yudiel/react-qr-scanner` or `html5-qrcode` for the scanner on the client side.

**State.** Zustand for cross-component state on each side. No Redux. No context juggling.

**Realtime.** Insforge realtime channel subscription. Used for the QR check-in event and the session summary delivery event.

**Extra libraries.** `date-fns` for date math. `lucide-react` for icons. `react-device-detect` as a client-side fallback for form factor detection.

## 4. Form Factor Strategy

The client app and the practitioner app live in the same Next.js codebase but under separate route groups. The client experience is locked to mobile. The practitioner experience is locked to desktop or tablet.

Enforcement happens in two layers.

**Layer one, middleware.** A Next.js middleware function inspects the incoming `user-agent` header. Requests to routes under the client group from a non-mobile user agent get redirected to a block screen that instructs the user to open the link on their phone. Requests to routes under the practitioner group from a mobile user agent get redirected to a block screen that instructs the user to open the link on a tablet or desktop.

**Layer two, client-side guard.** Each route group's layout renders a `react-device-detect` check and overrides with the same block screen if the user agent slips past middleware (for example, via developer tools emulation).

The block screens are designed assets, not placeholder text. They reinforce the brand even in the "wrong device" state.

## 5. Backend Data Model (Insforge)

Tables to provision via the Insforge MCP:

**practitioners.** id (uuid, primary key), name (text), email (text, unique), clinic_name (text), created_at (timestamp).

**clients.** id (uuid, primary key), practitioner_id (uuid, foreign key to practitioners), full_name (text), email (text), date_of_birth (date), active (boolean), created_at (timestamp).

**health_snapshots.** id (uuid, primary key), client_id (uuid, foreign key to clients), captured_on (date), hrv_ms (integer), resting_hr_bpm (integer), sleep_score (integer), sleep_hours (numeric), steps (integer), stress_score (integer). One row per client per day for the last 14 days.

**sessions.** id (uuid, primary key), client_id (uuid, foreign key to clients), practitioner_id (uuid, foreign key to practitioners), started_at (timestamp), ended_at (timestamp, nullable), protocol_used (jsonb), recommendation_id (uuid, nullable), transcript_raw (text, nullable), summary_card (jsonb, nullable).

**session_notes.** id (uuid, primary key), session_id (uuid, foreign key to sessions), captured_at (timestamp), speaker (text, 'practitioner' or 'client'), content (text), note_type (text, one of 'complaint', 'preference', 'offhand', 'general'), flagged (boolean).

**recommendations.** id (uuid, primary key), session_id (uuid, foreign key to sessions), protocol (jsonb), reasoning (text), accepted (boolean, nullable), modified_protocol (jsonb, nullable).

**relapse_flags.** id (uuid, primary key), client_id (uuid, foreign key to clients), severity (text, one of 'low', 'medium', 'high'), reason (text), triggered_at (timestamp), addressed (boolean).

**Realtime channels.**

Channel `checkin:{practitioner_id}`: publishes an event when a client scans a QR for this practitioner. Payload includes client_id and a fresh session_id.

Channel `summary:{client_id}`: publishes an event when a session summary card is ready for the client. Payload includes the summary_card jsonb.

## 6. Mock Data Strategy

One practitioner is seeded. Three clients are seeded under that practitioner, each with a distinct 14-day health trajectory:

**Client A, "Sarah Chen."** Healthy baseline. Good HRV, consistent sleep, steady resting HR. Used to show the "everything looks good, standard protocol" path.

**Client B, "Marcus Rivera."** Declining trajectory. HRV dropping over the last 7 days, elevated resting HR, poor sleep. Triggers the "recovery-focused protocol" recommendation and is the primary demo client.

**Client C, "Jessica Park."** Post-injury. Prior session flagged left shoulder asymmetry. Elevated stress score, pain mentioned in last session's auto-notes. This client's trajectory triggers the Relapse Flag on the practitioner dashboard.

For each client, pre-generate prior sessions with protocols used and auto-extracted notes. This gives the practitioner dashboard a realistic session history at first load.

One pre-recorded demo audio clip is stored in project assets. The clip is a scripted 90-second session between "practitioner" and "client" containing planted complaints, preferences, and offhand remarks that the extraction pipeline will catch. Playing this clip through the ambient listening module is the demo centerpiece.

## 7. Feature Implementation Details

### 7.1 Practitioner Dashboard (waiting state)

**Purpose.** The default view a practitioner sees between clients.

**UI.** Full-screen layout with a prominent QR code on the right (generated from a session token tied to this practitioner), today's appointment list on the left, and a queue of relapse flags at the bottom.

**Libraries.** `qrcode.react` for the QR. shadcn/ui Card primitives. Magic UI animated background for the hero region.

**Data.** Subscribes to the `checkin:{practitioner_id}` realtime channel on mount. On event, navigates to `/practitioner/session/[session_id]`.

**Mock strategy.** Appointment list is pulled from Insforge, fully real. Relapse flags are pulled from Insforge, seeded with Client C's flag.

**Visual priority.** High. This is the first screen the judges see. Must look like a shipped product.

### 7.2 Client App Landing + QR Scanner

**Purpose.** The client's entry point on their phone.

**UI.** Mobile-locked full-screen layout. Greeting with client name, 14-day health ring summary at top, large "Check in" button opening the QR scanner, session history list below.

**Libraries.** `@yudiel/react-qr-scanner` for camera access. Recharts for ring charts. Framer Motion for the sheet that slides up when "Check in" is tapped.

**Data.** On mount, fetches the client's 14-day health snapshots from Insforge. On successful QR scan, POSTs to an API route that creates a new session row, then publishes to `checkin:{practitioner_id}`.

**Mock strategy.** Health snapshots are pre-seeded. QR scan is real and uses a real camera.

**Visual priority.** High. This is the second screen the judges see. Must look like a wellness brand, not a utility app.

### 7.3 Health Data Context Panel (practitioner view)

**Purpose.** After check-in, the practitioner sees the client's last 14 days of wearable data.

**UI.** Three compact cards in a row: HRV trend, Sleep trend, Resting HR trend. Each card has a sparkline, a current value, a delta versus the 7-day average, and a semantic tag ("trending down", "steady", "improved"). A fourth card summarizes "flagged last session" in plain language.

**Libraries.** Recharts for sparklines. shadcn/ui Card. Tailwind for the semantic color tags.

**Data.** Reads from health_snapshots for this client. The "flagged last session" card reads the most recent session's notes where flagged is true.

**Visual priority.** High. This card row is the proof that wearable context is working. It needs to look like something a practitioner would screenshot.

### 7.4 Protocol Recommendation Card

**Purpose.** Turns the wearable context into a specific Hydrawav3 protocol recommendation.

**UI.** Single card with three sections: the recommendation itself (protocol name, parameters, Sun and Moon pad placement), the reasoning chain as bullet points referencing specific data signals, and three action buttons (Accept, Modify, Override).

**Libraries.** shadcn/ui Card and Button. Framer Motion for the reasoning chain appearing one line at a time.

**Data.** Rules engine is a plain TypeScript module in `lib/protocol-rules.ts`. Takes a health snapshot + prior session notes as input and returns a protocol config plus a reasoning array. Not an LLM call; a deterministic lookup.

**Rules to encode.**

HRV below 40 ms or trending down more than 10 percent versus 7-day average: recommend cooling emphasis plus 40 Hz lymphatic vibration.

Resting HR elevated by more than 8 bpm versus 7-day average: extend duration to 12 minutes and add parasympathetic sequence.

Sleep score below 70 for 3 or more of the last 5 nights: add warmth emphasis plus low-frequency vibration.

Prior session note tagged with asymmetry keyword: highlight Sun and Moon pad placement suggestion.

Default (no triggers): standard balance protocol.

**Visual priority.** Very high. This card is where "AI is helping" becomes visible without actually needing an LLM.

### 7.5 Ambient Session Listening

**Purpose.** Captures session audio, transcribes it with speaker separation, and auto-extracts structured notes.

**UI.** Session view has a persistent bottom panel that shows the live transcript with speaker labels (color-coded). As notes are extracted, cards slide in on the right side tagged as Complaint, Preference, or Offhand Remark. A "Start Session" button begins the flow. A "Stop and Review" button ends it.

**Libraries.** ElevenLabs MCP for the Scribe endpoint. A simple audio player from the HTML5 audio API to play the demo clip. Framer Motion for the note cards sliding in. Tailwind for speaker color coding.

**Pipeline.**

Step one, "Start Session" pressed. The pre-recorded demo audio file begins playing through the device speakers. Simultaneously, the same file is submitted to the ElevenLabs Scribe endpoint with diarization enabled.

Step two, Scribe returns diarized segments. Each segment is pushed into the session_notes table with its speaker label and content.

Step three, each segment is passed through a lightweight extraction prompt against an LLM call (Anthropic API, Claude Sonnet 4) with a structured output schema that tags the segment as complaint, preference, offhand, or general. The result updates the session_notes row.

Step four, the UI reads from Insforge realtime and renders transcript segments as they arrive. Extracted notes render as cards.

**Mock strategy.** The audio file is pre-recorded. Everything downstream of it is real: real Scribe transcription, real LLM extraction, real database writes, real UI updates. The audio source is the only staged input.

**Why this is safe for demo.** Microphone failure, background noise, and speaker overlap problems are all eliminated. The pipeline itself is fully functional and will work with real mic audio in production. This distinction is called out in the pitch.

**Visual priority.** Very high. This is the "wow" moment of the demo. Transcript animating in with speaker colors, notes sliding in live.

### 7.6 Session Summary Card

**Purpose.** Delivers a one-screen, under-10-second summary to the client after the session.

**UI.** Full-bleed card on the client's phone. Top: session number and date. Middle: one specific thing the client said during the session, pulled from the auto-extracted notes (this is the "the system heard me" proof point). Bottom: one wearable-derived signal (for example, HRV average over the session window) and one transformation metric (for example, mobility improvement from pre-to-post pose snapshot, or a subjective delta if the client answered a one-tap question). A small "Share" button on the corner.

**Libraries.** Aceternity UI or Magic UI gradient card component. shadcn/ui Button. html2canvas or Vercel OG for shareable image generation.

**Data.** Practitioner hits "Generate Summary" at session end. API route composes the summary_card jsonb from the session record and the notes table and writes it back to sessions. Then publishes to `summary:{client_id}` realtime channel.

**Client-side trigger.** Client app subscribes to `summary:{client_id}`. On event, a full-screen sheet animates up showing the card.

**Visual priority.** Very high. This is the second "wow" moment of the demo. The summary card should be share-worthy on its own.

### 7.7 Relapse Flag

**Purpose.** Post-session intelligence that shows the practitioner which clients are trending toward relapse and should be contacted for a rebook.

**UI.** On the practitioner dashboard, a section at the bottom shows flagged clients with a severity badge, a one-sentence reason, and a "Draft message" button that opens a pre-written outreach message the practitioner can send.

**Libraries.** shadcn/ui Badge and Card. Lucide icons for severity indicators.

**Rules engine.** Runs at session end and on a nightly cron (not needed for demo). For the demo, the flag is pre-computed for Client C based on the seeded trajectory and note history.

**Rules to encode.**

Severity high: HRV trending down for 7 or more consecutive days AND pain-related complaint in the last 2 sessions AND more than 14 days since last visit.

Severity medium: any two of the above conditions.

Severity low: one condition met.

The reason string is templated from which conditions were met ("HRV down 14 percent over 8 days, pain flagged in last session").

**Why this is in scope.** It is the "after" stage of the Know-Act-Learn loop. It reuses the data already captured by earlier features, so the incremental build cost is one component and one rules module. Claims the Loop Coverage +10 bonus unambiguously.

**Practitioner-first framing.** The flag surfaces a suggestion. The practitioner decides. The flag never pushes anything to the client directly.

**Visual priority.** Medium-high. Must be visible and legible in the demo, but is not a hero moment.

## 8. Demo Flow (six minute target)

**Minute 0 to 0:30. Setup.** Open practitioner dashboard on the laptop. Show the appointment list, the QR code, and the relapse flag on Client C at the bottom. Voiceover: "This is what a Hydrawav3 practitioner sees between clients."

**Minute 0:30 to 1:30. Check-in.** Pick up the phone, show the client app open on Client B (Marcus Rivera). Voiceover: "Marcus just walked in. Here's what's on his phone." Show his 14-day health summary on the phone. Tap "Check in." Scan the QR on the laptop. Dashboard populates instantly with Marcus's profile and health context. Voiceover: "The practitioner now knows more about this client in one second than they did from a full intake before."

**Minute 1:30 to 2:30. Recommendation.** Protocol recommendation card animates in. Reasoning chain appears line by line. Voiceover walks through the reasoning. Practitioner hits "Accept."

**Minute 2:30 to 4:00. Session.** Practitioner hits "Start Session." Pre-recorded audio begins playing. Transcript animates in with speaker color coding. Notes slide in as cards on the right, tagged as complaints and preferences. Voiceover: "The practitioner does not type anything. The session is being documented in real time."

**Minute 4:00 to 4:45. Summary card.** Practitioner hits "Generate Summary" at session end. Switch to the phone. Summary card fires as a full-screen sheet. Voiceover: "Marcus gets this on his lock screen. Under ten seconds to read. The proof that the system heard him."

**Minute 4:45 to 5:30. Relapse flag.** Switch back to the dashboard. Scroll to the relapse flag section. Click "Draft message" for Client C. Show the pre-written outreach. Voiceover: "Recovery does not stop when the client walks out the door."

**Minute 5:30 to 6:00. Platform integration and business model.** One slide. Hydrawav3 ecosystem diagram showing where this plugs in. Unit economics. Close.

## 9. Visual Design Direction

The aesthetic target is "premium wellness brand platform," not "developer tool." Reference points: Calm, Oura, Whoop, Arc browser for the interface. Not Supabase dashboard. Not Retool.

**Color system.** Dark background with warm accents. Sun pad actions use a warm amber. Moon pad actions use a cool blue-violet. Neutral tones for everything else. Avoid neon, avoid pure black.

**Typography.** One display font for headlines (something editorial, not Inter). One body font for data and UI (Inter or Geist Sans is fine here).

**Motion.** Every state transition is animated. Cards fade and translate in. Transcripts type out token by token. The summary card sheet uses a spring animation. The QR-to-dashboard transition uses a cross-fade with a brief "pairing" loader.

**Distinctive elements.** Use Magic UI's animated beam or orbital components in the waiting state of the practitioner dashboard. Use Aceternity UI's background gradient card for the summary card. Avoid shadcn defaults visible anywhere a judge is looking.

## 10. Build Order

The hackathon window is short. Work in this order and do not jump ahead.

**Phase one, foundation (first three hours).** Next.js app scaffolded. Tailwind, shadcn, Magic UI, Aceternity UI installed. Insforge tables provisioned via MCP. Demo data seeded. Form factor middleware in place with tested block screens. Design tokens and fonts locked in.

**Phase two, client side mobile (next three hours).** Client landing screen with health summary. QR scanner. Realtime event publish working.

**Phase three, practitioner dashboard (next three hours).** Waiting state. Health context panel. Real-time event subscription working so the dashboard populates when a scan happens.

**Phase four, recommendation and session start (next three hours).** Protocol rules module. Recommendation card. Session view shell.

**Phase five, ambient listening pipeline (next four hours).** ElevenLabs Scribe integration. Transcript rendering. Note extraction via Claude Sonnet 4. Note cards UI.

**Phase six, summary card and relapse flag (next three hours).** Summary card composition, realtime delivery to client, animated reveal. Relapse flag rules and dashboard surface.

**Phase seven, polish (next three hours).** Every animation. Every empty state. Demo data double-check. Every copy string reviewed for wellness language compliance.

**Phase eight, demo rehearsal (final two hours).** Run the full demo four times. Identify every moment that is slow, ambiguous, or fragile. Record a backup screen capture of a successful run as a fallback if something fails live.

## 11. Risk Register and Fallbacks

**QR scanner fails on the demo phone.** Fallback: the practitioner dashboard has a "Simulate check-in" button visible in dev mode that fires the same realtime event. Switch to it if the scanner does not resolve in five seconds.

**ElevenLabs Scribe latency spikes.** Fallback: the transcript for the demo audio clip is pre-computed and cached locally. If Scribe takes more than 5 seconds per chunk, fall back to streaming the cached transcript at the correct pace.

**Insforge realtime channel does not fire.** Fallback: both sides poll a backend endpoint every 2 seconds as a backup. The UI reacts to whichever signal arrives first.

**Wifi on stage is unreliable.** Fallback: run the demo on a hotspot from a second phone. Pre-warm all API endpoints to reduce cold-start latency.

**Laptop battery dies mid-demo.** Fallback: obvious one, but bring the charger and plug in before going on stage.

**Pre-recorded audio file is corrupted.** Fallback: keep two copies. One on disk, one on cloud storage.

**The ambient audio pipeline is the highest-variance component.** If the pipeline is not rock-solid by hour 18, cut the live extraction layer and fall back to rendering pre-extracted note cards on a timer synchronized to the audio clip. The transcript is still real; only the extraction step falls back. This is a last resort.

## 12. Explicitly Out of Scope

These are not being built. They are acknowledged in the pitch as roadmap items but do not appear in the demo.

Health Connect and HealthKit actual integrations. The data model is real; the ingestion is seeded.

Voice print enrollment. Diarization is handled by Scribe speaker separation. Voice prints appear in the narrative but are not implemented.

Client-facing push notifications. The summary card delivery uses a realtime channel and an in-app sheet, not a platform push notification. This stays inside the hackathon's realistic scope.

SDK for third-party practitioner apps.

Long-term central storage of raw wearable data. The narrative is session-scoped access; the demo data model reflects this.

Camera-based body mapping and pose estimation. Not building this. The track brief mentions it; other teams will attempt it. The chosen loop coverage comes from wearable context and audio, not from vision.

Pitch deck itself. Slides are produced separately from the codebase. The implementation plan does not cover deck design.
