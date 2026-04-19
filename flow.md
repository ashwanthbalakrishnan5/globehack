# Tide · Demo Flow

Tide is the Hydrawav3 companion layer. One Next.js app, two surfaces:

- **Mobile (client)** at `/client/*` — gated to mobile user-agents
- **Desktop/tablet (practitioner)** at `/practitioner/*` — gated to non-mobile

`middleware.ts` enforces form factor and a `tide-auth` cookie. `?override=1` bypasses both guards for demo recording.

The demo primary is **Alina Zhou**, a first-time client pairing with **Maya Reyes, DPT** at Stillwater Recovery. Marcus Rivera (endurance athlete, 7th session) and Jessica Park (post-injury, relapse flag) exist as secondary clients for breadth.

---

## 0. Before the demo starts

Both surfaces are open on the **live hosted URL** (same origin, two devices):

- Phone on `/client/login` (fresh — Alina is demoed as a first-time client every run)
- Laptop on `/practitioner` (logged in as Maya)

Cross-device state travels over Insforge realtime channels on the deployed origin. Same-origin Zustand + `localStorage` is a convenience for single-device testing only; the demo itself runs on the live Vercel URL from two physical devices.

**Always-new Alina.** The client login screen clears `tide-session`, `tide-body-state`, and `tide-pose` on mount, so no matter how many times the onboarding and session flow is rehearsed, the next phone open starts from a clean slate. The demo operator never has to manually reset state between runs.

---

## 1. Client onboarding (pre-session, one time)

Two steps the client walks through before the first visit, in order:

1. **`/client/onboarding`** — Health Connect grant as a bottom-sheet popup. Permission toggles (HR, sleep, workouts, body). Tapping "Grant" fires `/api/onboarding/health-connect` in the background (non-blocking, fails silently) and routes immediately to `/client/pair`.
2. **`/client/pair`** — Pair with practitioner card (Maya Reyes, DPT). Tapping "Pair with Maya" lands the client on `/client` (home).

From home the client taps the "Check in with Maya" CTA to open the scanner at `/client/checkin`.

---

## 2. Client home

**Route:** `/client` → `components/mobile/m-home.tsx`

- Greeting + 14-day ring summary (HRV, resting HR, sleep) with an HRV sparkline.
- Large "Check in with Maya" CTA.
- Recent sessions list, tonight's coherence protocol tile.
- Bottom tabs: home, history, coherence, settings.

**Settings** (`/client/settings`) lets the client pause any data stream. Each toggle POSTs `/api/client/privacy` which publishes on `privacy:{clientId}` — the practitioner's Relapse view hides any paused client in real time.

---

## 3. Practitioner dashboard (waiting state)

**Route:** `/practitioner` → `components/web/w-today.tsx`

- Left: six-slot schedule with per-client readiness rings. Alina's 11:30 slot is marked `now`.
- Right panel: rotating QR code (`qrcode.react`, 4-min token rotation, signed via `lib/session-token.ts`), Day pulse waveform, Attention queue (relapse flags).
- Subscribes to `checkin:{practitionerId}` on mount. In dev mode a "Simulate check-in" button fires the same POST.

Clicking any schedule row opens `WClientCheckinModal` — a manual pairing path for when the QR path is not what we want to show.

---

## 4. Check-in (the handoff)

### Client side

**Route:** `/client/checkin` → `components/mobile/m-checkin-scan.tsx` then `m-checkin.tsx`

- Camera opens via `@yudiel/react-qr-scanner`. Scanning Maya's QR extracts the token and POSTs `/api/checkin` with `{ token, clientId }`.
- The API route decodes the token, inserts a `sessions` row (protocol defaults to the cooling + 40 Hz preset), then publishes `checkin:{practitionerId}` · `checked_in`.
- Phone flips to `MCheckIn` — a minimal "Paired with Maya" confirmation (TideMark pulse, session + bay line, signals-synced vitals card). No QR is shown on the phone; the client has already scanned the desk QR and does not need to present one back. The screen auto-routes to `/client/onboarding/session` 1.6 s later.
- 1.2 s after the scan the phone _also_ fires `/api/onboarding/health-connect` so the practitioner side sees a separate "Signals received" animation beat after the pairing beat.

### Practitioner side

- The dashboard's `checkin:{practitionerId}` subscription fires, a `SyncOverlay` plays ("paired with Alina"), then `router.push('/practitioner/session/{clientId}')`.
- That page (`components/web/w-context.tsx`) renders client profile, 14-day HRV spark, prior flagged notes, and the recommended protocol card.

---

## 5. Protocol recommendation (automatic on check-in)

**Route:** `/practitioner/session/[id]` → `WContext`

