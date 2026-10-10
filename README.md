# CourtSide: AI Sports Companion for Fire TV · v2

> Late to the game? Confused by a call? Watching with kids? CourtSide sits beside the match and catches you up, explains plays at your level, jumps to key moments, and answers questions.

Built for the **Fire TV** hackathon track on top of Amazon's `react-native-multi-tv-app-sample`, using **Amazon Devices Builder Tools** (MCP + Agent Skills) in the dev workflow.

**Categories:** Sports · AI-enhanced viewing · Multi-modal UX · Family entertainment

## Features

| Feature | What it does |
|---|---|
| **Catch Me Up** | Recap up to the current playback time. *Spoiler-free* hides the result. |
| **Explain This** | Explains the latest play at **Kid / Casual / Expert** level. |
| **Key Moments** | AI-ranked list; select one and the video seeks there. |
| **Ask CourtSide** | Chips or typed question (plus browser voice on web); answers only from match data. |
| **Live alerts** | Goal/foul pop-ups synced to playback; never steal focus. |
| **Family Mode** | Simple language, spoilers off, bigger text. |
| **Alexa-ready controls** | Labeled controls so Alexa voice navigation can target them on Vega (verify on device). |

> Honesty note: the video is a placeholder clip and the match events are scripted to its timeline. AI features are real; the match is simulated.

## Architecture

```
apps/expo-multi-tv  (Android TV · Fire OS · Web)  ─┐
apps/vega           (Vega OS)                      ├─ packages/shared-ui  (Home, Match, Companion…)
                                                   ┘            │ HTTPS
                                                           service/ (Node AI service)
```
See [ARCHITECTURE.md](./ARCHITECTURE.md), [PROJECT_REQUIREMENTS.md](./PROJECT_REQUIREMENTS.md), [SKILLS.md](./SKILLS.md).

## Prerequisites

- Node.js 20+, Yarn 4.5 (via Corepack / `packageManager` field)
- An AI coding agent supported by Builder Tools
- An LLM API key for the AI service (Anthropic, OpenAI, or Gemini; offline deterministic AI fallback included)
- Optional per target:
  - **Android TV / Fire OS:** Android Studio + TV emulator or a device (`adb`)
  - **Vega:** Vega SDK v0.22+, Java 21+, Python 3; Vega Virtual Device or Vega OS Fire TV Stick

## Setup

```bash
# 1. Builder Tools for your coding agent
npx -y @amazon-devices/amazon-devices-buildertools-mcp@latest init-context --agent <agent-name> --force
npx -y @amazon-devices/amazon-devices-buildertools-mcp@latest check-status --agent <agent-name>

# 2. Base project setup
yarn install

# 3. Start AI Service
cp service/.env.example service/.env     # LLM_API_KEY=... (optional; fallback included)
yarn workspace @courtside/service dev     # AI service on :4000

# 4. Start Universal Multi-TV App
yarn dev:web                             # Web browser; arrow keys = D-pad
yarn dev:android                         # Android TV / Fire OS emulator or device
```

### Other targets (commands from the sample)

```bash
yarn dev:android      # Android TV / Fire OS emulator or device
yarn dev:vega         # Vega Metro bundler
yarn build:vega       # build .vpkg
vega virtual-device start
vega run-app build/<arch>-release/<name>.vpkg
```

## Demo script (about 3 minutes)

1. **Home:** D-pad through rails; open the live match.
2. **Catch Me Up:** open the companion; get a recap; toggle Spoiler-free.
3. **Explain This:** same play at Kid and Expert level.
4. **Key Moments:** select the goal; video jumps.
5. **Live alert:** a goal overlay appears as playback passes it; press Explain.
6. **Ask:** "Who scored first?" then an unanswerable question ("Who will win the league?") to show grounded "I don't have that."
7. **Family Mode:** larger text, simpler wording.
8. **Resilience:** stop the AI service; fallback still works.
9. **(If available)** Show the same UI on Android TV/Fire OS or the Vega Virtual Device.

## Build order

1. Install Builder Tools; run the sample on web.
2. Re-skin Home and add the Match screen in `packages/shared-ui`.
3. Add mock match data (`staticData` JSON → DTO → Model).
4. Build the AI service with schema validation and a fallback pack.
5. Build Companion tabs; wire `seekTo` and playback time.
6. Add live overlay, Family Mode, accessibility labels.
7. Test on Android TV/Fire OS; attempt Vega.
8. Record demo; write submission.

## How AI stays honest

- Prompts contain only structured match data.
- Timestamps and scores come from data, not the model.
- Outputs are schema-validated; spoiler-free mode has a test.
- Unknown questions get "I don't have that."

## License

MIT-0 / Apache-2.0
