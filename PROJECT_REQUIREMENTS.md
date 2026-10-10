# CourtSide: Project Requirements (Fire TV Hackathon) · v2

> v2 updates v1 after checking the starter repos and Amazon's Builder Tools docs. See section 2 for what changed.

## 1. Problem statement, explained

> Start with the Amazon Devices Builder Tools (MCP server + Agent Skills). Build a **demo-ready Fire TV app** for Fire OS or Vega OS using React Native, web technologies, or Android (Kotlin/Java). Prioritized categories: AI-enhanced viewing, sports, fitness, family entertainment, multi-modal UX, computer vision.

| Phrase | Meaning for us |
|---|---|
| **Amazon Devices Builder Tools (ADBT)** | A standalone npm package: an MCP server plus markdown Agent Skills that give your *coding assistant* Fire TV/Vega context. It helps you **build**; it is not a runtime part of your app. Amazon says it has full support for Vega OS and limited support for Fire OS. |
| **Fire OS vs Vega OS** | Fire OS is Android-based. Vega OS is Amazon's newer in-house OS for Fire TV, built around React Native. You may target either. |
| **Demo-ready** | Runs reliably, looks polished at 10-foot distance, and demos in about 3 minutes. |
| **Categories** | Entering inside these is likely to help. Combining several is stronger than one. |

## 2. Doubts clarified (what I checked and what changed)

| # | Doubt in v1 | What I found | Change made |
|---|---|---|---|
| 1 | Which starter, and what's its layout? | `react-native-multi-tv-app-sample` is a **Yarn 4.5 monorepo**: `apps/expo-multi-tv` (Android TV, Apple TV, Fire OS, web), `apps/vega` (Vega OS), `packages/shared-ui` (shared components/screens/navigation). Expo SDK 54, RN 0.81, React Navigation 7. | Repo layout, setup and commands rewritten around it (`yarn`, not `npm`). |
| 2 | Run commands | `yarn dev:web`, `yarn dev:android`, `yarn dev:vega`, `yarn build:vega`. | README uses these. |
| 3 | Focus and remote handling | Uses `react-tv-space-navigation` and per-platform `RemoteControlManager` files (`.android.ts`, `.ios.ts`, `.kepler.ts`). Web uses keyboard arrows. | Architecture uses these libraries and file-extension pattern for our platform wrappers. |
| 4 | Video | Sample uses `react-native-video` (custom overlay on Android TV/Fire/web; W3C Media APIs on Vega). `vega-sports-app` uses a customized Shaka Player and a headless player. | Player wrapper must expose `currentTime`/`seekTo` per platform. Vega's player is the riskiest piece. |
| 5 | Voice input on Vega | Docs say React Native for Vega supports remote, touch and **Alexa voice control** (navigate apps, control media; ARIA props like `aria-label`, `alexaEntityType` per a Software Mansion write-up). I found **no documented free-form microphone/speech API for apps**. | Voice is split: (a) **Alexa voice navigation** via accessibility labels, (b) **in-app Q&A** via on-screen chips, typed text, and web speech on the web build. I no longer claim on-device free-form voice. |
| 6 | Builder Tools skills | Documented: `vega-multi-tv-migration`, `amazon-devices-vega-app-manifest`; MCP tools `list_documents`, `read_document`; **MCP prompts** (run via `/prompts`). Full list is in the ADBT ReadMe. Docs moved to `developer.amazon.com/docs/adbt/`. | SKILLS.md updated. |
| 7 | Vega prerequisites | Vega SDK v0.22+ for Vega workflows; Fire OS workflows don't need it. Vega sample also lists Java 21+, Python 3, Node 18 to 20; build outputs `.vpkg`; run on **Vega Virtual Device** or a Vega OS Fire TV Stick. | Prereqs and run steps updated; Node pinned to 20. |
| 8 | Which OS to target | Unknown; depends on your machine/device. | Plan is **shared-UI first**: build in `shared-ui`, demo on web + Android TV/Fire OS, add Vega as a stretch/showcase. Decision rule in section 6. |
| 9 | Licensing | Starters are MIT-0 (very permissive). | Noted; no restriction on reuse. |
| 10 | Real match video | There is no licensed match footage. | Video is a **placeholder clip**; match events are **scripted to its timeline**. Say this openly in the demo. |

