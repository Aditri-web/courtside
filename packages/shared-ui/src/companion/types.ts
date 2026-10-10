export type Sport = 'football' | 'cricket' | 'basketball';

export type Team = {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  color: string;
  record?: string;
};

export type MatchStatus = 'live' | 'upcoming' | 'finished';

export type EventType =
  | 'goal'
  | 'foul'
  | 'card'
  | 'chance'
  | 'substitution'
  | 'wicket'
  | 'boundary'
  | 'var_decision'
  | 'penalty';

export type MatchEvent = {
  id: string;
  tSec: number;
  clock: string;
  type: EventType;
  team: string;
  player?: string;
  description: string;
  score: { home: number; away: number };
  importance: number;
  ruleSnippet?: string;
};

export type Match = {
  id: string;
  title: string;
  sport: Sport;
  home: Team;
  away: Team;
  status: MatchStatus;
  videoUrl: string;
  durationSec: number;
  league: string;
  venue: string;
  events: MatchEvent[];
};

export type ExplanationLevel = 'kid' | 'casual' | 'expert';

export type Profile = {
  mode: 'standard' | 'family';
  spoilers: boolean;
  level: ExplanationLevel;
  fontSizeScale: number;
};

export type RecapResult = {
  headline: string;
  bullets: string[];
  currentScore?: { home: number; away: number };
  isSpoilerFree: boolean;
  nowSec: number;
  generatedAt: string;
  cached?: boolean;
};

export type ExplainResult = {
  eventId: string;
  level: ExplanationLevel;
  explanation: string;
  ruleSnippet?: string;
  tacticalNote?: string;
  keyPlayer?: string;
};

export type MomentItem = {
  eventId: string;
  title: string;
  why: string;
  tSec: number;
  clock: string;
  type: EventType;
  score: { home: number; away: number };
  importance: number;
};

export type MomentsResult = {
  matchId: string;
  moments: MomentItem[];
};

export type AskResult = {
  question: string;
  answer: string;
  sources: string[];
  relatedMomentId?: string;
  suggestedFollowUps?: string[];
  grounded: boolean;
};
