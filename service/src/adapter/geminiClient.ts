/**
 * Gemini 1.5 Flash API client for CourtSide AI Service.
 * Uses the REST generateContent endpoint with JSON output mode.
 * Falls back gracefully if the key is missing or the call fails.
 */

import { ExplanationLevel, MatchEvent } from '../types';
import { buildRecapPrompt, buildExplainPrompt, buildAskPrompt } from '../prompt/promptBuilder';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const TIMEOUT_MS = 5000;

interface GeminiCandidate {
  content: { parts: Array<{ text: string }> };
}
interface GeminiResponse {
  candidates: GeminiCandidate[];
}

async function geminiGenerateContent(
  systemInstruction: string,
  userContent: string,
  apiKey: string
): Promise<string> {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
          maxOutputTokens: 512
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
    }

    const data: GeminiResponse = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return raw.trim();
  } finally {
    clearTimeout(timer);
  }
}

function safeParseJson<T>(text: string, fallback: T): T {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

export async function geminiRecap(
  events: MatchEvent[],
  nowSec: number,
  spoilers: boolean,
  level: ExplanationLevel
): Promise<{ headline: string; bullets: string[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { system, user } = buildRecapPrompt(events, nowSec, spoilers, level);
    const text = await geminiGenerateContent(system, user, apiKey);
    const parsed = safeParseJson<{ headline?: string; bullets?: string[] }>(text, {});
    if (!parsed.headline || !Array.isArray(parsed.bullets)) return null;
    return { headline: parsed.headline, bullets: parsed.bullets };
  } catch (err) {
    console.warn('[GeminiClient] recap failed:', (err as Error).message);
    return null;
  }
}

export async function geminiExplain(
  event: MatchEvent,
  level: ExplanationLevel
): Promise<{ explanation: string; ruleSnippet?: string; tacticalNote?: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { system, user } = buildExplainPrompt(event, level);
    const text = await geminiGenerateContent(system, user, apiKey);
    const parsed = safeParseJson<{
      explanation?: string;
      ruleSnippet?: string;
      tacticalNote?: string;
    }>(text, {});
    if (!parsed.explanation) return null;
    return {
      explanation: parsed.explanation,
      ruleSnippet: parsed.ruleSnippet,
      tacticalNote: parsed.tacticalNote
    };
  } catch (err) {
    console.warn('[GeminiClient] explain failed:', (err as Error).message);
    return null;
  }
}

export async function geminiAsk(
  question: string,
  events: MatchEvent[],
  nowSec: number
): Promise<{
  answer: string;
  sources: string[];
  relatedMomentId?: string;
  grounded: boolean;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { system, user } = buildAskPrompt(question, events, nowSec);
    const text = await geminiGenerateContent(system, user, apiKey);
    const parsed = safeParseJson<{
      answer?: string;
      sources?: string[];
      relatedMomentId?: string;
      grounded?: boolean;
    }>(text, {});
    if (!parsed.answer) return null;
    return {
      answer: parsed.answer,
      sources: parsed.sources ?? [],
      relatedMomentId: parsed.relatedMomentId,
      grounded: parsed.grounded ?? true
    };
  } catch (err) {
    console.warn('[GeminiClient] ask failed:', (err as Error).message);
    return null;
  }
}
