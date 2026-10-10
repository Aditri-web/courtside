# ⚡ CourtSide — AI Sports Companion for Fire TV

[![CI](https://github.com/Aditri-web/courtside/actions/workflows/ci.yml/badge.svg)](https://github.com/Aditri-web/courtside/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-18%20passing-brightgreen)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](#)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?logo=google)](#ai-service)
[![Fire TV](https://img.shields.io/badge/Fire_TV-Vega_%2B_TVOS-FF9900?logo=amazon)](#)
[![License](https://img.shields.io/badge/license-MIT--0-blue)](#license)

> **Late to the game? Confused by a call? Watching with kids?**
> CourtSide sits beside your match, catches you up in seconds, explains any play at your level, ranks every key moment, and answers your questions — all without spoiling what's ahead.

Built for the **Amazon Devices & Services Hackathon** using:
- 📺 **React Native Multi-TV** monorepo (expo-multi-tv + Vega/KeplerScript for Fire TV OS)
- 🤖 **Gemini 1.5 Flash** via a Type-safe Express AI service
- 🎮 **react-tv-space-navigation** D-pad focus engine
- ⚡ **SSE real-time event ticker** for live companion updates

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **Catch Me Up** | Spoiler-free AI recap from any playback position |
| 🧠 **Explain This** | Breaks down any play/call for Kid / Casual / Expert audiences |
| 🎯 **Key Moments** | Critical turning points ranked by event importance (weight ≥ 0.75) — press SELECT to jump video |
| 💬 **Ask CourtSide** | Grounded Q&A (no hallucination) constrained to visible match events |
| 📡 **Live Ticker** | SSE stream (`/stream`) & timeline-synced companion event overlay |
| 👨‍👩‍👧 **Family Mode** | Kid-safe language, forced spoiler protection, large 10-foot fonts |
| 🛡️ **Spoiler Guard** | Temporal event filtering (tSec ≤ nowSec) + keyword & schema guardrails |

---

## 🗂 Repository Structure

```
courtside/                          ← Yarn 4 workspaces monorepo
├── apps/
│   ├── expo-multi-tv/              ← Fire TV + Apple TV + Android TV (Expo)
│   └── vega/                       ← Fire TV OS via KeplerScript / Vega
├── packages/
│   └── shared-ui/                  ← All screens, companion, navigation, theme
│       └── src/
│           ├── companion/          ← AI Companion Panel + 4 tab features
│           ├── screens/            ← HomeScreen, MatchScreen, Highlights, Family, Settings
│           ├── navigation/         ← Drawer + Stack navigators
│           ├── theme/              ← TV-safe colour tokens + scale system
│           └── utils/              ← VideoHandler, RTL, remote control
├── service/                        ← Node.js/Express AI backend
│   ├── src/
│   │   ├── server.ts               ← REST + SSE endpoints
│   │   ├── adapter/
│   │   │   ├── llmAdapter.ts       ← Orchestration: Gemini → fallback
│   │   │   └── geminiClient.ts     ← Gemini 1.5 Flash REST client
│   │   ├── prompt/                 ← System + user prompts for all features
│   │   ├── fallback/               ← Curated offline AI engine
│   │   ├── validator/              ← Schema + spoiler-leak validation
│   │   └── cache/                  ← TTL response cache
│   └── demo.html                   ← Browser demo for judges (no install)
├── DEMO.md                         ← 8-minute judge walkthrough
├── ARCHITECTURE.md                 ← Full technical architecture
├── docker-compose.yml              ← One-command service start
└── .github/workflows/ci.yml        ← GitHub Actions CI
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (or use Docker)
- Yarn 4 (`corepack enable`)

### 1. Install

```bash
git clone https://github.com/Aditri-web/courtside.git
cd courtside
yarn install
```

### 2. Start the AI Service

```bash
# Option A: Node.js
yarn dev:service          # → http://localhost:4000

# Option B: Docker (zero setup)
docker compose up
```

### 3. Enable Real AI (Optional)

```bash
# Get a free key at https://aistudio.google.com/app/apikey
echo 'GEMINI_API_KEY=your_key\nLLM_PROVIDER=gemini' > service/.env
yarn dev:service
```

Without a key, the service runs in **offline mode** with pre-curated, high-quality AI responses.

### 4. Run the Fire TV App

```bash
# expo-multi-tv (Fire TV / Apple TV / Android TV)
yarn dev

# Vega (Fire TV OS native)
yarn dev:vega
```

### 5. Judge's Browser Demo

Open **`service/demo.html`** directly in Chrome — no install, no toolchain.

---

## 🤖 AI Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service + Gemini status |
| GET | `/match` | Match metadata |
| GET | `/matches` | All available matches |
| POST | `/recap` | Spoiler-safe AI recap |
| POST | `/explain` | Play/rule breakdown |
| GET/POST | `/moments` | AI-ranked key moments |
| POST | `/ask` | Grounded Q&A |
| GET | `/live` | Timeline-filtered event feed |
| GET | `/stream` | **SSE** real-time ticker |
| DELETE | `/cache` | Flush response cache |

---

## 🧪 Testing

```bash
# AI Service — 15 unit tests
yarn test:service

# Remote Control — 3 unit tests
yarn workspace @multi-tv/expo-multi-tv test --watchAll=false

# TypeScript — zero errors
yarn workspace @multi-tv/shared-ui typecheck
```

All **18 tests pass**. Test suites cover:
- API endpoint responses (HTTP 200, schema validation)
- Spoiler-leak guardrails (impossible to reveal future goals)
- Explanation level differentiation (kid / casual / expert)
- Grounded Q&A (rejects out-of-domain questions)

---

## 🎨 Design System

- **Color**: Deep navy `#0F172A` background · Cyan `#00E5FF` focus accent
- **Focus**: Glow rings + scale(1.05) transform on focused elements
- **TV-safe**: `safeZones.actionSafe` margins · scaledPixels() for all measurements
- **Accessibility**: `accessibilityRole` + `accessibilityLabel` on every interactive element

---

## 📖 Documentation

| File | Contents |
|------|----------|
| [DEMO.md](./DEMO.md) | 8-minute judge walkthrough with step-by-step instructions |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Full technical architecture and data flow |
| [PROJECT_REQUIREMENTS.md](./PROJECT_REQUIREMENTS.md) | Hackathon requirements and design decisions |
| [SKILLS.md](./SKILLS.md) | Amazon Devices Builder Tools + SDK guide |

---

## 📜 License

MIT-0 — free to use, fork, and ship. See [LICENSE](./LICENSE).