- The rule engine `lib/protocol-rules.ts` runs against the client's real `health_snapshots` rows + prior `session_notes`. HRV drop, resting HR delta, low-sleep run, and asymmetry-keyword notes feed distinct reasoning lines.
- The recommendation card animates in line-by-line (Framer Motion), colored by signal (HRV / HR / Sleep / Note).
- "Just scanned · 11:28 AM · Bay 3" banner sits on top. The card also subscribes to `onboarding:{clientId}` · `health_connected` — when the phone's health-connect push lands, the bio row blurs and refreshes ("Signals received · Health Connect") and auto-advances to onboarding 3.6 s later.
- Buttons: **Begin onboarding** (primary) · **Skip to live** · **Modify** · **Override**.

---

## 6. Onboarding conversation (pre-session intake)

**Route:** `/practitioner/session/[id]/onboarding` → `components/web/w-onboarding.tsx`

Split view. Left: 3D body viewer (`components/features/body-viewer.tsx`, GLTF `public/human_figure/`) and a pose-capture panel (MediaPipe squat + shoulder flexion, before-state). Right: a scripted "AI drafting" sequence — analyzing 14 days → drafting personalized questions → ready.

- Questions are generated deterministically by `lib/onboarding-questions.ts` from the client's profile (football, running, gym, desk hours for Alina).
- Once questions are revealed, the pre-recorded `public/demo-onboarding.mp3` begins playing automatically. Segments come from `public/demo-onboarding-transcript.json`; each segment fires `/api/onboarding/event` which publishes `onboarding:{clientId}:notes` (phone mirror) and `body:{clientId}` (both sides paint the mentioned zones).
- On the phone, `/client/onboarding/session` (`m-onboarding-session.tsx`) renders the same transcript chat-style and lights the same body map.
- "Start session →" unlocks once the transcript has played through.

---

## 7. Live session

**Route:** `/practitioner/session/[id]/live` → `components/web/w-live-session-live.tsx`

Pressing **Start session** enters a choreographed sequence:

1. **Two-party consent banner** — a compact pill sits in the live header the entire session: "⚠ Two-party consent · audio recorded with client acknowledgment." It is visible the whole time Scribe is transcribing so the practitioner has a continuous reminder that the room is being recorded with the client's knowledge.
2. **Belt prep overlay** — full-screen overlay shows the body viewer with a glowing belt at L4–L5, a 9-second auto-countdown, and a "Belt secured · begin now" button.
3. **Device sync** — `lib/mqtt.ts` `startDevice(mac, protocol)` authenticates against the real Hydrawav3 MQTT-over-HTTP bridge (`/api/v1/auth/login` → JWT) and publishes the full session config (playCmd, cycleRepetitions, leftFuncs/rightFuncs, pwmValues, hotDrop, coldDrop, vibMin/Max, totalDuration) on `HydraWav3Pro/config`. If the paired MAC errors, it falls back to the sample MAC from the device API docs so the belt still runs in the demo.
4. **Audio lead-in** — 2.8 s later, `public/demo-session.mp3` begins playing.
5. **Transcription pipeline** — POST to `/api/session/[id]/start` with `audioUrl`. That route calls ElevenLabs Scribe (`lib/elevenlabs.ts`) for diarized segments, then Gemini 3 Flash (`lib/gemini.ts`) for per-segment structured extraction (note_type, quote, rationale, flagged, affectedZones). Each segment writes to `session_notes` and publishes `session:{id}:notes` · `note_added` plus `body:{clientId}` · `zones_updated`.
6. **Fallback** — if fewer than two notes arrive within 6 s, the UI falls back to the cached `public/demo-transcript.json` scrubbed against audio playback time. Transcript still animates at the right pace.

Side panel on the practitioner: live body viewer, pose comparison (before/after once a second capture is taken), mocked live vitals, protocol meter, auto-note chips appearing as they're flagged.

**Client side** (`/client/session`, `m-session-live.tsx`): 3D body viewer with the same zones lighting up via `body:{clientId}`, elapsed timer driven by `liveStartedAt`, "listening in background" indicator.

Secondary route: `/practitioner/session/[id]/resonance` renders a richer resonance map with belt placement and asymmetry bars.

---

## 8. End and review (summary fires)

Practitioner taps **End & review** in the live header.

- `stopDevice()` MQTT ack.
- POST `/api/session/[id]/summary` with the captured before/after body zone maps. The route composes a `SummaryCard` from flagged notes, duration, and HRV-at-session, writes it onto the `sessions` row, and publishes `summary:{clientId}` · `summary_ready`.
- The practitioner is routed to `/practitioner/session/[id]/notes` (`w-notes-review.tsx`) for a staged review of three extracted cards with Keep/Drop toggles and a "card Marcus will see" preview. _Note: this screen renders a fixed three-card sample, not the live extracted notes — it's there to demo the review ergonomic._

### Client receives the card

`components/mobile/summary-listener.tsx` is mounted in every client layout. It subscribes to `summary:{clientId}` · `summary_ready` and, on payload, pops `MSummarySheet` as a full-screen sheet on whatever client screen is open.