Still unconfirmed (can't be verified from docs): the hackathon's judging criteria, submission format, and whether a physical device is required.

## 3. What we are building

**CourtSide**: an AI sports companion for Fire TV that sits beside a match and lets viewers:

- **Catch up** on a game they joined late (spoiler-aware recap).
- **Understand** a play, explained at Kid / Casual / Expert level.
- **Jump** to AI-ranked key moments.
- **Ask** questions about the match (chips, typed, or web voice) and get answers grounded in match data.

**Categories covered:** Sports (primary), AI-enhanced viewing, multi-modal UX (remote + Alexa voice navigation + chips/typed Q&A), family entertainment (Family Mode).

**Out of scope:** licensed live video, payments/betting, computer vision (Fire TV generally has no camera), on-device free-form speech recognition, multi-device sync.

## 4. Goals

| ID | Goal |
|---|---|
| G1 | Polished, focus-navigable 10-foot UI. |
| G2 | At least three visible AI features. |
| G3 | Multi-modal control: remote, Alexa voice navigation, chips/typed Q&A. |
| G4 | Demonstrable use of Builder Tools (MCP + skills) in the build. |
| G5 | Reliable demo with cached AI responses if network/LLM fails. |

## 5. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Home with hero and rails: Live Now, Upcoming, Highlights, Family Picks (reuse sample hero/grid). | Must |
| FR-2 | Left drawer nav: Home, Live, Highlights, Family, Settings (reuse sample drawer). | Must |
| FR-3 | Match screen: video + side **Companion panel**. | Must |
| FR-4 | **Catch Me Up**: recap up to current playback time; Full and Spoiler-free modes. | Must |
| FR-5 | **Explain This**: latest play explained at Kid/Casual/Expert. | Must |
| FR-6 | **Key Moments**: ranked list; selecting seeks video. | Must |
| FR-7 | **Ask**: chips + typed question (+ web speech on web build); grounded answers; "I don't have that" when unknown. | Must |
| FR-8 | **Live event feed** (simulated, tied to playback time): goal/foul overlay that does not take focus. | Should |
| FR-9 | **Family Mode** profile: simple language, spoilers off, larger text. | Should |
| FR-10 | Alexa voice navigation: key controls carry `aria-label` (and Vega `alexaEntityType` where applicable) so "Alexa, select Catch Me Up" can work on Vega. Verify on device/VVD. | Should |
| FR-11 | Text-to-speech readout. | Could |
| FR-12 | Team theming via palette/tokens (pattern from `vega-sports-app`). | Could |
| FR-13 | Settings: language (i18n), text size, spoilers. | Could |

## 6. Platform decision rule

| If you have... | Do this |
|---|---|
| Only a laptop, no TV device | Build in `shared-ui`; demo on **web** (and Android TV emulator if available). |
| Android TV / Fire OS device or emulator | Add real D-pad testing there (Fire OS workflows don't need the Vega SDK). |
| Vega SDK working (x86_64 or Mac M-series) + VVD or Vega Fire TV Stick | Also build `apps/vega`; make this the showcase. |

Time-box Vega SDK setup (suggest half a day). If it stalls, ship on web + Android TV/Fire OS and say so; the brief allows Fire OS or Vega.

## 7. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | Every interactive element reachable by D-pad; Back always works; no focus traps. |
| NFR-2 | 10-foot UI: large text (scale with `scaledPixels` from the sample), high contrast, safe margins. |
| NFR-3 | Performance: smooth rail scrolling; check against the KPI-style scenarios in `vega-sports-app` (`kpi-test-scenarios`) and ADBT profiling workflows where supported. |
| NFR-4 | AI: loader immediately, answer visible in about 3 s (cache/stream), 4 s timeout then fallback. |
| NFR-5 | Grounding: answers use supplied match data only; model never supplies timestamps/scores. |
| NFR-6 | Safety: Family Mode prompt + output filter; no personal data; API keys server-side only. |
| NFR-7 | Accessibility: labels on all controls; screen-reader hints (pattern from `vega-sports-app` a11y service). |
| NFR-8 | Portability: shared UI code in `packages/shared-ui`; platform code via file extensions. |

## 8. Constraints and assumptions

- Base: `react-native-multi-tv-app-sample`; Yarn 4.5 workspaces; Node 20; TypeScript.
- Mock data in `staticData` JSON with DTO to Model parsing (pattern from `vega-sports-app`).
- Video is a CORS-enabled sample MP4/HLS (web requires CORS).
- LLM is pluggable behind a small Node service (a new workspace).
- Vega SDK v0.22+ only if building for Vega.

## 9. Deliverables

1. Repo (app + AI service).
2. README.md, ARCHITECTURE.md, SKILLS.md, this file.
3. About 3-minute demo video + screenshots.
4. Evidence of Builder Tools use (prompt log / screenshots, including `read_document` citations).
5. Setup that works from a clean clone.

## 10. Acceptance criteria

- [ ] `yarn dev:web` runs; Home rails navigate with arrow keys.
- [ ] Match screen shows video + companion panel.
- [ ] Catch Me Up in under about 3 s; Spoiler-free output never contains the final result (unit test).
- [ ] Explain This differs between Kid and Expert.
- [ ] Selecting a Key Moment seeks the video to the data timestamp.
- [ ] Simulated goal overlay appears without changing focus.
- [ ] Unknown question returns "I don't have that."
- [ ] AI service stopped: fallback pack still serves the demo match.
- [ ] Key controls have accessibility labels.
- [ ] At least one run on an Android TV/Fire OS or Vega target (or documented reason if not).

## 11. Judging alignment (assumed)

| Likely criterion | Our answer |
|---|---|
| Category fit | Sports + AI viewing + multimodal + family. |
| Technical depth | Focus management, grounded AI, live events synced to playback, fallback cache. |
| Use of provided tools | ADBT MCP/skills used and documented. |
| Demo quality | Scripted 3-minute flow. |
| Originality | Spoiler-aware recap + age-level explanations. |

## 12. Risks

| Risk | Mitigation |
|---|---|
| No Vega/Fire TV hardware | Web + emulator; VVD if SDK works. |
| Vega player complexity (W3C/Shaka) | Start with `react-native-video` path; Vega player only if time allows. |
| Alexa voice behaviour unverifiable off-device | Treat FR-10 as Should; chips/typed Q&A always works. |
| LLM latency/outage | Cache + fallback pack. |
| Hallucinated facts | Grounding + validation. |
| Scope creep | Cut FR-11 to FR-13 first. |

## 13. Timeline

| Phase | Output |
|---|---|
| 0 | ADBT installed, sample runs on web (`yarn dev:web`). |
| 1 | Home/drawer re-skinned; Match screen shell. |
| 2 | Mock match data + AI service endpoints. |
| 3 | Companion panel features (Catch Up, Explain, Moments, Ask). |
| 4 | Live overlay, Family Mode, accessibility labels. |
| 5 | Android TV/Fire OS run; Vega attempt; performance pass. |
| 6 | README, demo video, submission. |
