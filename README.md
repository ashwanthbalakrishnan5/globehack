# Tide

**GlobeHack Season 1 · Hydrawav3 Recovery Intelligence track**

Tide is the companion layer for Hydrawav3 recovery sessions. One Next.js app serves two synchronized surfaces, a client mobile experience and a practitioner desktop dashboard, that talk to each other in real time over a shared backend.

The hero flow: a client scans a rotating QR on the practitioner's tablet, a session row is created, the practitioner receives a rule-based protocol recommendation against live health data, a pre-recorded conversation is transcribed by ElevenLabs Scribe and tagged by Gemini into structured clinical notes that paint a 3D body map on both devices. At end-of-session a shareable summary card is pushed to the client phone.

---

## Demo

- **Hosted URL:** the demo runs on the live Vercel deployment from two physical devices on the same origin.
- **Primary client:** Alina Zhou, first-time pairing with Maya Reyes, DPT at Stillwater Recovery.
- **Secondary clients:** Marcus Rivera (7th session, endurance), Jessica Park (relapse flag, high severity).
- **Form-factor routing:** `middleware.ts` sends mobile user-agents to `/client/*` and desktop or tablet user-agents to `/practitioner/*`. Appending `?override=1` bypasses both the device and auth guard for demo recording.

The full end-to-end walkthrough lives in `flow.md`.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 App Router, React 18, TypeScript 5 |
| Styling | Hand-built design system: inline styles with CSS variables in `app/tokens.css` and atoms in `components/primitives.tsx`. No shadcn, no component library. |
| Backend | Insforge (Postgres and realtime channels) via `@insforge/sdk` |
| Speech to text | ElevenLabs Scribe with speaker diarization |
| Note extraction | Google Gemini 3 Flash with structured output (`note_type`, `quote`, `rationale`, `flagged`, `affectedZones`) |
| 3D viewer | three.js, GLTF human figure in `public/human_figure/` |
| Pose capture | MediaPipe Tasks Vision (squat depth, shoulder flexion) |
| QR | `qrcode.react` on the practitioner side, `@yudiel/react-qr-scanner` on the client side |
| Animation | Framer Motion |
| State | Zustand with `persist` middleware |
| Dates | date-fns |
| Icons | lucide-react |
| Form factor detection | `react-device-detect` on the client, middleware authoritative on the server |
| Share rendering | `html2canvas` in-app, `next/og` (`ImageResponse`) for the share OG image |
| Hosting | Vercel |
| Device link | MQTT over an HTTP bridge (`lib/mqtt.ts`), swappable via env |

---

## Architecture

### Routes

**Client (mobile only):**

- `/client/login`, which clears `tide-session`, `tide-body-state`, and `tide-pose` on mount so every demo run is a first-time Alina.
- `/client/onboarding`, Health Connect bottom sheet. Non-blocking POST to `/api/onboarding/health-connect`.
- `/client/pair`, pair with Maya card.
- `/client`, home with 14-day HRV ring, sparkline, and check-in CTA.
- `/client/checkin`, QR scanner.
- `/client/onboarding/session`, mirrored onboarding transcript.
- `/client/session`, live body viewer with zones lighting in sync with the practitioner side.
- `/client/summary`, expanded summary card with before/after body pair and shareable render.
- `/client/history`, `/client/coherence`, `/client/settings` (privacy toggles).

**Practitioner (desktop or tablet only):**

- `/practitioner/login`, `/practitioner` (today dashboard with rotating QR and attention queue).
- `/practitioner/session/[id]`, context screen with rule-based recommendation.
- `/practitioner/session/[id]/onboarding`, intake conversation plus pose-capture before-state.
- `/practitioner/session/[id]/live`, choreographed live session with belt prep, consent banner, transcript feed, and vitals panel.
- `/practitioner/session/[id]/resonance`, resonance map.
- `/practitioner/session/[id]/notes`, post-session review.
- `/practitioner/relapse`, three-signal relapse flag list with draft outreach drawer.
- `/practitioner/clients/[id]`, `/practitioner/revenue`, `/practitioner/coherence`.

**Share:** `/share/[id]` with a `next/og` image response for link previews.

### API routes (`app/api/`)

- `POST /api/checkin` decodes the signed QR token, inserts a `sessions` row, and publishes on `checkin:{practitionerId}`.
- `GET /api/checkin/token` returns a fresh signed 4-minute token.
- `GET /api/checkin/latest` returns the last check-in for a practitioner as a polling fallback.
- `POST /api/onboarding/health-connect` writes the 14-day snapshot set and publishes `onboarding:{clientId}` · `health_connected`.
- `POST /api/onboarding/event` fires per onboarding-transcript segment and publishes `onboarding:{clientId}:notes` and `body:{clientId}`.
- `POST /api/session/[id]/start` runs ElevenLabs Scribe on the audio URL, then Gemini per-segment extraction, writes each row to `session_notes`, and publishes `session:{id}:notes` · `note_added` plus `body:{clientId}` · `zones_updated`.
- `POST /api/session/[id]/summary` composes the summary card and publishes `summary:{clientId}` · `summary_ready`.
- `POST /api/client/privacy` applies per-stream pause toggles and publishes `privacy:{clientId}`.
- `POST /api/device/start` and `POST /api/device/stop` are the MQTT proxy (`startDevice` and `stopDevice` in `lib/mqtt.ts`).
- `GET /api/flags/[id]` returns relapse severity.

