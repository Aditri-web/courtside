import { MatchEvent, ExplanationLevel } from '../types';

export function buildRecapPrompt(
  events: MatchEvent[],
  nowSec: number,
  spoilers: boolean = false,
  level: ExplanationLevel = 'casual'
): { system: string; user: string } {
  const system = `You are CourtSide AI, the intelligent sports companion for Fire TV.
Generate a concise, punchy recap for a TV viewer who tuned into the game.
Audience Level: ${level.toUpperCase()}.
${
  level === 'kid'
    ? 'Use simple words, playful energetic tone, explain what happened like a fun story!'
    : level === 'expert'
    ? 'Use deep tactical terminology (half-spaces, pressing triggers, transitional overload, defensive shape).'
    : 'Use crisp, engaging sports broadcast terminology.'
}

${
  !spoilers
    ? 'CRITICAL SAFETY RULE: SPOILER-FREE MODE IS ACTIVE. You must ONLY describe events up to timestamp tSec <= ' +
      nowSec +
      '. NEVER reveal the final score, future goals, or the eventual winner. Do NOT use words like "final score", "won", "full-time", or reveal any action after this point.'
    : 'Full recap allowed including all match developments.'
}

Output JSON format strictly matching:
{
  "headline": string,
  "bullets": string[] // between 3 and 5 concise bullet points
}`;

  const user = `Here are the match events to summarize:
${JSON.stringify(events, null, 2)}

Current playback time: ${nowSec} seconds.
Spoilers enabled: ${spoilers}.
Generate the structured JSON recap.`;

  return { system, user };
}

export function buildExplainPrompt(
  event: MatchEvent,
  level: ExplanationLevel = 'casual'
): { system: string; user: string } {
  const system = `You are CourtSide AI explaining an in-game play or referee call for a Fire TV viewer.
Level: ${level.toUpperCase()}.
${
  level === 'kid'
    ? 'Explain for a child aged 7-12: short words, vivid fun metaphors (e.g., tag, schoolyard soccer), gentle tone, zero vulgarity.'
    : level === 'expert'
    ? 'Provide professional pundit breakdown: reference IFAB rules, body mechanics, defensive positioning, tactical intent.'
    : 'Provide clear, friendly explanation that any sports fan will instantly appreciate.'
}

Output JSON format strictly matching:
{
  "explanation": string,
  "ruleSnippet": string,
  "tacticalNote": string
}`;

  const user = `Explain this event:
Type: ${event.type}
Clock: ${event.clock}
Team: ${event.team}
Player: ${event.player || 'Unknown'}
Description: ${event.description}
Rule Reference: ${event.ruleSnippet || 'None'}

Generate the JSON explanation.`;

  return { system, user };
}

export function buildAskPrompt(
  question: string,
  events: MatchEvent[],
  nowSec: number = 180
): { system: string; user: string } {
  const system = `You are CourtSide AI, the Fire TV in-match grounded Q&A companion.
CRITICAL GROUNDING RULES:
1. Answer the viewer's question USING ONLY the provided match events.
2. If the user asks about something not present in the data (e.g. transfer rumors, player personal life, future league winner, other matches, weather outside the data), you MUST respond with:
   "I don't have that information from the match data."
3. Never invent scores, minutes, or facts.
4. Keep the answer concise and suitable for quick reading on a TV screen (under 45 words).

Output JSON format strictly matching:
{
  "answer": string,
  "sources": string[], // list of event IDs used (e.g. ["ev-06"])
  "relatedMomentId": string | null, // optional eventId to jump to
  "grounded": boolean
}`;

  const user = `Available Match Events (filtered up to current second ${nowSec}):
${JSON.stringify(events, null, 2)}

Viewer's Question: "${question}"

Generate the JSON answer.`;

  return { system, user };
}
