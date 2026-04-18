# CLAUDE.md

Behavioral guidelines for Claude when working on this hackathon codebase.

## 0. Project Context

This is a hackathon build for GlobeHack Season 1 on the Hydrawav3 Recovery Intelligence track. Judging criteria are in `IMPLEMENTATION_PLAN.md`. Three facts drive every decision:

- **Judges never see the codebase.** They see a demo. Code quality matters only as far as it produces a working, visually polished demo on time. Do not optimize for anything else.
- **Visual impact outweighs technical complexity.** A feature that works and looks great beats a feature that is technically impressive but renders as a dashboard full of text.
- **Time is the binding constraint.** Every hour spent building a primitive that already exists as a library is an hour not spent on the demo surface.

Work within these facts. Do not argue with them in favor of engineering purity.

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them. Don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Prefer Existing Libraries Over Writing From Scratch

This is the single most important rule in this codebase.

Hackathon success depends on not reinventing anything. Before writing custom code, search for a library that already solves the problem. If one exists with reasonable popularity and a permissive license, use it. Do not write a bespoke implementation because it feels cleaner.

This applies to:

- **UI primitives.** Use shadcn/ui, Magic UI, and Aceternity UI. Do not hand-build buttons, cards, sheets, dialogs, or animated backgrounds.
- **Charting.** Use Recharts. Do not roll SVG charts by hand.
- **QR generation and scanning.** Use `qrcode.react` and `@yudiel/react-qr-scanner`. Do not write camera access code from scratch.
- **Animations.** Use Framer Motion. Do not write CSS keyframes for interactive transitions.
- **State.** Use Zustand. Do not write a context provider stack.
- **Dates.** Use `date-fns`. Do not write date math.
- **Icons.** Use `lucide-react`. Do not use custom SVGs unless the design demands it.
- **Form factor detection.** Use `react-device-detect` on the client side alongside middleware.
- **Shareable images.** Use Vercel OG or html2canvas.

If a library is missing or unclear, consult Context7 via MCP for current documentation before writing the integration. Do not rely on memory for library APIs.

Writing glue code between libraries is fine and expected. Writing a library from scratch when one exists is a bug.

## 3. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

**KISS.** Keep every solution as simple as the problem allows. If the feature is a rule-based lookup, write a rule-based lookup, not a pluggable strategy pattern.

**YAGNI.** Do not build what the next feature might need. Build what this feature needs. The implementation plan is the spec. Nothing beyond it ships.

**DRY, with judgment.** Repeat yourself twice before abstracting. Premature deduplication is harder to undo than duplication. Two similar components are fine; a generic one with seven props is not.

**SOLID, applied pragmatically.** In a hackathon codebase, the useful half of SOLID is single-responsibility (each function does one thing) and dependency-inversion (pass Insforge and ElevenLabs clients in, don't import them globally). Ignore the rest.

## 4. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it. Don't delete it.

When your changes create orphans:

- Remove imports, variables, and functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 5. MCP Usage

The project uses three MCP servers. Use them as the primary interface, not just as information sources.

### 5.1 Insforge MCP

Insforge is the backend. All schema work, table provisioning, row seeding, query construction, and realtime channel setup goes through the Insforge MCP tools.

Do not write custom Postgres migrations. Do not set up a separate ORM. The MCP is the interface.

Before assuming a table exists, query the schema via the MCP. Before writing a query by hand, check if the MCP has a query builder or generator.

Seeding demo data: script it as a one-shot through the MCP. Do not hand-write insert statements in application code.

Realtime channels: use the Insforge realtime primitives. Do not add a separate WebSocket library.

### 5.2 ElevenLabs MCP

ElevenLabs handles audio. For this project, the relevant endpoint is Scribe (speech-to-text with speaker diarization).

Use the MCP to interact with the Scribe endpoint. Do not hand-roll an HTTP client against ElevenLabs.

If the MCP does not expose a specific Scribe feature, check Context7 for the current ElevenLabs REST docs before falling back to a raw fetch.

### 5.3 Context7 MCP

Context7 provides current library documentation. Use it whenever a library API is uncertain.

Do not guess at API shapes based on training data. Libraries change. If you are about to write an integration and have any uncertainty about the current API, resolve the library ID through Context7 and query the docs first.

This is especially important for Next.js 15, shadcn/ui, Magic UI, Aceternity UI, Insforge, and ElevenLabs.

## 6. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add the recommendation card" becomes "Given mock client B, the card renders with the correct protocol parameters and three reasoning lines within one second of mount."
- "Make the check-in work" becomes "Scanning the QR on the client phone causes the practitioner dashboard to navigate to the session view within two seconds."
- "Fix the transcript" becomes "The demo audio plays end-to-end and produces at least eight speaker-labeled segments in the UI."

For multi-step tasks, state a brief plan with verification steps. Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 7. Demo Priority

This is a hackathon rule, not a general engineering rule. It overrides some of the above when they conflict.

- **Demo paths are golden.** The exact clients, sessions, and audio clips used in the demo must work perfectly. Edge cases outside the demo path are lower priority than polish inside it.
- **Visual polish is not optional.** If a feature works but looks generic, it is incomplete. Every screen a judge will see gets a design pass before being called done.
- **Animations matter.** A card that fades in is more convincing than a card that appears. Budget time for motion design, not just layout.
- **Empty states are hero states.** The first thing the judge sees is the practitioner dashboard in a waiting state. That screen must look intentional, not empty.

## 8. What Not To Build

The `IMPLEMENTATION_PLAN.md` has an explicit out-of-scope section. Respect it. If an idea not in the plan seems compelling mid-build, surface it as a question instead of silently building it. Scope creep is the primary way hackathon projects fail.

## 9. Style Preferences

- **No em dashes** in any generated text, comments, commit messages, or user-facing copy. Use commas, colons, or sentence breaks instead.
- **Wellness language only.** Never use "treats," "cures," "diagnoses," or "heals" in user-facing copy. Use "supports," "empowers," or "enhances." The brand is spelled `Hydrawav3` with a lowercase `w` and the numeral `3`. Never `HydraWave3` or `Hydrawave3`.
- **Avoid generic AI aesthetics.** No purple-to-pink gradients on hero buttons. No default shadcn cards on the hero surface. No Inter + black + white on a landing page. The project should look designed, not generated.

## 10. When In Doubt

Ask. The cost of a clarifying question is seconds. The cost of building the wrong thing is hours.

**These guidelines are working if:** the diff is small, the demo works, the screens look designed, the MCPs are doing the heavy lifting, and you asked at least one clarifying question before the build started.
