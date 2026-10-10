# CourtSide AI — Live Demo Script for Judges

> **Hackathon Category**: Amazon Devices & Services (Fire TV)
> **Stack**: React Native (react-native-tvos), Multi-TV Monorepo, Gemini 1.5 Flash, Node.js/Express
> **Time to judge demo**: ~8 minutes

---

## 🚀 Quick Start (2 commands)

```bash
# Terminal 1 — AI Service
yarn dev:service          # starts http://localhost:4000

# Terminal 2 — Fire TV App
yarn dev                  # Expo Metro bundler
```

**Or use Docker (no Node.js needed):**
```bash
docker compose up         # spins up the service on :4000
```

Then open **`service/demo.html`** in a browser to interact with all AI features live.

---

## 🎯 Feature Walkthrough

### 1. CourtSide Companion Panel (side-by-side with live video)
- Open the app and select any match card from the **Home** screen
- The **Match Screen** opens with the video player on the left and the AI Companion Panel on the right
- The panel defaults open so judges see it immediately

**Demo flow:**

| Step | What to do | What you see |
|------|-----------|--------------|
| 1 | Press ▶ on any card | Video plays + CourtSide AI Panel opens |
| 2 | Focus on **⚡ Catch Up** tab | AI generates a real-time spoiler-free recap |
| 3 | Change level to **🧒 Kid** | Recap switches to child-friendly language |
| 4 | Focus on **🧠 Explain** tab | Breakdown of the last major event at current time |
| 5 | Focus on **🎯 Moments** tab | Ranked list of key moments — press SELECT to jump video |
| 6 | Focus on **💬 Ask AI** tab | Type/select a question, AI answers with source event IDs |

### 2. Remote Control Integration
- **D-pad navigation** works fully (react-tv-space-navigation)
- **SELECT** confirms / jump-to-moment
- **BACK** closes companion panel first, then exits player
- **MENU** opens the drawer navigation

### 3. AI Explanation Levels (3 audiences in one app)
Navigate to **Settings** screen and change the AI level:
- 🧒 **Kid** — "Saka did a cool wiggle and scored! The crowd went crazy!"
- ⚽ **Casual** — "Bukayo Saka cuts inside and curls into the bottom corner (1-0)"
- 📊 **Expert** — "Inverted winger exploit: Saka's inside cut created optimal shooting angle..."

### 4. Spoiler-Free Protection
- At timestamp **0:00–3:00**: recap only describes what's happened so far
- Final score never leaks until the viewer reaches end-of-match
- Settings screen has a toggle for power users who want full spoilers

### 5. Family Mode
Navigate to **👨‍👩‍👧 Family Picks** screen:
- Toggle Family Mode ON
- All AI explanations instantly switch to Kid level
- Font scale increases to TV-safe large
- Spoilers permanently protected

---

## 🤖 Gemini Live AI (optional)

If `GEMINI_API_KEY` is set in `service/.env`:
1. The service POSTs to **Gemini 1.5 Flash** with strict JSON schema output
2. Real AI generates the recap, explain, and ask responses
3. Falls back to curated local engine within 5.5s if the API is slow/offline
4. Health endpoint (`GET /health`) shows `geminiEnabled: true`

**To enable:**
```bash
echo 'GEMINI_API_KEY=your_key_here' >> service/.env
echo 'LLM_PROVIDER=gemini' >> service/.env
yarn dev:service
```

Get a free key at: https://aistudio.google.com/app/apikey

---

## 🌐 API Demo (Browser)

Open `service/demo.html` directly in Chrome — no install needed.

| Endpoint | Method | Feature |
|----------|--------|---------|
| `/health` | GET | Service + Gemini status |
| `/recap` | POST | Spoiler-safe AI recap |
| `/explain` | POST | Play/rule breakdown |
| `/moments` | GET | AI-ranked moments |
| `/ask` | POST | Grounded Q&A |
| `/live` | GET | Timeline-filtered events |
| `/stream` | GET | SSE real-time ticker |

---

## 🏗 Architecture Highlights

```
User watches match on Fire TV
           │
           ▼
  React Native (react-native-tvos)
  ┌─────────────────────────────────────────┐
  │  MatchScreen                            │
  │  ├── VideoPlayer (react-native-video)   │
  │  │    └── LiveOverlay (score ticker)    │
  │  └── CompanionPanel (side-by-side)      │
  │       ├── CatchUpTab  ──┐               │
  │       ├── ExplainTab    │ aiClient.ts   │
  │       ├── MomentsTab  ──┼──► fetch()    │
  │       └── AskTab        │               │
  └─────────────────────────┼───────────────┘
                             │ HTTP/SSE
                             ▼
           CourtSide AI Service (Node.js)
           ├── Express REST API
           ├── Gemini 1.5 Flash (primary)
           ├── Curated fallback engine
           ├── TTL response cache
           └── SSE streaming endpoint
```

---

## 📊 Judging Criteria Mapping

| Criterion | CourtSide Implementation |
|-----------|--------------------------|
| **Amazon Devices SDK** | react-native-tvos + react-tv-space-navigation (D-pad focus engine) + Vega/KeplerScript manifest |
| **AI/ML Innovation** | Real Gemini 1.5 Flash integration + deterministic spoiler-safe fallback engine |
| **Multi-Platform** | Monorepo ships expo-multi-tv (Fire TV/Apple TV/Android TV) + vega (Fire TV OS KeplerScript) |
| **UX/Accessibility** | `accessibilityRole`, `accessibilityLabel` on every interactive element; 10-foot TV-safe font scaling; high contrast |
| **Code Quality** | 15/15 unit tests passing; TypeScript strict mode; ESLint; Prettier; Husky commit hooks |
| **Real-World Value** | Solves late-join frustration + kid-friendly sports viewing — two massive market segments |

---

## 🧪 Running Tests

```bash
# All service tests (15 tests)
yarn test:service

# Remote control unit tests
yarn workspace @multi-tv/expo-multi-tv test --watchAll=false

# TypeScript check
yarn workspace @multi-tv/shared-ui typecheck
```

Expected output: **15/15 service tests pass, 3/3 app tests pass**
