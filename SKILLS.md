# CourtSide: Skills & AI Tooling Guide · v2

## 1. Amazon Devices Builder Tools (ADBT)

**What it is (Amazon docs):** a standalone npm package with

- a **Builder Tools MCP server** that gives your AI coding agent Amazon Devices metadata, tools and capabilities, and
- **Agent Skills**: lightweight, modular `SKILL.md` instruction sets for verified Fire TV development and debugging workflows.

Previously named **Vega DevTools** (`@amazon-devices/vega-devtools-mcp`). If you still have the old package configured, remove it and use `@amazon-devices/amazon-devices-buildertools-mcp`.

**Support level:** full for Vega OS, limited for Fire OS (check the ADBT ReadMe for current per-OS capabilities). Fire OS workflows don't require the Vega SDK. Vega workflows need Vega SDK v0.22+.

**Docs home:** `developer.amazon.com/docs/adbt/` (the old `/docs/vega/.../mcp-server` URLs redirect there).

### Install and verify

```bash
npx -y @amazon-devices/amazon-devices-buildertools-mcp@latest init-context --agent <agent-name> --force
npx -y @amazon-devices/amazon-devices-buildertools-mcp@latest check-status --agent <agent-name>
```

`<agent-name>` must be one of the supported agents in the ADBT ReadMe. Then ask your agent:

> "List the tools provided by Amazon Devices Builder Tools and Agent Skills."

### What the docs confirm

| Item | Type | Purpose |
|---|---|---|
| `list_documents` | MCP tool | Lists Vega app-development documents. |
| `read_document` | MCP tool | Reads a document so the agent can follow real guidance. |
| `vega-multi-tv-migration` | Agent Skill | Migrate Vega apps to a cross-device React Native monorepo including Fire OS. |
| `amazon-devices-vega-app-manifest` | Agent Skill | Required `manifest.toml` configuration for Vega apps (package IDs, capabilities, privileges). |
| MCP prompts | Prompts | Run with `/prompts` if your agent supports MCP Prompts. |
| Other workflows | n/a | Docs mention scaffolding, debugging, profiling workflows; full list is in the ReadMe. |

Different doc versions list different skills, so **run the list prompt on your install and paste the result here**:

```
<paste your agent's real list of tools, skills, prompts>
```

## 2. Prompt recipes (suggested wording, not official names)

| Phase | Prompt |
|---|---|
| Orient | "Use Builder Tools to read the docs on focus management for Fire TV React Native and summarize the rules." |
| Scaffold | "In this monorepo (react-native-multi-tv-app-sample), add a `companion` folder to `packages/shared-ui` with a CompanionPanel that has four tabs." |
| Focus | "Audit my screens for focus traps using react-tv-space-navigation patterns." |
| Player | "Wrap react-native-video in a `player` module exposing currentTime and seekTo; add `.kepler.ts` stub for Vega." |
| Data | "Create staticData JSON with 40 match events plus DTO and Model types, following the vega-sports-app pattern." |
| AI service | "Add a `service` workspace with /recap /explain /moments /ask, JSON-schema validation, cache and fallback pack." |
| Manifest | "Check my Vega manifest.toml against the app-manifest skill." |
| Perf | "Profile Home rail scrolling and suggest fixes." |
| Debug | "Here's the Metro/vega run-app error. Find the root cause using Builder Tools docs." |
| Port | "Migrate to a cross-device monorepo including Fire OS" (uses `vega-multi-tv-migration`). |

**Evidence tip:** ask the agent to name which document it read with `read_document`; screenshot it for the submission.

## 3. Project skill: `skills/courtside-dev/SKILL.md`

```markdown
---
name: courtside-dev
description: Conventions for the CourtSide Fire TV app and AI service. Use when adding screens, focus behaviour, platform wrappers or AI features.
---

# CourtSide rules

## Structure
- Shared UI lives in packages/shared-ui. Platform-specific code uses file extensions (.android.ts, .kepler.ts, .web.ts) and exports the same interface.
- Use Yarn (workspaces). Do not add npm lockfiles.

## UI and focus
- Use react-tv-space-navigation for focus. Every interactive element is focusable with a visible focus style.
- Back always returns to the previous focus target. Never trap focus.
- Overlays never take focus automatically.
- Size text with scaledPixels; keep content in safe margins.
- Every interactive element has aria-label (supports Alexa voice navigation and screen readers).

## AI
- Answers are grounded in match JSON only. Timestamps and scores come from data by eventId, never from the model.
- Validate LLM output against a JSON schema before rendering.
- Spoiler-free mode must never reveal the result; keep the unit test.
- Family Mode uses the kid-safe prompt and output filter.
- Every AI call: loader, 4 s timeout, fallback pack entry.

## Code
- TypeScript strict. Secrets only in service/.env.
- Add or update tests when changing prompts or validators.

## Workflow
- Before using a Fire TV / Vega API, look it up with Builder Tools read_document and cite it.
```

## 4. Human skills checklist

| Skill | Why | Where |
|---|---|---|
| React Native + TypeScript | App code | Callstack's free *Ultimate Guide to React Native TV Development* |
| TV focus / spatial navigation | Biggest bug source | `vega-tv-interfaces-sample`; `react-tv-space-navigation` |
| Video, seek | Key Moments | `vega-video-sample`, multi-tv sample player |
| Sports app patterns, theming, a11y, i18n | Polish | `vega-sports-app` |
| LLM prompting and validation | Reliable AI | Anthropic prompt docs |
| Node/Express | AI service | Node docs |

## 5. Starter repos and how we use them

| Repo | Role |
|---|---|
| `react-native-multi-tv-app-sample` | **Base** (monorepo: expo-multi-tv, vega, shared-ui). |
| `vega-sports-app` | Patterns only: DTO/static data, theme, a11y, i18n, KPI test scenarios. It is a separate Vega-only npm project, so we borrow ideas rather than merge code. |
| `vega-tv-interfaces-sample` | Focus, navigation, scrolling patterns. |
| `vega-video-sample` | Player, live TV references for the Vega build. |
| `react-native-multi-tv-helloworld`, `hello-world-fire-tv-react-native` | Lighter fallbacks. |

## 6. Vega commands cheat sheet (from `vega-sports-app`)

```bash
vega virtual-device start                       # start Vega Virtual Device
vega run-app build/<arch>-release/<name>.vpkg   # install + launch on VVD or Fire TV Stick
vega clean                                      # clear build artifacts
```
Vega builds output `.vpkg` per architecture (armv7 for Fire TV Stick; x86_64 or aarch64 for the VVD). The multi-tv sample wraps builds as `yarn build:vega`.
