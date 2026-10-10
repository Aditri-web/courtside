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
  tSec: number; // timeline seconds in demo video (0 .. durationSec)
  clock: string; // display match clock (e.g. "14'", "45+2'", "78'")
  type: EventType;
  team: string;
  player?: string;
  description: string;
  score: { home: number; away: number };
  importance: number; // 0.0 to 1.0 ranking
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
};

export type RecapRequest = {
  matchId: string;
  nowSec: number;
  spoilers?: boolean;
  level?: ExplanationLevel;
};

export type RecapResponse = {
  headline: string;
  bullets: string[];
  currentScore?: { home: number; away: number };
  isSpoilerFree: boolean;
  nowSec: number;
  generatedAt: string;
  cached?: boolean;
};

export type ExplainRequest = {
  matchId: string;
  eventId?: string;
  tSec?: number;
  level?: ExplanationLevel;
};

export type ExplainResponse = {
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

export type MomentsResponse = {
  matchId: string;
  moments: MomentItem[];
};

export type AskRequest = {
  matchId: string;
  question: string;
  nowSec?: number;
  level?: ExplanationLevel;
};

export type AskResponse = {
  question: string;
  answer: string;
  sources: string[];
  relatedMomentId?: string;
  suggestedFollowUps?: string[];
  grounded: boolean;
};

export type LiveEventResponse = {
  matchId: string;
  events: MatchEvent[];
  latestEvent?: MatchEvent;
  nowSec: number;
};
