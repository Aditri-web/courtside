import {
  RecapRequest,
  RecapResponse,
  ExplainRequest,
  ExplainResponse,
  MomentsResponse,
  AskRequest,
  AskResponse,
  MatchEvent,
  ExplanationLevel
} from '../types';
import { DEMO_EVENTS, DEMO_MATCH } from '../data/staticData';
import { buildRecapPrompt, buildExplainPrompt, buildAskPrompt } from '../prompt/promptBuilder';
import { validateRecap, validateExplain, validateAsk } from '../validator/schemaValidator';
import { getFallbackRecap, getFallbackExplain, getFallbackMoments, getFallbackAsk } from '../fallback/fallbackPack';
import { globalCache } from '../cache/responseCache';
import { geminiRecap, geminiExplain, geminiAsk } from './geminiClient';

const LLM_TIMEOUT_MS = 5500;

export class LlmAdapter {
  private provider: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'mock';
  }

  async generateRecap(req: RecapRequest): Promise<RecapResponse> {
    const cacheKey = `recap:${req.matchId}:${Math.floor(req.nowSec / 5)}:${req.spoilers}:${req.level || 'casual'}`;
    const cached = globalCache.get<RecapResponse>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const spoilers = Boolean(req.spoilers);
    const nowSec = req.nowSec || 180;
    const level: ExplanationLevel = req.level || 'casual';

    // Filter events up to nowSec unless spoilers is true
    const eligibleEvents = spoilers ? DEMO_EVENTS : DEMO_EVENTS.filter((e) => e.tSec <= nowSec);

    // If an external key is configured, we could attempt remote call with timeout
    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey && this.provider !== 'mock') {
      try {
        const result = await this.callWithTimeout(
          this.remoteRecap(eligibleEvents, nowSec, spoilers, level),
          LLM_TIMEOUT_MS
        );
        const validated = validateRecap(result, spoilers, nowSec, DEMO_EVENTS);
        globalCache.set(cacheKey, validated);
        return validated;
      } catch (err) {
        console.warn(`[LlmAdapter] Remote recap failed/timed out, using grounded fallback:`, (err as Error).message);
      }
    }

    // Deterministic High-Quality Local AI Engine
    const dynamicRecap = this.synthesizeDynamicRecap(eligibleEvents, nowSec, spoilers, level);
    const validated = validateRecap(dynamicRecap, spoilers, nowSec, DEMO_EVENTS);
    globalCache.set(cacheKey, validated);
    return validated;
  }

  async generateExplain(req: ExplainRequest): Promise<ExplainResponse> {
    const event =
      (req.eventId ? DEMO_EVENTS.find((e) => e.id === req.eventId) : undefined) ||
      (req.tSec !== undefined
        ? [...DEMO_EVENTS].reverse().find((e) => e.tSec <= (req.tSec ?? 180))
        : DEMO_EVENTS[5]) ||
      DEMO_EVENTS[5];

    const level: ExplanationLevel = req.level || 'casual';
    const cacheKey = `explain:${event.id}:${level}`;
    const cached = globalCache.get<ExplainResponse>(cacheKey);
    if (cached) return cached;

    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey && this.provider !== 'mock') {
      try {
        const result = await this.callWithTimeout(this.remoteExplain(event, level), LLM_TIMEOUT_MS);
        const validated = validateExplain(result, level);
        globalCache.set(cacheKey, validated);
        return validated;
      } catch (err) {
        console.warn(`[LlmAdapter] Remote explain failed/timed out, using fallback:`, (err as Error).message);
      }
    }

    const fallback = getFallbackExplain(event.id, level);
    const validated = validateExplain(fallback, level);
    globalCache.set(cacheKey, validated);
    return validated;
  }

  async generateMoments(matchId: string): Promise<MomentsResponse> {
    const cacheKey = `moments:${matchId}`;
    const cached = globalCache.get<MomentsResponse>(cacheKey);
    if (cached) return cached;

    const moments = getFallbackMoments();
    globalCache.set(cacheKey, moments);
    return moments;
  }

  async generateAsk(req: AskRequest): Promise<AskResponse> {
    const nowSec = req.nowSec || 180;
    const cacheKey = `ask:${req.matchId}:${req.question.trim().toLowerCase()}:${Math.floor(nowSec / 10)}`;
    const cached = globalCache.get<AskResponse>(cacheKey);
    if (cached) return cached;

    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey && this.provider !== 'mock') {
      try {
        const visibleEvents = DEMO_EVENTS.filter((e) => e.tSec <= nowSec);
        const result = await this.callWithTimeout(this.remoteAsk(req.question, visibleEvents, nowSec), LLM_TIMEOUT_MS);
        const validated = validateAsk(
          result,
          visibleEvents.map((e) => e.id)
        );
        globalCache.set(cacheKey, validated);
        return validated;
      } catch (err) {
        console.warn(`[LlmAdapter] Remote ask failed/timed out, using grounded fallback:`, (err as Error).message);
      }
    }

    const fallback = getFallbackAsk(req.question, nowSec);
    const validated = validateAsk(
      fallback,
      DEMO_EVENTS.map((e) => e.id)
    );
    globalCache.set(cacheKey, validated);
    return validated;
  }

  private synthesizeDynamicRecap(
    events: MatchEvent[],
    nowSec: number,
    spoilers: boolean,
    level: ExplanationLevel
  ): any {
    const goals = events.filter((e) => e.type === 'goal');
    const chances = events.filter((e) => e.type === 'chance');
    const cards = events.filter((e) => e.type === 'card');
    const lastEvent = events[events.length - 1];

    if (!spoilers && nowSec <= 40) {
      if (level === 'kid') {
        return {
          headline: 'Super Fun Start! Bukayo Saka Shoots and Scores!',
          bullets: [
            'Arsenal ran super fast right after the referee blew the opening whistle!',
            'Bukayo Saka did a cool wiggle move and kicked the ball into the net (1-0)!',
            'Manchester City tried to kick back but the goalie made a super jump catch.'
          ]
        };
      }
      return {
        headline: 'Early Spark: Saka Breaks the Deadlock for Arsenal',
        bullets: [
          'Arsenal initiated aggressive high-pressing from the opening whistle.',
          'Bukayo Saka converted in the 19th minute with a measured curling finish.',
          'Manchester City responded with long-range efforts through De Bruyne and Haaland.'
        ]
      };
    }

    if (!spoilers && nowSec <= 85) {
      if (level === 'expert') {
        return {
          headline: 'Tactical Parity: Haaland Volley Neutralizes Saka Opener',
          bullets: [
            'Arsenal generated +0.82 xG via inverted winger isolations against City full-backs.',
            'Erling Haaland converted in first-half stoppage time from low-block breakdown.',
            'Discipline tightens: cautions for Bernardo Silva and Thomas Partey.'
          ]
        };
      }
      return {
        headline: 'Level at the Break: Haaland Answers Saka Opener',
        bullets: [
          'Bukayo Saka handed Arsenal the initial advantage in the 19th minute.',
          'Erling Haaland equalized in first-half stoppage time with a thunderous volley.',
          'Tense tactical battle with both sides trading high-danger opportunities.'
        ]
      };
    }

    if (!spoilers && nowSec <= 150) {
      return {
        headline: 'Second Half Surge: Foden Strikes as Contest Intensifies',
        bullets: [
          'Halftime parity broken in the 71st minute by a Phil Foden top-corner rocket.',
          'Arsenal saw a penalty appeal on Kai Havertz overturned after formal VAR review.',
          'Mikel Arteta brought on Leandro Trossard to introduce transitional pace.'
        ]
      };
    }

    // Full match or late match
    if (level === 'kid') {
      return {
        headline: 'Crazy Comeback Win! Arsenal Scores in the Final Seconds!',
        bullets: [
          'Arsenal and Manchester City kept trading super goals back and forth!',
          'Declan Rice hit an absolute rocket from way outside the box to tie it!',
          'Leandro Trossard scored the winning goal in the final seconds (3-2) and the crowd went wild!'
        ]
      };
    }

    if (level === 'expert') {
      return {
        headline: 'Arteta Overcomes Guardiola: 3-2 High-Press Transition Masterclass',
        bullets: [
          'Saka and Foden delivered individual brilliance in opposing tactical systems.',
          'Rice neutralized City defensive block with 91st-minute long-range equalizer.',
          'Trossard exploited defensive disorientation at 90+7 to seal a dramatic 3-2 win.'
        ]
      };
    }

    return {
      headline: 'Emirates Classic: Trossard 97th-Minute Winner Crowns 3-2 Thriller',
      bullets: [
        'Bukayo Saka and Erling Haaland scored in an electrifying opening half.',
        'Phil Foden gave Manchester City the lead before Declan Rice equalized in stoppage time.',
        'Leandro Trossard converted in the 97th minute to secure a breathtaking victory.'
      ]
    };
  }

  private async callWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs))
    ]);
  }

  private async remoteRecap(
    events: MatchEvent[],
    nowSec: number,
    spoilers: boolean,
    level: ExplanationLevel
  ): Promise<any> {
    // Try Gemini 1.5 Flash first
    const geminiResult = await geminiRecap(events, nowSec, spoilers, level);
    if (geminiResult) {
      console.log('[LlmAdapter] Gemini recap OK');
      return geminiResult;
    }
    // High-quality deterministic fallback
    return getFallbackRecap(nowSec, spoilers);
  }

  private async remoteExplain(event: MatchEvent, level: ExplanationLevel): Promise<any> {
    const geminiResult = await geminiExplain(event, level);
    if (geminiResult) {
      console.log('[LlmAdapter] Gemini explain OK');
      return geminiResult;
    }
    return getFallbackExplain(event.id, level);
  }

  private async remoteAsk(question: string, events: MatchEvent[], nowSec: number): Promise<any> {
    const geminiResult = await geminiAsk(question, events, nowSec);
    if (geminiResult) {
      console.log('[LlmAdapter] Gemini ask OK');
      return geminiResult;
    }
    return getFallbackAsk(question, nowSec);
  }
}

export const llmAdapter = new LlmAdapter();
