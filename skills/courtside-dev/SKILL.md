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
