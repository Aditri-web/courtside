import { RecapResponse, ExplainResponse, AskResponse, MatchEvent, ExplanationLevel } from '../types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(`[SchemaValidator Error] ${message}`);
    this.name = 'ValidationError';
  }
}

const FORBIDDEN_SPOILER_TERMS = [
  'final score',
  'full time',
  'full-time',
  'ended 3-2',
  'won 3-2',
  'beat man city',
  'victorious at the death',
  'final whistle'
];

export function validateRecap(
  data: any,
  spoilers: boolean,
  nowSec: number,
  allEvents: MatchEvent[]
): RecapResponse {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Recap response must be an object');
  }

  if (typeof data.headline !== 'string' || data.headline.trim().length === 0) {
    throw new ValidationError('Recap headline must be a non-empty string');
  }

  if (!Array.isArray(data.bullets) || data.bullets.length < 2 || data.bullets.length > 6) {
    throw new ValidationError('Recap bullets must be an array of 2 to 6 items');
  }

  for (const b of data.bullets) {
    if (typeof b !== 'string' || b.trim().length === 0) {
      throw new ValidationError('Each bullet must be a non-empty string');
    }
  }

  // Check for spoiler leakage when spoilers is false
  if (!spoilers) {
    const combinedText = `${data.headline} ${data.bullets.join(' ')}`.toLowerCase();
    for (const term of FORBIDDEN_SPOILER_TERMS) {
      if (combinedText.includes(term.toLowerCase())) {
        throw new ValidationError(`Spoiler leak detected in spoiler-free mode: term "${term}" found`);
      }
    }

    // Also check if any event after nowSec was mentioned
    const futureEvents = allEvents.filter((ev) => ev.tSec > nowSec);
    for (const fev of futureEvents) {
      if (fev.player && fev.type === 'goal' && combinedText.includes(fev.player.toLowerCase())) {
        // Player who only scored in the future should not be credited with that goal
        if (fev.description && combinedText.includes('scored')) {
          const pastScored = allEvents.some(
            (p) => p.tSec <= nowSec && p.player?.toLowerCase() === fev.player?.toLowerCase() && p.type === 'goal'
          );
          if (!pastScored) {
            throw new ValidationError(
              `Future goal spoiler leak detected: ${fev.player} goal at tSec ${fev.tSec} > nowSec ${nowSec}`
            );
          }
        }
      }
    }
  }

  return {
    headline: data.headline.trim(),
    bullets: data.bullets.map((b: string) => b.trim()),
    isSpoilerFree: !spoilers,
    nowSec,
    generatedAt: new Date().toISOString()
  };
}

export function validateExplain(data: any, level: ExplanationLevel): ExplainResponse {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Explain response must be an object');
  }

  if (typeof data.explanation !== 'string' || data.explanation.trim().length === 0) {
    throw new ValidationError('Explanation must be a non-empty string');
  }

  return {
    eventId: data.eventId || 'unknown',
    level,
    explanation: data.explanation.trim(),
    ruleSnippet: typeof data.ruleSnippet === 'string' ? data.ruleSnippet.trim() : undefined,
    tacticalNote: typeof data.tacticalNote === 'string' ? data.tacticalNote.trim() : undefined,
    keyPlayer: typeof data.keyPlayer === 'string' ? data.keyPlayer.trim() : undefined
  };
}

export function validateAsk(data: any, validEventIds: string[]): AskResponse {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Ask response must be an object');
  }

  if (typeof data.answer !== 'string' || data.answer.trim().length === 0) {
    throw new ValidationError('Ask answer must be a non-empty string');
  }

  const sources = Array.isArray(data.sources)
    ? data.sources.filter((s: any) => typeof s === 'string' && validEventIds.includes(s))
    : [];

  let grounded = Boolean(data.grounded);
  let answer = data.answer.trim();

  // If question was not answerable, ensure standard message
  if (
    !grounded ||
    answer.toLowerCase().includes("don't have that") ||
    answer.toLowerCase().includes('not available') ||
    answer.toLowerCase().includes('match data does not')
  ) {
    answer = "I don't have that information from the match data.";
    grounded = false;
  }

  return {
    question: data.question || '',
    answer,
    sources,
    relatedMomentId: typeof data.relatedMomentId === 'string' ? data.relatedMomentId : undefined,
    suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : undefined,
    grounded
  };
}
