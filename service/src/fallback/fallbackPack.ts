import { RecapResponse, ExplainResponse, MomentsResponse, AskResponse, ExplanationLevel } from '../types';
import { DEMO_EVENTS, DEMO_MATCH } from '../data/staticData';

export const FALLBACK_RECAPS: Record<string, RecapResponse> = {
  // Early game spoiler-free recap
  early_spoiler_free: {
    headline: 'High-Octane Start: Saka Strikes First for Arsenal',
    bullets: [
      'Arsenal launched an aggressive high press from the opening minute at Emirates Stadium.',
      'Bukayo Saka cut inside onto his left foot and slotted the opening goal at 19 minutes (tSec 34).',
      'Manchester City countered with dangerous efforts from De Bruyne and an aerial duel from Haaland.',
      'Intense tactical battle in midfield with Bernardo Silva cautioned for dissent.'
    ],
    currentScore: { home: 1, away: 0 },
    isSpoilerFree: true,
    nowSec: 45,
    generatedAt: new Date().toISOString()
  },
  // Mid game spoiler-free recap
  mid_spoiler_free: {
    headline: 'Stalemate at the Interval: Haaland Responds to Saka Opener',
    bullets: [
      'Arsenal took the lead through Bukayo Saka after persistent early pressure.',
      'Erling Haaland equalized right on the stroke of halftime with a venomous volley.',
      'Controversial VAR check at 54 minutes denied Arsenal a penalty on Kai Havertz.',
      'Both managers making key tactical tweaks with Leandro Trossard introduced.'
    ],
    currentScore: { home: 1, away: 1 },
    isSpoilerFree: true,
    nowSec: 105,
    generatedAt: new Date().toISOString()
  },
  // Full recap (with spoilers)
  full_match: {
    headline: 'Emirates Epic: Trossard 97th-Minute Miracle Crowns Arsenal 3-2 Winner',
    bullets: [
      'Bukayo Saka and Erling Haaland traded first-half blows in a breathless clash.',
      'Phil Foden gave Manchester City the lead in the 71st minute with a top-corner rocket.',
      'Declan Rice leveled in the 91st minute with an electrifying 25-yard drive.',
      'Leandro Trossard converted in the 97th minute to secure all three points for Arsenal.'
    ],
    currentScore: { home: 3, away: 2 },
    isSpoilerFree: false,
    nowSec: 180,
    generatedAt: new Date().toISOString()
  }
};

export function getFallbackRecap(nowSec: number, spoilers: boolean): RecapResponse {
  if (spoilers || nowSec >= 170) {
    return { ...FALLBACK_RECAPS.full_match, nowSec };
  }
  if (nowSec > 60) {
    return { ...FALLBACK_RECAPS.mid_spoiler_free, nowSec };
  }
  return { ...FALLBACK_RECAPS.early_spoiler_free, nowSec };
}

export function getFallbackExplain(eventId: string, level: ExplanationLevel): ExplainResponse {
  const event = DEMO_EVENTS.find((e) => e.id === eventId) || DEMO_EVENTS[5]; // Saka goal fallback

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
      explanation: `Elite positional play: ${event.player || 'The player'} exploited the half-space vacated by City's inverted full-back. Notice the hip orientation creating separation before generating 2.4 rad/s curl around Ederson's outstretched dive.`,
      ruleSnippet: event.ruleSnippet || 'IFAB Law 10: Determination of the Outcome of a Match.',
      tacticalNote: 'City failed to close down the central passing lane, resulting in a -0.38 xG defensive deficit.',
      keyPlayer: event.player
    };
  }

  // Casual
  return {
    eventId: event.id,
    level: 'casual',
    explanation: `${event.player || 'The player'} found space on the edge of the penalty box and hit a clean strike into the corner. A classic example of decisive finishing under pressure!`,
    ruleSnippet: event.ruleSnippet,
    tacticalNote: 'Arsenal capitalized on quick transition while City defenders were recovering position.',
    keyPlayer: event.player
  };
}

export function getFallbackMoments(): MomentsResponse {
  const keyEvents = DEMO_EVENTS.filter((e) => e.importance >= 0.75).sort((a, b) => b.importance - a.importance);
  return {
    matchId: DEMO_MATCH.id,
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

export function getFallbackAsk(question: string, nowSec: number): AskResponse {
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

  if (q.includes('var') || q.includes('penalty') || q.includes('foul')) {
    return {
      question,
      answer: 'At minute 52 (tSec 90), VAR reviewed a potential penalty on Kai Havertz, but referee Michael Oliver confirmed no penalty due to a clean challenge by Ruben Dias.',
      sources: ['ev-16', 'ev-17'],
      relatedMomentId: 'ev-16',
      suggestedFollowUps: ['Who received yellow cards?', 'What substitutions happened?'],
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

  // Grounded constraint: unknown questions return standard denial!
  return {
    question,
    answer: "I don't have that information from the match data.",
    sources: [],
    grounded: false
  };
}
