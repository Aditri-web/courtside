# CourtSide: Architecture · v2

Updated to match the real structure of `react-native-multi-tv-app-sample` (Yarn workspaces monorepo).

## 1. Overview

```
courtside/  (fork of react-native-multi-tv-app-sample)
├── apps/
│   ├── expo-multi-tv/      # Android TV, Fire OS, Apple TV, Web (Expo SDK 54, RN 0.81)
│   └── vega/               # Vega OS build (Vega SDK, @amazon-devices/*)
├── packages/
│   └── shared-ui/          # shared components, screens, navigation  ← most of our work
│       └── src/companion/  # NEW: CourtSide companion feature
└── service/                # NEW workspace: AI service (Node + TS)
```

```
┌──────────────── App (React Native for TV, one shared UI) ─────────────────┐
│ Screens: Home · Match · Highlights · Family · Settings                    │
│   Match = VideoPlayer + CompanionPanel                                    │
│ CompanionPanel tabs: Catch Up · Explain · Moments · Ask                   │
│ State: playback time, profile (family/spoilers/level), companion results │
│ Focus: react-tv-space-navigation   Remote: RemoteControlManager.*.ts      │
│ Platform wrappers (file extensions):                                      │
│    player.{ts,android.ts,kepler.ts}   speech.{ts,web.ts}                  │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │ HTTPS JSON (+ SSE for live feed)
┌───────────────────────────────▼───────────────────────────────────────────┐
│ AI Service (Node)  POST /recap · POST /explain · GET /moments · POST /ask │
│                    GET /live (simulated events)                           │
│ Prompt builder → LLM adapter → validator (schema, grounding, spoilers)    │
│ Response cache · Fallback pack · Match data (staticData JSON)             │
└───────────────────────────────────────────────────────────────────────────┘
```

## 2. Technology choices (verified from the starters)

| Concern | Choice | Source |
|---|---|---|
| Monorepo | Yarn 4.5 workspaces | multi-tv sample |
| UI framework | React Native (tvOS fork), Expo SDK 54 for universal app | multi-tv sample |
| Navigation | React Navigation 7 + drawer | multi-tv sample |
| Focus | `react-tv-space-navigation` | multi-tv sample |
| Remote keys | `RemoteControlManager.android.ts` (react-native-keyevent), `.kepler.ts` (Vega TVEventHandler) | multi-tv sample |
| Video | `react-native-video` (Android TV/Fire/web); W3C Media APIs on Vega; Shaka in `vega-sports-app` | both samples |
| Data pattern | `staticData` JSON → DTO → Model parse; SWR hooks | `vega-sports-app` |
| Theming | palette + tokens files | `vega-sports-app` |
| i18n / a11y | i18n service; a11y service with hints | `vega-sports-app` |
| AI service | Node 20 + TypeScript, pluggable LLM adapter | ours |

## 3. Components

| Component | Responsibility |
|---|---|
| `Home`, `Drawer` | Reused/re-skinned from sample (hero, grid, drawer). |
| `MatchScreen` | Hosts player and companion; owns playback time. |
| `VideoPlayer` wrapper | Exposes `currentTime`, `seekTo(sec)`, `onTime`. Web/Android: react-native-video. Vega: W3C player (stretch). |
| `CompanionPanel` | Four tabs; takes focus via a dedicated button; Back returns focus to player. |
| `LiveOverlay` | Toast for simulated events; never steals focus; auto-dismiss. |
| `aiClient` | Calls service; loader, 4 s timeout, fallback. |
| `speech` wrapper | Web: Speech API. Native: not available, UI falls back to chips/typed. |
| `a11y` labels | `aria-label` on key controls to enable Alexa voice navigation where supported. |
| AI service | Prompting, validation, cache, live simulator. |

## 4. Data model

```ts
type Match = { id: string; sport: 'football'|'cricket'|'basketball'; home: Team; away: Team;
               status: 'live'|'upcoming'|'finished'; videoUrl: string; durationSec: number };
type MatchEvent = { id: string; tSec: number;           // position on the PLACEHOLDER video timeline
                    clock: string; type: 'goal'|'foul'|'card'|'chance'|'substitution'|'wicket'|'boundary';
                    team: string; player?: string; description: string;
                    score: { home: number; away: number }; importance: number /*0-1*/ };
type Profile = { mode: 'standard'|'family'; spoilers: boolean; level: 'kid'|'casual'|'expert' };
```
Events are scripted so `tSec` lines up with the sample clip; the "match clock" is a story told over that clip.

## 5. AI features

| Feature | Input | Output (schema-validated) | Guardrails |
|---|---|---|---|
| Catch Me Up | events with `tSec ≤ now` (all, if spoilers on) | `{headline, bullets[3..5]}` | Spoiler-free: no final score/result; tested. |
| Explain This | latest event, rule snippet, level | `{explanation, term?}` | Kid: short words, no graphic language. |
| Key Moments | all events | `[{eventId, title, why}]` | IDs must exist; `tSec` read from data. |
| Ask | question + events | `{answer, sources[]}` | Unknown → "I don't have that." |

Pattern: structured data → prompt → validate → render. The model never supplies numbers or timestamps.

## 6. Key flows

**Catch Me Up:** button → loader → `POST /recap {matchId, nowSec, spoilers}` → service filters events, checks cache, calls LLM, validates → bullets render. Timeout or error → fallback pack entry.

**Live overlay:** player `onTime` crosses an event `tSec` → app shows overlay (5 s) with Explain/Replay actions; focus unchanged. (Driven by playback time, so the demo is deterministic. `GET /live` is optional.)

**Ask:** chip/typed/web-voice text → `POST /ask` → answer card with "jump to moment" link.

**Alexa voice navigation (Vega):** focusable controls expose labels so utterances like "select Catch Me Up" can map to them. Validate on VVD/device; treat as a bonus.

## 7. Platform strategy

| Target | App | Notes |
|---|---|---|
| Web | `expo-multi-tv` (`yarn dev:web`) | Fast dev and fallback demo; arrow keys, Enter, Back. |
| Android TV / Fire OS | `expo-multi-tv` (`yarn dev:android`) | Real D-pad behaviour. No Vega SDK required. |
| Vega OS | `apps/vega` (`yarn dev:vega`, `yarn build:vega`) | `.vpkg` runs on Vega Virtual Device or Vega Fire TV Stick. Needs Vega SDK v0.22+. |

Shared logic lives in `shared-ui`; anything platform-specific goes behind `.android.ts` / `.kepler.ts` / `.web.ts` files so both apps import the same API.

## 8. Security and privacy

- LLM key only in `service/.env`.
- Validate and size-limit service inputs; rate-limit `/ask`.
- No accounts or personal data; profile in local storage.
- Family Mode: stricter system prompt + output filter.

## 9. Testing and observability

- Unit: prompt builder, validators (spoiler-leak test), moments ranking.
- Manual D-pad script per screen; focus audit.
- Performance: use `vega-sports-app` KPI scenarios as a model; ADBT profiling workflows where supported.
- Service logs: latency, cache hit, fallback used.