Tapping through sheet → `/client/summary` (`m-summary-expanded.tsx`) — the full card with:

- The pulled quote ("you said …")
- Before/after body viewer pair (alternating 2.2 s)
- Measured HR drop, HRV shift, vibration Hz, HRV at session
- Share card button → html2canvas render → Web Share API or Twitter intent fallback
- Shareable OG image at `/share/[id]` (`app/share/[id]/opengraph-image.tsx`)

---

## 9. Relapse flag (post-demo surface)

**Route:** `/practitioner/relapse` → `components/web/w-relapse.tsx`

`lib/relapse-rules.ts` turns three conditions — HRV trending down ≥7 consecutive days, ≥2 flagged complaints, ≥14 days since last visit — into low/medium/high severity. Jessica Park ships high; Marcus low.

Each row exposes **Draft message** → `WDraftMessageDrawer` with a pre-written outreach the practitioner can edit and copy. The list re-subscribes to every `privacy:{clientId}` channel and hides any client who has paused sharing on their phone.

---

## 10. Extras (built, visible in sidebar)

- **`/practitioner/clients/[id]`** — client profile with session history.
- **`/practitioner/revenue`** — revenue/retention view.
- **`/practitioner/coherence`** — practitioner's view of the client breathing protocol.
- **`/client/history`** — session history list.
- **`/client/coherence`** — breathing protocol ring (CoherenceRing component).
- **`/design-system`** — internal reference.

---

## What is real vs staged

### Fully implemented, live

- Next.js 15 App Router, form-factor middleware + auth cookie, split routes.
- Insforge backend (tables: practitioners, clients, health_snapshots, sessions, session_notes, recommendations, relapse_flags). `scripts/seed.ts` seeds the demo set.
- Insforge realtime channels: `checkin`, `onboarding`, `onboarding:*:notes`, `body`, `session:*:notes`, `summary`, `privacy`.
- QR check-in: signed 4-minute rotating token (`lib/session-token.ts`), real camera scan (`@yudiel/react-qr-scanner`), real session row insert, real realtime publish.
- Rule-based protocol recommendation against real DB rows (`lib/protocol-rules.ts`).
- Rule-based relapse flag engine (`lib/relapse-rules.ts`).
- ElevenLabs Scribe speech-to-text with diarization (`lib/elevenlabs.ts`).
- Gemini 3 Flash per-segment note extraction with structured output (`lib/gemini.ts`), including body-zone tagging.
- Per-note realtime fan-out to both practitioner and client surfaces.
- Body-zone state machine (`lib/body-state.ts`) painting the 3D viewer on both sides in sync.
- MediaPipe Tasks-Vision pose capture for squat depth and shoulder flexion (before/after comparison).
- Summary card composition from real flagged notes + body state, realtime delivery to the phone, full-screen sheet listener mounted site-wide.
- Share card rendering via html2canvas + Web Share API fallback, Vercel OG share page at `/share/[id]`.
- Privacy toggles: phone POSTs to `/api/client/privacy`, server publishes `privacy:{clientId}`, practitioner dashboard reacts live.

### Mocked / staged

- **Session audio sources.** Both `demo-onboarding.mp3` and `demo-session.mp3` are pre-recorded files in `public/`. The mic is not live. Everything downstream (Scribe, Gemini, DB writes, realtime, UI) is real against that audio. This is the deliberate stage input.
- **Hydrawav3 belt MQTT.** `lib/mqtt.ts` targets the real Hydrawav3 MQTT-over-HTTP bridge, authenticates for a JWT, and publishes real session config payloads (playCmd, cycles, pwmValues, hot/coldDrop, vibMin/Max, totalDuration) on `HydraWav3Pro/config`. A paired MAC is used when available; otherwise it falls back to the sample MAC from the device API docs so the belt still runs during the demo.
- **Live vitals during the session** (HR 74, HRV ↓11 bpm, etc.) are hardcoded for the demo arc.
- **Alina's Health Connect payload** is a hand-tuned 14-day body rather than a live Android Health Connect bridge (`app/api/onboarding/health-connect/route.ts`).
- **Today dashboard badges** (projected revenue $1,120, 68% rebook rate, avg client HRV wave, first two schedule slots) are visual anchors, not computed.
- **Resonance map zones + asymmetry bars** on `/practitioner/session/[id]/resonance` are a curated default zone set, not derived from this session.
- **Notes review page** renders three hand-authored extracted cards with Keep/Drop. The "Save & fire summary card" button triggers navigation state; the _real_ summary fires on End & review from the live screen.
- **Coherence ring** is a visual-only animation.
- **Next-session dashboard stats and some copy** on the waiting-state dashboard are stage-dressing.

### Explicitly out of scope

- Real Android Health Connect / Apple HealthKit bridge.
- Platform push notifications (summary uses an in-app sheet via realtime instead).
- Third-party SDK, long-term central storage of raw wearable data.
