import { Match, MatchEvent } from './types';

export const SHARED_MATCH_EVENTS: MatchEvent[] = [
  {
    id: 'ev-01',
    tSec: 4,
    clock: "1'",
    type: 'chance',
    team: 'Arsenal',
    player: 'Bukayo Saka',
    description: 'Kick-off at Emirates Stadium. Saka presses high immediately forcing an early turnover.',
    score: { home: 0, away: 0 },
    importance: 0.35,
    ruleSnippet: 'High press: Defending team advances into opponent defensive third to disrupt build-up play.'
  },
  {
    id: 'ev-02',
    tSec: 9,
    clock: "4'",
    type: 'foul',
    team: 'Manchester City',
    player: 'Rodri',
    description: 'Rodri clips Martin Ødegaard at midfield to break up an Arsenal counter-attack.',
    score: { home: 0, away: 0 },
    importance: 0.45,
    ruleSnippet: 'Tactical foul: A deliberate foul to halt a promising attacking progression without intent for the ball.'
  },
  {
    id: 'ev-03',
    tSec: 15,
    clock: "8'",
    type: 'chance',
    team: 'Arsenal',
    player: 'Gabriel Martinelli',
    description: 'Martinelli sprints down the left wing and delivers a low cross, cleared by Ruben Dias.',
    score: { home: 0, away: 0 },
    importance: 0.6,
    ruleSnippet: 'Low cross: Driven ball across the 6-yard box targeting near-post runners.'
  },
  {
    id: 'ev-04',
    tSec: 21,
    clock: "12'",
    type: 'chance',
    team: 'Manchester City',
    player: 'Kevin De Bruyne',
    description: 'De Bruyne unleashes a stinging strike from 22 yards; David Raya tips it over the bar for a corner.',
    score: { home: 0, away: 0 },
    importance: 0.72,
    ruleSnippet: 'Corner kick: Awarded when the ball entirely crosses the goal line having last touched a defending player.'
  },
  {
    id: 'ev-05',
    tSec: 27,
    clock: "15'",
    type: 'chance',
    team: 'Manchester City',
    player: 'Erling Haaland',
    description: 'Haaland towers above Gabriel from the corner kick, heading narrowly wide of the left upright.',
    score: { home: 0, away: 0 },
    importance: 0.68,
    ruleSnippet: 'Aerial duel: Contest for possession of an airborne ball between opposing players.'
  },
  {
    id: 'ev-06',
    tSec: 34,
    clock: "19'",
    type: 'goal',
    team: 'Arsenal',
    player: 'Bukayo Saka',
    description: 'GOAL! Saka cuts onto his left foot inside the box and curls a wicked shot into the bottom corner!',
    score: { home: 1, away: 0 },
    importance: 0.95,
    ruleSnippet: 'Inside cut: An inverted winger moves laterally to create an optimal shooting angle on their dominant foot.'
  },
  {
    id: 'ev-07',
    tSec: 40,
    clock: "22'",
    type: 'card',
    team: 'Manchester City',
    player: 'Bernardo Silva',
    description: 'Yellow card for Bernardo Silva after dissent towards referee Michael Oliver.',
    score: { home: 1, away: 0 },
    importance: 0.5,
    ruleSnippet: 'Dissent by word or action: Cautionable offence under IFAB Law 12 for challenging match officials.'
  },
  {
    id: 'ev-08',
    tSec: 45,
    clock: "26'",
    type: 'foul',
    team: 'Arsenal',
    player: 'William Saliba',
    description: 'Saliba commits a sliding tackle on Phil Foden just outside the penalty arc.',
    score: { home: 1, away: 0 },
    importance: 0.58,
    ruleSnippet: 'Direct free kick: Awarded for careless or reckless contact outside the penalty area.'
  },
  {
    id: 'ev-09',
    tSec: 50,
    clock: "29'",
    type: 'chance',
    team: 'Manchester City',
    player: 'Phil Foden',
    description: 'Foden dips the free-kick over the wall; Raya makes a composed two-handed catch.',
    score: { home: 1, away: 0 },
    importance: 0.65,
    ruleSnippet: 'Defensive wall: Line of defending players positioned 10 yards away to obstruct direct shots on goal.'
  },
  {
    id: 'ev-10',
    tSec: 56,
    clock: "33'",
    type: 'chance',
    team: 'Arsenal',
    player: 'Kai Havertz',
    description: 'Havertz connects on a through ball from Rice and chips Ederson, but Dias clears off the line!',
    score: { home: 1, away: 0 },
    importance: 0.82,
    ruleSnippet: 'Goal-line clearance: Defending outfield player prevents a certain goal by clearing the ball before crossing the line.'
  },
  {
    id: 'ev-11',
    tSec: 62,
    clock: "37'",
    type: 'chance',
    team: 'Manchester City',
    player: 'Erling Haaland',
    description: 'Haaland header clatters against the crossbar from a pinpoint De Bruyne diagonal delivery.',
    score: { home: 1, away: 0 },
    importance: 0.88,
    ruleSnippet: 'Woodwork deflection: When ball strikes post or crossbar, play continues unless it crosses the line.'
  },
  {
    id: 'ev-12',
    tSec: 68,
    clock: "41'",
    type: 'card',
    team: 'Arsenal',
    player: 'Thomas Partey',
    description: 'Yellow card for Partey for a reckless challenge on Mateo Kovacic in central midfield.',
    score: { home: 1, away: 0 },
    importance: 0.55,
    ruleSnippet: 'Reckless tackle: Player acts with complete disregard to the danger to, or consequences for, an opponent.'
  },
  {
    id: 'ev-13',
    tSec: 74,
    clock: "45+1'",
    type: 'goal',
    team: 'Manchester City',
    player: 'Erling Haaland',
    description: 'GOAL! Haaland equalizes right on the stroke of halftime with an unstoppable first-time volley!',
    score: { home: 1, away: 1 },
    importance: 0.95,
    ruleSnippet: 'Volley finish: Striking the ball cleanly while airborne before it touches the turf.'
  },
  {
    id: 'ev-14',
    tSec: 80,
    clock: "45+3'",
    type: 'chance',
    team: 'Arsenal',
    player: 'Martin Ødegaard',
    description: 'Halftime whistle sounds with the teams locked at 1-1 after an electrifying first period.',
    score: { home: 1, away: 1 },
    importance: 0.4,
    ruleSnippet: 'Halftime interval: 15-minute pause allowing team tactical adjustments and recovery.'
  },
  {
    id: 'ev-15',
    tSec: 85,
    clock: "48'",
    type: 'chance',
    team: 'Manchester City',
    player: 'Jeremy Doku',
    description: 'Second half resumes; Doku beats Ben White with lightning stepovers and hits the side netting.',
    score: { home: 1, away: 1 },
    importance: 0.62,
    ruleSnippet: '1v1 take-on: Attacking dribbler isolations against a solitary full-back.'
  },
  {
    id: 'ev-16',
    tSec: 90,
    clock: "52'",
    type: 'var_decision',
    team: 'Arsenal',
    player: 'Kai Havertz',
    description: 'VAR Review: Penalty check for Arsenal after Havertz goes down in the box under challenge from Dias.',
    score: { home: 1, away: 1 },
    importance: 0.85,
    ruleSnippet: 'VAR protocol: Video Assistant Referee examines clear and obvious errors in penalty box incidents.'
  },
  {
    id: 'ev-17',
    tSec: 96,
    clock: "54'",
    type: 'var_decision',
    team: 'Arsenal',
    player: 'Referee Michael Oliver',
    description: 'VAR verdict confirmed: No penalty! Minimal contact deemed clean challenge by Ruben Dias.',
    score: { home: 1, away: 1 },
    importance: 0.78,
    ruleSnippet: 'Overturned penalty: If video footage confirms ball was won or contact was non-fouling, play restarts with drop ball.'
  },
  {
    id: 'ev-18',
    tSec: 102,
    clock: "59'",
    type: 'substitution',
    team: 'Arsenal',
    player: 'Leandro Trossard',
    description: 'Tactical substitution for Arsenal: Leandro Trossard replaces Gabriel Martinelli on the wing.',
    score: { home: 1, away: 1 },
    importance: 0.5,
    ruleSnippet: 'Tactical substitution: Introducing fresh legs and specific tactical instructions to alter match dynamics.'
  },
  {
    id: 'ev-19',
    tSec: 108,
    clock: "63'",
    type: 'chance',
    team: 'Arsenal',
    player: 'Declan Rice',
    description: 'Rice intercepts Rodri and feeds Trossard whose curler is pushed away by Ederson at full stretch.',
    score: { home: 1, away: 1 },
    importance: 0.75,
    ruleSnippet: 'Turnover transition: Counter-attack launched immediately after winning the ball in midfield.'
  },
  {
    id: 'ev-20',
    tSec: 114,
    clock: "67'",
    type: 'chance',
    team: 'Manchester City',
    player: 'Kevin De Bruyne',
    description: 'De Bruyne threads a trademark eye-of-the-needle pass into Foden, whose low blast is saved by Raya!',
    score: { home: 1, away: 1 },
    importance: 0.8,
    ruleSnippet: 'Reflex save: Goalkeeper reacts instantaneously from point-blank range to deny a goal.'
  },
  {
    id: 'ev-21',
    tSec: 120,
    clock: "71'",
    type: 'goal',
    team: 'Manchester City',
    player: 'Phil Foden',
    description: 'GOAL! Phil Foden pounces on a loose ball 20 yards out and curls a masterclass into the top right corner!',
    score: { home: 1, away: 2 },
    importance: 0.96,
    ruleSnippet: 'Upper 90 finish: Shot placed into the extreme upper corners of the net where goalkeepers cannot reach.'
  },
  {
    id: 'ev-22',
    tSec: 126,
    clock: "75'",
    type: 'card',
    team: 'Manchester City',
    player: 'Ruben Dias',
    description: 'Yellow card for Dias for pulling Havertz shirt to deny a direct route to goal.',
    score: { home: 1, away: 2 },
    importance: 0.6,
    ruleSnippet: 'Denying promising attack (SPA): Holding an attacker to prevent forward progress results in mandatory caution.'
  },
  {
    id: 'ev-23',
    tSec: 132,
    clock: "78'",
    type: 'chance',
    team: 'Arsenal',
    player: 'Bukayo Saka',
    description: 'Saka drives past Gvardiol and strikes against the outer post! Emirates crowd roars encouragement.',
    score: { home: 1, away: 2 },
    importance: 0.84,
    ruleSnippet: 'Near post drive: Striking hard and low inside the near post before goalkeeper shifts weight.'
  },
  {
    id: 'ev-24',
    tSec: 138,
    clock: "82'",
    type: 'substitution',
    team: 'Manchester City',
    player: 'Nathan Ake',
    description: 'Man City change: Nathan Aké enters to bolster defense, replacing Jeremy Doku.',
    score: { home: 1, away: 2 },
    importance: 0.45,
    ruleSnippet: 'Defensive reinforcement: Adding defensive personnel to hold a one-goal advantage in late stages.'
  },
  {
    id: 'ev-25',
    tSec: 144,
    clock: "85'",
    type: 'foul',
    team: 'Manchester City',
    player: 'Kyle Walker',
    description: 'Walker crashes into Trossard on the edge of the box. Dangerous free kick for Arsenal.',
    score: { home: 1, away: 2 },
    importance: 0.72,
    ruleSnippet: 'Set-piece opportunity: Structured dead-ball play designed to maximize goal probability.'
  },
  {
    id: 'ev-26',
    tSec: 150,
    clock: "88'",
    type: 'chance',
    team: 'Arsenal',
    player: 'Martin Ødegaard',
    description: 'Ødegaard floats the free kick in; Gabriel heads down, Ederson scrambles it off the line!',
    score: { home: 1, away: 2 },
    importance: 0.86,
    ruleSnippet: 'Second ball scramble: Chaos in penalty box where attackers and defenders scramble for loose ball.'
  },
  {
    id: 'ev-27',
    tSec: 156,
    clock: "90+1'",
    type: 'goal',
    team: 'Arsenal',
    player: 'Declan Rice',
    description: 'GOAL! Declan Rice unleashes a thunderbolt from 25 yards! Equalizer in stoppage time!',
    score: { home: 2, away: 2 },
    importance: 0.98,
    ruleSnippet: 'Stoppage time goal: Critical score during additional minutes added for earlier game stoppages.'
  },
  {
    id: 'ev-28',
    tSec: 162,
    clock: "90+4'",
    type: 'chance',
    team: 'Manchester City',
    player: 'Erling Haaland',
    description: 'Haaland breakaways in response, but Saliba makes a superhuman slide tackle to dispossess him clean!',
    score: { home: 2, away: 2 },
    importance: 0.9,
    ruleSnippet: 'Last man tackle: Perfectly timed tackle by the final outfield defender without conceding a penalty or red card.'
  },
  {
    id: 'ev-29',
    tSec: 168,
    clock: "90+7'",
    type: 'goal',
    team: 'Arsenal',
    player: 'Leandro Trossard',
    description: 'GOAL! Unbelievable scenes! Trossard taps in Saka cutback at 90+7 to win it for Arsenal!',
    score: { home: 3, away: 2 },
    importance: 1.0,
    ruleSnippet: 'Buzzer-beater winner: Decisive goal scored in the final dying seconds of competitive action.'
  },
  {
    id: 'ev-30',
    tSec: 174,
    clock: "90+8'",
    type: 'card',
    team: 'Arsenal',
    player: 'Leandro Trossard',
    description: 'Yellow card for Trossard for excessive celebration removing his shirt with the fans.',
    score: { home: 3, away: 2 },
    importance: 0.45,
    ruleSnippet: 'Celebration caution: Under IFAB rules, removing jersey during goal celebration mandates a yellow card.'
  },
  {
    id: 'ev-31',
    tSec: 180,
    clock: "90+9'",
    type: 'chance',
    team: 'Arsenal',
    player: 'Match Official',
    description: 'FULL TIME! Emirates Stadium erupts! Arsenal 3, Manchester City 2 in an instant classic.',
    score: { home: 3, away: 2 },
    importance: 0.99,
    ruleSnippet: 'Full-time whistle: Three distinct blasts signaling completion of 90 minutes plus extra time.'
  }
];