### Realtime channels (Insforge)

`checkin:{practitionerId}`, `onboarding:{clientId}`, `onboarding:{clientId}:notes`, `body:{clientId}`, `session:{id}:notes`, `summary:{clientId}`, `privacy:{clientId}`.

Both surfaces subscribe from mount. `components/mobile/summary-listener.tsx` is mounted in the client root layout so the summary sheet can pop on any screen the phone is currently on.

### Data model (Insforge tables)

`practitioners`, `clients`, `health_snapshots`, `sessions`, `session_notes`, `recommendations`, `relapse_flags`. Seeded by `scripts/seed.ts` (`npm run seed`).

### Core logic modules (`lib/`)

- `session-token.ts`: HMAC-signed 4-minute rotating QR token.
- `protocol-rules.ts`: pure rule engine for the recommendation card. Four distinct signals drive the reasoning lines: HRV drop, resting-HR delta, low-sleep run, asymmetry-keyword notes.
- `relapse-rules.ts`: HRV trend, flagged complaints, and days-since-visit collapsed into low, medium, or high severity.
- `body-state.ts`: body-zone state machine shared by both 3D viewers.
- `onboarding-questions.ts`: deterministic question generator from client profile.
- `elevenlabs.ts`, `gemini.ts`: external-model clients.
- `realtime.ts`: Insforge channel wrappers.
- `queries.ts`: typed Insforge query helpers.
- `mqtt.ts`: device start and stop with placeholder bridge endpoint.
- `store.ts`, `device-store.ts`, `pose-store.ts`: Zustand stores with `persist`.

### Security invariants

- The two-party consent pill is rendered the entire time audio is being recorded (`w-onboarding.tsx`, `w-live-session-live.tsx`). It is not hideable.
- QR tokens are signed and expire every 4 minutes.
- The `tide-auth` cookie gates every non-login route.
- Privacy toggles are authoritative server-side and fan out to the practitioner list over realtime.

---

## Running locally

```bash
npm install
npm run seed   # one-shot seed against Insforge
npm run dev
```

Environment variables required at runtime are enforced in `lib/env.ts` at cold start (Insforge API key, base URL, anon key, and ElevenLabs key). Gemini and MQTT values are read lazily from `process.env` where used. Populate a local `.env` before running.

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Next lint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | Seed Insforge with Alina, Marcus, Jessica, Maya, and 14 days of health snapshots |

---

## What is real vs staged

### Real

- Next.js 15 App Router, middleware form-factor and auth gating, split routes.
- Insforge Postgres and realtime channels end-to-end.
- Signed rotating QR, real camera scan, real session insert.
- Rule-based protocol recommendation and relapse flags against real DB rows.
- ElevenLabs Scribe diarization with Gemini 3 Flash structured extraction, and per-note realtime fan-out.
- Shared body-zone state machine painting both 3D viewers in sync.
- MediaPipe pose capture with before and after comparison.
- Summary card composition, realtime delivery to phone, full-screen sheet listener mounted site-wide.
- Shareable image render via `html2canvas` with Web Share API fallback, plus the `next/og` OG image at `/share/[id]`.
- Privacy toggles propagating live to the relapse list.

### Staged

- Audio sources are pre-recorded files (`public/demo-onboarding.mp3`, `public/demo-session.mp3`). Everything downstream of the audio is real.
- Hydrawav3 belt MQTT targets a placeholder bridge by default, swappable via `NEXT_PUBLIC_MQTT_BASE_URL` and `NEXT_PUBLIC_HYDRAWAV3_MAC_ID`.
- Live vitals during the session are hardcoded for the arc.
- Alina's Health Connect payload is a hand-tuned 14-day body, not a live Android Health Connect bridge.
- Today dashboard badges, resonance map zones, and the three-card notes review are curated visual anchors.

### Out of scope

- Real Android Health Connect or Apple HealthKit bridge.
- Platform push notifications. The summary uses an in-app realtime sheet instead.
- Long-term central storage of raw wearable data.

---

## Repository layout

```
app/                Next.js App Router (client, practitioner, share, api)
  tokens.css        Design system tokens
components/
  mobile/           Client (phone) surface components
  web/              Practitioner (desktop) surface components
  features/         Shared features (body viewer, pose capture, sync overlay)
  primitives.tsx    Reusable design atoms
lib/                Rules engines, external-model clients, realtime, stores
public/             Demo audio, transcripts, GLTF human figure, comic panels
scripts/seed.ts    Insforge seed script
middleware.ts       Form-factor and auth gate
flow.md             Authoritative demo walkthrough
CLAUDE.md           Build guidelines
```

---

## Submission notes

- Track: Hydrawav3 Recovery Intelligence.
- The demo is operated live on two physical devices against the hosted Vercel URL. A recorded walkthrough is available if the venue network prevents a live run.
