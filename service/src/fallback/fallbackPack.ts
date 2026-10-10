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

  if (q.includes('who scored') || q.includes('first goal') || q.includes('who opened') || q.includes('goals')) {
    const goalsSoFar = [
      { text: 'Bukayo Saka (19\', tSec 34) for Arsenal', tSec: 34, id: 'ev-06' },
      { text: 'Erling Haaland (45+1\', tSec 74) for Manchester City', tSec: 74, id: 'ev-13' },
      { text: 'Phil Foden (71\', tSec 120) for Manchester City', tSec: 120, id: 'ev-21' },
      { text: 'Declan Rice (90+1\', tSec 156) for Arsenal', tSec: 156, id: 'ev-27' },
      { text: 'Leandro Trossard (90+7\', tSec 168) for Arsenal', tSec: 168, id: 'ev-29' }
    ].filter((g) => g.tSec <= nowSec);

    if (goalsSoFar.length === 0) {
      return {
        question,
        answer: 'No goals have been scored yet up to this point in the match.',
        sources: [],
        grounded: true
      };
    }

    if (q.includes('first goal') || q.includes('who opened')) {
      return {
        question,
        answer: 'Bukayo Saka opened the scoring for Arsenal in the 19th minute (tSec 34) with a curled strike into the bottom corner.',
        sources: ['ev-06'],
        relatedMomentId: 'ev-06',
        suggestedFollowUps: nowSec >= 74 ? ['Who equalized for Manchester City?', 'Did VAR review any goals?'] : ['Who had the early chances?'],
        grounded: true
      };
    }

    return {
      question,
      answer: `Goals scored up to this point: ${goalsSoFar.map((g) => g.text).join('; ')}.`,
      sources: goalsSoFar.map((g) => g.id),
      relatedMomentId: goalsSoFar[goalsSoFar.length - 1].id,
      suggestedFollowUps: ['Who scored first?', 'Who received cards?'],
      grounded: true
    };
  }

  if (q.includes('haaland') || q.includes('equaliz') || q.includes('city score')) {
    if (nowSec < 74) {
      const earlyChances = [
        { id: 'ev-04', tSec: 21 },
        { id: 'ev-05', tSec: 27 }
      ].filter((e) => e.tSec <= nowSec).map((e) => e.id);

      return {
        question,
        answer: 'Manchester City has had close chances from Haaland and De Bruyne, but has not scored yet up to this point in the match.',
        sources: earlyChances,
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
    if (nowSec < 90) {
      return {
        question,
        answer: 'There have been no VAR reviews or penalty decisions yet up to this point in the match.',
        sources: [],
        grounded: true
      };
    }

    const varSources = ['ev-16'];
    if (nowSec >= 96) varSources.push('ev-17');

    return {
      question,
      answer: 'At minute 52 (tSec 90), VAR reviewed a potential penalty on Kai Havertz, but referee Michael Oliver confirmed no penalty due to a clean challenge by Ruben Dias.',
      sources: varSources,
      relatedMomentId: 'ev-16',
      suggestedFollowUps: ['Who received yellow cards?', 'What substitutions happened?'],
      grounded: true
    };
  }

  if (q.includes('yellow') || q.includes('card')) {
    const cardEvents = [
      { player: 'Bernardo Silva (22\', dissent)', tSec: 40, id: 'ev-07' },
      { player: 'Thomas Partey (41\', foul)', tSec: 68, id: 'ev-12' },
      { player: 'Ruben Dias (75\', shirt pull)', tSec: 126, id: 'ev-22' },
      { player: 'Leandro Trossard (90+8\')', tSec: 174, id: 'ev-30' }
    ].filter((c) => c.tSec <= nowSec);

    if (cardEvents.length === 0) {
      return {
        question,
        answer: 'No yellow cards have been issued yet up to this point in the match.',
        sources: [],
        grounded: true
      };
    }

    return {
      question,
      answer: `Yellow cards shown so far: ${cardEvents.map((c) => c.player).join(', ')}.`,
      sources: cardEvents.map((c) => c.id),
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