export const CURRENT_FEATURED_MATCH: Match = {
  id: 'match-ars-mci-2026',
  title: 'Arsenal vs Manchester City',
  sport: 'football',
  home: {
    id: 'team-ars',
    name: 'Arsenal',
    shortName: 'ARS',
    color: '#EF0107',
    record: '18-4-2 (2nd)'
  },
  away: {
    id: 'team-mci',
    name: 'Manchester City',
    shortName: 'MCI',
    color: '#6CABDD',
    record: '19-3-2 (1st)'
  },
  status: 'live',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  durationSec: 180,
  league: 'Premier League · Super Sunday',
  venue: 'Emirates Stadium, London',
  events: SHARED_MATCH_EVENTS
};

export const HIGHLIGHTS_LIST = [
  {
    id: 'hl-1',
    title: "Leandro Trossard 97' Miracle Winner",
    match: 'Arsenal vs Manchester City',
    duration: "0:45",
    tSec: 168,
    badge: 'WINNING GOAL',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80'
  },
  {
    id: 'hl-2',
    title: "Declan Rice 25-Yard Stoppage Screamer",
    match: 'Arsenal vs Manchester City',
    duration: "0:38",
    tSec: 156,
    badge: 'SUPER GOAL',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'
  },
  {
    id: 'hl-3',
    title: "Phil Foden Top-Corner Curler",
    match: 'Arsenal vs Manchester City',
    duration: "0:40",
    tSec: 120,
    badge: 'GOAL',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80'
  },
  {
    id: 'hl-4',
    title: "Erling Haaland Halftime Volley",
    match: 'Arsenal vs Manchester City',
    duration: "0:35",
    tSec: 74,
    badge: 'GOAL',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80'
  },
  {
    id: 'hl-5',
    title: "Bukayo Saka Opening Inside-Curler",
    match: 'Arsenal vs Manchester City',
    duration: "0:42",
    tSec: 34,
    badge: 'OPENER',
    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80'
  }
];

export const FAMILY_PICKS = [
  {
    id: 'fp-1',
    title: 'Top 10 Incredible Comebacks in Football',
    category: 'Family Friendly',
    duration: '12 min',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
    description: 'Inspiring team triumphs explained simply for young sports fans!'
  },
  {
    id: 'fp-2',
    title: 'How Goalkeepers Defy Gravity',
    category: 'Kid Sports Science',
    duration: '8 min',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    description: 'Super slow-motion diving saves with physics fun.'
  },
  {
    id: 'fp-3',
    title: 'The Great Mascot Race & Fun Moments',
    category: 'Laugh & Cheer',
    duration: '15 min',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    description: 'Hilarious mascot antics and heartwarming stadium celebrations.'
  }
];
