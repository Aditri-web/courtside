import { RecapResult, ExplainResult, MomentsResult, AskResult, ExplanationLevel } from './types';
import { SHARED_MATCH_EVENTS, CURRENT_FEATURED_MATCH } from './staticData';

const CLIENT_TIMEOUT_MS = 4000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = CLIENT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export class AiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async fetchRecap(nowSec: number, spoilers = false, level: ExplanationLevel = 'casual'): Promise<RecapResult> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/recap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: CURRENT_FEATURED_MATCH.id,
          nowSec,
          spoilers,
          level
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('[CourtSide aiClient] AI service offline/timeout, using local fallback recap:', (e as Error).message);
    }

    // Local fallback pack
    return this.getLocalFallbackRecap(nowSec, spoilers, level);
  }

  async fetchExplain(eventId?: string, tSec?: number, level: ExplanationLevel = 'casual'): Promise<ExplainResult> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: CURRENT_FEATURED_MATCH.id,
          eventId,
          tSec,
          level
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('[CourtSide aiClient] AI service offline/timeout, using local fallback explain:', (e as Error).message);
    }

    return this.getLocalFallbackExplain(eventId, tSec, level);
  }

  async fetchMoments(): Promise<MomentsResult> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/moments?matchId=${CURRENT_FEATURED_MATCH.id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('[CourtSide aiClient] AI service offline/timeout, using local fallback moments:', (e as Error).message);
    }

    const keyEvents = SHARED_MATCH_EVENTS.filter((e) => e.importance >= 0.75).sort((a, b) => b.importance - a.importance);
    return {
      matchId: CURRENT_FEATURED_MATCH.id,
      moments: keyEvents.map((e) => ({
        eventId: e.id,
        title: `${e.clock} · ${e.type.toUpperCase()}: ${e.player || e.team}`,
        why: e.description,
        tSec: e.tSec,
        clock: e.clock,
        type: e.type,
        score: e.score,
        importance: e.importance
      }))
    };
  }

  async askQuestion(question: string, nowSec: number = 180, level: ExplanationLevel = 'casual'): Promise<AskResult> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: CURRENT_FEATURED_MATCH.id,
          question,
          nowSec,
          level
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('[CourtSide aiClient] AI service offline/timeout, using local grounded ask fallback:', (e as Error).message);
    }

    return this.getLocalFallbackAsk(question, nowSec);
  }

  private getLocalFallbackRecap(nowSec: number, spoilers: boolean, level: ExplanationLevel): RecapResult {
    if (!spoilers && nowSec <= 45) {
      return {
        headline: 'Early Spark: Saka Breaks the Deadlock for Arsenal',
        bullets: [
          'Arsenal initiated aggressive high-pressing from the opening whistle.',
          'Bukayo Saka converted in the 19th minute with a measured curling finish (1-0).',
          'Manchester City responded with long-range efforts through De Bruyne and Haaland.'
        ],
        currentScore: { home: 1, away: 0 },
        isSpoilerFree: true,
        nowSec,
        generatedAt: new Date().toISOString()
      };
    }

    if (!spoilers && nowSec <= 85) {
      return {
        headline: 'Level at the Break: Haaland Answers Saka Opener',
        bullets: [
          'Bukayo Saka gave Arsenal the lead before Haaland equalized right on the stroke of halftime.',
          'Controversial VAR penalty review overturned for Arsenal on Kai Havertz.',
          'Both sides operating at intense physical and tactical tempos.'
        ],
        currentScore: { home: 1, away: 1 },
        isSpoilerFree: true,
        nowSec,
        generatedAt: new Date().toISOString()
      };
    }

    if (!spoilers && nowSec <= 150) {
      return {
        headline: 'Second Half Surge: Foden Puts City Ahead',
        bullets: [
          'Phil Foden curled a stunning strike into the top corner in minute 71.',
          'Arsenal introduced Leandro Trossard to re-energize the attacking flank.',
          'David Raya produced a diving reflex save to keep Arsenal in contention.'
        ],
        currentScore: { home: 1, away: 2 },
        isSpoilerFree: true,
        nowSec,
        generatedAt: new Date().toISOString()
      };
    }

    // Full match
    return {
      headline: 'Emirates Classic: Trossard 97th-Minute Winner Crowns 3-2 Thriller',
      bullets: [
        'Bukayo Saka and Erling Haaland scored in an electrifying opening half.',
        'Phil Foden gave Manchester City the lead before Declan Rice equalized in stoppage time.',
        'Leandro Trossard converted in the 97th minute to secure a breathtaking victory.'
      ],
      currentScore: { home: 3, away: 2 },
      isSpoilerFree: false,
      nowSec,
      generatedAt: new Date().toISOString()
    };
  }

  private getLocalFallbackExplain(eventId?: string, tSec?: number, level: ExplanationLevel = 'casual'): ExplainResult {
    const event =
      (eventId ? SHARED_MATCH_EVENTS.find((e) => e.id === eventId) : undefined) ||
      (tSec !== undefined
        ? [...SHARED_MATCH_EVENTS].reverse().find((e) => e.tSec <= tSec)
        : SHARED_MATCH_EVENTS[5]) ||
      SHARED_MATCH_EVENTS[5];

    if (level === 'kid') {
      return {
        eventId: event.id,
        level: 'kid',
        explanation: `Whoosh! ${event.player || 'The player'} did an awesome move! He tricked the defender by pretending to run right, then tapped the ball to his favorite foot and scored like a superstar!`,
        ruleSnippet: 'A goal counts when the whole ball crosses the white line between the goalposts!',
        tacticalNote: 'Practice both feet, but use your best foot when you get close to the goal!',
        keyPlayer: event.player
      };
    }

    if (level === 'expert') {
      return {
        eventId: event.id,
        level: 'expert',
        explanation: `Elite positional play: ${event.player || 'The player'} exploited the half-space vacated by City's inverted full-back. Notice the hip orientation creating separation before generating curl around Ederson's dive.`,
        ruleSnippet: event.ruleSnippet || 'IFAB Law 10: Determination of the Outcome of a Match.',
        tacticalNote: 'City failed to close down the central passing lane, resulting in a -0.38 xG defensive deficit.',
        keyPlayer: event.player
      };
    }

    return {
      eventId: event.id,
      level: 'casual',
      explanation: `${event.player || 'The player'} found space on the edge of the penalty box and hit a clean strike into the corner. A classic example of decisive finishing under pressure!`,
      ruleSnippet: event.ruleSnippet,
      tacticalNote: 'Arsenal capitalized on quick transition while City defenders were recovering position.',
      keyPlayer: event.player
    };
  }

  private getLocalFallbackAsk(question: string, nowSec: number): AskResult {
    const q = question.toLowerCase();

    if (q.includes('who scored') || q.includes('first goal') || q.includes('who opened')) {
      return {
        question,
        answer: 'Bukayo Saka opened the scoring for Arsenal in the 19th minute (tSec 34) with a curled strike into the bottom corner.',
        sources: ['ev-06'],
        relatedMomentId: 'ev-06',
        suggestedFollowUps: ['Who equalized for Manchester City?', 'Did VAR review any goals?'],
        grounded: true
      };
    }

    if (q.includes('haaland') || q.includes('equaliz') || q.includes('city score')) {
      if (nowSec < 74) {
        return {
          question,
          answer: 'Manchester City has had close chances from Haaland and De Bruyne, but has not scored yet up to this point in the match.',
          sources: ['ev-04', 'ev-05'],
          grounded: true
        };
      }
      return {
        question,
        answer: 'Erling Haaland scored for Manchester City in stoppage time of the first half (45+1\', tSec 74) with a first-time volley.',
        sources: ['ev-13'],
        relatedMomentId: 'ev-13',
        suggestedFollowUps: ['Who scored first?', 'What was the VAR decision?'],
        grounded: true
      };
    }

    if (q.includes('var') || q.includes('penalty')) {
      return {
        question,
        answer: 'At minute 52 (tSec 90), VAR reviewed a potential penalty on Kai Havertz, but referee Michael Oliver confirmed no penalty due to a clean challenge by Ruben Dias.',
        sources: ['ev-16', 'ev-17'],
        relatedMomentId: 'ev-16',
        suggestedFollowUps: ['Who received yellow cards?'],
        grounded: true
      };
    }

    if (q.includes('yellow') || q.includes('card')) {
      return {
        question,
        answer: 'Yellow cards were shown to Bernardo Silva (22\', dissent), Thomas Partey (41\', foul), Ruben Dias (75\', shirt pull), and Leandro Trossard (90+8\').',
        sources: ['ev-07', 'ev-12', 'ev-22', 'ev-30'],
        grounded: true
      };
    }

    return {
      question,
      answer: "I don't have that information from the match data.",
      sources: [],
      grounded: false
    };
  }
}

export const aiClient = new AiClient();
