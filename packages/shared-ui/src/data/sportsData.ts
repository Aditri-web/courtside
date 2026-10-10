import { CardData } from './moviesData';

export const SPORTS_LIVE_MATCH: CardData = {
  id: 'live-ars-mci',
  title: 'Arsenal vs Manchester City · Super Sunday Live',
  description: 'High-stakes Premier League clash at Emirates Stadium. Saka and Haaland trade goals in an electrifying battle. Experience real-time grounded AI companion analysis, spoiler protection, and tactical explanations.',
  headerImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80',
  movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  duration: 180,
  category: 'Premier League',
  genres: ['Live Sports', 'Football', 'AI Companion']
};

export const LIVE_NOW_RAIL: CardData[] = [
  SPORTS_LIVE_MATCH,
  {
    id: 'live-rmd-bar',
    title: 'Real Madrid vs FC Barcelona · El Clásico',
    description: 'The biggest rivalry in European club football unfolds live under the Bernabéu lights with CourtSide AI analytics.',
    headerImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 180,
    category: 'La Liga'
  },
  {
    id: 'live-lal-bos',
    title: 'Los Angeles Lakers vs Boston Celtics',
    description: 'Historic NBA powerhouse confrontation featuring high-flying dunks and clutch fourth-quarter execution.',
    headerImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 180,
    category: 'NBA'
  }
];

export const HIGHLIGHTS_RAIL: CardData[] = [
  {
    id: 'hl-trossard',
    title: "Leandro Trossard 97' Miracle Winner",
    description: 'Stoppage time madness as Leandro Trossard slots home the winning goal at Emirates Stadium.',
    headerImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 45,
    category: 'Key Moments'
  },
  {
    id: 'hl-rice',
    title: "Declan Rice 25-Yard Stoppage Screamer",
    description: 'Declan Rice arrows a sensational strike into the top corner in the 91st minute.',
    headerImage: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 40,
    category: 'Super Goal'
  },
  {
    id: 'hl-foden',
    title: 'Phil Foden Upper-90 Curler',
    description: 'Phil Foden demonstrates pinpoint ball-striking technique from distance.',
    headerImage: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 38,
    category: 'Turning Point'
  }
];

export const FAMILY_PICKS_RAIL: CardData[] = [
  {
    id: 'fam-1',
    title: 'Top 10 Epic Sports Comebacks for Kids',
    description: 'Incredible underdog stories where teams never gave up, explained simply with positive energy.',
    headerImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 120,
    category: 'Family Friendly'
  },
  {
    id: 'fam-2',
    title: 'Mascot Antics & Hilarious Stadium Fails',
    description: 'Fun-filled laughing moments from stadiums around the globe that will make everyone smile.',
    headerImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 90,
    category: 'Laugh & Cheer'
  }
];

export const UPCOMING_RAIL: CardData[] = [
  {
    id: 'up-1',
    title: 'Liverpool vs Real Madrid · Champions League',
    description: 'Anfield hosts European royalty in this colossal European showdown.',
    headerImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 180,
    category: 'UEFA Champions League'
  },
  {
    id: 'up-2',
    title: 'India vs Australia · T20 World Cup Semifinal',
    description: 'Electrifying cricket showdown with high-octane batting fireworks.',
    headerImage: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=800&q=80',
    movie: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 180,
    category: 'ICC T20'
  }
];
