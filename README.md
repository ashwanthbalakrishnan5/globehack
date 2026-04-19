# Tide

**GlobeHack Season 1 · Hydrawav3 Recovery Intelligence track**

**Live:** [hydrawav3.vercel.app](https://hydrawav3.vercel.app)

A realtime recovery layer for the Hydrawav3 belt. One Next.js app, two synchronized surfaces, a streaming AI pipeline, and a pair of deterministic rule engines for clinical judgment. The client's phone and the practitioner's tablet stay in lockstep from check-in to share card.

---

## Why this exists

Hydrawav3 is a recovery device that tunes fascia and vagal tone through targeted vibration. Practitioners want to wield it with the care of a thoughtful therapist: read the body, choose the right dose, send the client home with something they can hold onto. Off-the-shelf tools are either a dumb session timer or a bloated EMR. Neither captures the conversation, the choreography, or the intimacy of the session itself.

Tide is that missing layer.

---

## The idea: one app, two surfaces, one body

A practitioner opens a live dashboard on a tablet. A client walks in and scans a rotating QR on the desk. The rest of the hour unfolds on a shared canvas: health data, pose, spoken complaints, and stimulation zones all flowing through the same realtime backbone.

- The **practitioner** sees the clinical layer: recommendation card, transcript feed with AI-flagged notes, live vitals, pose diff, a 3D body painting itself as zones are mentioned.
- The **client** sees the care layer on their phone: the same 3D body lighting up in the same places at the same time, a "listening in background" indicator, and a summary card that arrives at end-of-session wherever their phone currently is.

---

## System overview

```
                    ┌──────────────────────────────┐
                    │   Insforge  (Postgres + rt)  │
                    │   practitioners  clients     │
                    │   sessions       notes       │
                    │   snapshots      flags       │
                    └──────────────┬───────────────┘
                                   │   pub / sub
            ┌──────────────────────┴──────────────────────┐
            ▼                                             ▼
  ┌────────────────────┐                        ┌─────────────────────┐
  │  Client  (mobile)  │                        │ Practitioner (desk) │
  │  /client/*         │◀─ signed QR (HMAC) ─▶│ /practitioner/*     │
  │                    │        4-min rot       │                     │
  │  QR scanner        │                        │  Rotating QR        │
  │  3D body viewer    │                        │  3D body viewer     │
  │  Summary sheet     │                        │  Transcript + notes │
  │  Privacy controls  │                        │  Rec / Relapse card │
  └─────────┬──────────┘                        └──────────┬──────────┘
            │                                              │
            │      middleware.ts routes by form factor     │
            └──────────────────────────────────────────────┘

       ┌────────────────────────────────────────────────┐
       │  AI / ML pipeline                              │
       │  ElevenLabs Scribe       speaker diarization   │
       │  Gemini 3 Flash          structured extraction │
       │  MediaPipe Tasks-Vision  pose capture          │
       │  lib/protocol-rules.ts   recommendation engine │
       │  lib/relapse-rules.ts    three-signal flag     │
       └────────────────────────────────────────────────┘
```

One Postgres + realtime backend, one shared body-zone state machine, two three.js scenes, two form-factor-aware route trees, one auth cookie gating both.

---

## The session, technically

### 1. Pairing is the handshake

Every four minutes the practitioner's tablet rotates a fresh HMAC-signed token and encodes it into a QR (`lib/session-token.ts`). The client opens the camera on `/client/checkin`, scans with `@yudiel/react-qr-scanner`, and posts `{ token, clientId }` to `/api/checkin`. The server validates, inserts a `sessions` row, publishes on `checkin:{practitionerId}`, and both surfaces react on the same tick.

```
  practitioner tablet               phone                 server
  ───────────────────               ─────                 ──────
  render QR(token)
           │
           │  (client scans)
           ▼
                                POST /api/checkin ──▶ validate token
                                                      INSERT sessions
                                                      PUBLISH checkin:{P}
           ▲                         ▲
           └────── realtime fanout ──┘
      SyncOverlay "paired"      MCheckIn "paired with Maya"
      router.push(/session/:id) router.push(/onboarding/session)
```

No shared local storage. No copy-paste codes. No second handshake. The QR is the auth.

### 2. Recommendation, deterministic

The moment the session row exists, `lib/protocol-rules.ts` runs against the client's real `health_snapshots` and prior `session_notes`. Four independent signals produce four independent reasoning lines on the card, each color-coded by source.

| Signal             | Source                            | Example reasoning line                      |
| ------------------ | --------------------------------- | ------------------------------------------- |
| HRV drop           | 14-day HRV trend                  | "HRV down 11ms vs 14d median"               |
| Resting-HR delta   | last 3 days resting HR            | "RHR +6bpm, elevated sympathetic load"      |
| Low-sleep run      | consecutive nights under 6h       | "4 nights under 6h, prioritize downshift"   |
| Asymmetry keywords | flagged notes from prior sessions | "Right glute flagged twice in last 3 weeks" |

No model in the clinical loop. Every line is traceable to a row in Postgres.

### 3. Intake: streaming STT to LLM to UI

Intake begins. Each audio segment is piped through a two-stage AI pipeline, and the structured output drives every affordance on both devices.

```
    audio segment
          │
          ▼
   ElevenLabs Scribe      diarization, speaker labels, timing
          │
          ▼
   Gemini 3 Flash         structured output schema:
                             note_type,  quote,
                             rationale,  flagged,
                             affectedZones[]
          │
          ├──▶ INSERT session_notes
          │
          └──▶ PUBLISH  onboarding:{clientId}:notes  · note_added
                        body:{clientId}              · zones_updated
```

A shared body-zone state machine (`lib/body-state.ts`) consumes `zones_updated` on both the practitioner and the client three.js scenes. Gemini tags a note with `affectedZones: ["lumbar", "right_glute"]`, and both bodies glow in the same places inside the same animation frame. Two scenes, one source of truth, zero polling.

### 4. Live session

Start session pulls the same pipeline over the full session audio, layered with:

- **Two-party consent pill** rendered continuously in the live header whenever Scribe is running. Not hideable. Not gated behind a toggle.
- **Belt prep overlay** with a 9-second countdown and the 3D body highlighting the belt placement.
- **MediaPipe pose capture** running squat depth and shoulder flexion entirely in the browser. Before and after frames persist with the session for the summary card.
- **Device control** through `lib/mqtt.ts`, an MQTT-over-HTTP bridge. Start and stop commands post to a swappable endpoint so the physical belt can be wired in without touching the app.

### 5. Summary delivery, across devices

End & review composes a summary card server-side from flagged notes, body-state deltas, HRV-at-session, and pose differences, then publishes on `summary:{clientId}`. A site-wide listener (`components/mobile/summary-listener.tsx`) is mounted in the client root layout and pops `MSummarySheet` as a full-screen sheet on _whatever phone screen the client happens to be on_: home, history, coherence, settings. The phone does not have to be watching the session.

Tapping through opens the expanded card: the pulled quote, an alternating before and after 3D body pair, measured HR and HRV shift, a one-tap `html2canvas` share with Web Share API, and a `next/og` OG image at `/share/[id]` for link previews.

### 6. Post-session: relapse intelligence

`lib/relapse-rules.ts` collapses three signals into low, medium, or high severity.

```
  HRV trend ↓ ≥ 7 consecutive days
         +                              ┐
  ≥ 2 flagged complaints      ───▶  severity ──▶ WRelapse list
         +                              ┘        with WDraftMessageDrawer
  ≥ 14 days since last visit
```

The relapse list subscribes to every `privacy:{clientId}` channel and hides any client who has paused sharing on their phone, within a tick of the toggle. The practitioner never sees a client the client has opted out of.

---

## What's interesting under the hood

- **Shared 3D state driven by pub/sub.** Two three.js scenes, one body-zone state machine, zero polling. An LLM-tagged note in Postgres becomes a glowing lumbar zone on two different devices inside the same animation frame.
- **Structured output as the clinical contract.** Gemini is constrained to a rigid schema. Every UI affordance (transcript chip, body zone, note card) reads from the same typed note row. Rendering never runs free-form text through the interface.
- **Rule engines, not models, in the clinical loop.** Every recommendation card and relapse flag is deterministic and traceable. The AI colors the session. It does not issue the verdicts.
- **Cross-device realtime as the primary transport.** Zustand + localStorage is a single-device convenience. The live surface runs on two physical devices against the hosted Vercel URL, and every interesting event travels through an Insforge channel.
- **Form-factor routing at the edge.** `middleware.ts` sends mobile user-agents into `/client/*` and desktop / tablet into `/practitioner/*`, with a single `tide-auth` cookie gating both trees.
- **Signed, rotating pairing.** 4-minute HMAC tokens, validated server-side on every scan. No pairing codes, no shared auth state, no second handshake.
- **Privacy that propagates live.** The client toggles a data stream off in Settings, and the practitioner's relapse list reacts on the next tick. No cron, no cache bust.

---

## Tech stack

| Layer                 | Choice                                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework             | Next.js 15 App Router, React 18, TypeScript 5                                                                                                         |
| Styling               | Hand-built design system: inline styles + CSS variables in `app/tokens.css`, atoms in `components/primitives.tsx`. Deliberately no component library. |
| Backend               | Insforge (Postgres + realtime channels) via `@insforge/sdk`                                                                                           |
| Speech to text        | ElevenLabs Scribe with speaker diarization                                                                                                            |
| Structured extraction | Google Gemini 3 Flash with JSON schema output                                                                                                         |
| 3D                    | three.js, GLTF human figure in `public/human_figure/`                                                                                                 |
| Computer vision       | MediaPipe Tasks-Vision (pose)                                                                                                                         |
| QR                    | `qrcode.react` on the tablet, `@yudiel/react-qr-scanner` on the phone                                                                                 |
| Animation             | Framer Motion                                                                                                                                         |
| State                 | Zustand with `persist` middleware                                                                                                                     |
| Share surface         | `html2canvas` + Web Share API, `next/og` (`ImageResponse`) for OG                                                                                     |
| Device link           | MQTT over an HTTP bridge (`lib/mqtt.ts`), env-swappable                                                                                               |
| Hosting               | Vercel                                                                                                                                                |

---

## Running locally

```bash
npm install
npm run seed    # one-shot Insforge seed (Alina, Marcus, Jessica, Maya, 14d snapshots)
npm run dev
```

Required env vars are validated in `lib/env.ts` at cold start (Insforge API key / base URL / anon key, ElevenLabs key). Gemini and MQTT env vars are read lazily where used. Populate a local `.env` before running.

| Command             | Purpose                   |
| ------------------- | ------------------------- |
| `npm run dev`       | Next.js dev server        |
| `npm run build`     | Production build          |
| `npm run start`     | Run the production build  |
| `npm run lint`      | Next lint                 |
| `npm run typecheck` | `tsc --noEmit`            |
| `npm run seed`      | Seed Insforge demo cohort |

---

## Repository layout

```
app/                Next.js App Router (client, practitioner, share, api)
  tokens.css        Design system tokens
components/
  mobile/           Client (phone) surface
  web/              Practitioner (desktop) surface
  features/         Shared features (body viewer, pose capture, sync overlay)
  primitives.tsx    Reusable design atoms
lib/                Rule engines, external-model clients, realtime, stores
public/             Audio assets, transcripts, GLTF human figure, comic panels
scripts/seed.ts     Insforge seed script
middleware.ts       Form-factor and auth gate
flow.md             End-to-end walkthrough
CLAUDE.md           Build guidelines
```

---

## Scope

Tide focuses on the in-session and post-session recovery loop. These are intentionally outside the submission surface:

- Native Android Health Connect or Apple HealthKit bridges. Health data enters through a signed ingestion endpoint.
- Platform push notifications. The post-session summary arrives through an in-app realtime sheet that fires wherever the phone currently is.
- Long-term central storage of raw wearable telemetry.
