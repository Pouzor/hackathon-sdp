// ── Mock planet detail data ──────────────────────────────────────────────────

export type Member = {
  id: number;
  name: string;
  grade: string;
  points: number;
  avatar: string;
};

export type Contribution = {
  id: number;
  astronaut: string;
  activity: string;
  points: number;
  date: string;
  bonus?: string;
};

export type Trophy = {
  id: number;
  name: string;
  icon: string;
  description: string;
  date: string;
};

export type PlanetDetailData = {
  members: Member[];
  contributions: Contribution[];
  trophies: Trophy[];
};

const DATA: Record<string, PlanetDetailData> = {
  raccoon: {
    members: [
      { id: 1, name: "Alice Martin", grade: "Fleet Admiral ★★★", points: 420, avatar: "AM" },
      { id: 2, name: "Bob Leclerc", grade: "Admiral", points: 310, avatar: "BL" },
      { id: 3, name: "Clara Dumont", grade: "Captain", points: 260, avatar: "CD" },
      { id: 4, name: "David Chen", grade: "Commander", points: 180, avatar: "DC" },
      { id: 5, name: "Eva Rousseau", grade: "Lieutenant", points: 80, avatar: "ER" },
    ],
    contributions: [
      {
        id: 1,
        astronaut: "Alice Martin",
        activity: "Talk conférence externe",
        points: 160,
        date: "2026-04-09",
        bonus: "×2 first ever",
      },
      {
        id: 2,
        astronaut: "Bob Leclerc",
        activity: "Article de blog",
        points: 65,
        date: "2026-04-08",
        bonus: "+25 first season",
      },
      {
        id: 3,
        astronaut: "Clara Dumont",
        activity: "Contribution open source",
        points: 50,
        date: "2026-04-07",
      },
      {
        id: 4,
        astronaut: "Alice Martin",
        activity: "Workshop animé",
        points: 60,
        date: "2026-04-05",
      },
      {
        id: 5,
        astronaut: "David Chen",
        activity: "Recrutement (cooptation)",
        points: 100,
        date: "2026-04-03",
      },
      {
        id: 6,
        astronaut: "Eva Rousseau",
        activity: "Article de blog",
        points: 40,
        date: "2026-04-01",
      },
    ],
    trophies: [
      {
        id: 1,
        icon: "🏆",
        name: "Premier sang",
        description: "1ère contribution de la saison",
        date: "2026-01-15",
      },
      {
        id: 2,
        icon: "🔥",
        name: "En feu",
        description: "5 contributions en une semaine",
        date: "2026-03-02",
      },
      {
        id: 3,
        icon: "⚡",
        name: "Éclair nordique",
        description: "Talk externe + article même semaine",
        date: "2026-04-09",
      },
    ],
  },
  duck: {
    members: [
      { id: 1, name: "François Petit", grade: "Vice Admiral", points: 380, avatar: "FP" },
      { id: 2, name: "Sophie Bernard", grade: "Captain", points: 290, avatar: "SB" },
      { id: 3, name: "Thomas Moreau", grade: "Commander", points: 240, avatar: "TM" },
      { id: 4, name: "Julie Lambert", grade: "Lieutenant", points: 130, avatar: "JL" },
      { id: 5, name: "Marc Girard", grade: "Cadet", points: 60, avatar: "MG" },
    ],
    contributions: [
      {
        id: 1,
        astronaut: "François Petit",
        activity: "Talk conférence externe",
        points: 80,
        date: "2026-04-10",
      },
      {
        id: 2,
        astronaut: "Sophie Bernard",
        activity: "Article de blog",
        points: 65,
        date: "2026-04-09",
        bonus: "+25 first season",
      },
      {
        id: 3,
        astronaut: "Thomas Moreau",
        activity: "Workshop animé",
        points: 60,
        date: "2026-04-07",
      },
      {
        id: 4,
        astronaut: "Julie Lambert",
        activity: "Recrutement (cooptation)",
        points: 100,
        date: "2026-04-05",
      },
      {
        id: 5,
        astronaut: "François Petit",
        activity: "Contribution open source",
        points: 50,
        date: "2026-04-02",
      },
    ],
    trophies: [
      {
        id: 1,
        icon: "🦆",
        name: "Duck season",
        description: "1ère contribution de la saison",
        date: "2026-01-18",
      },
      {
        id: 2,
        icon: "👾",
        name: "Space invader",
        description: "3 talks en une saison",
        date: "2026-03-15",
      },
    ],
  },
  donut: {
    members: [
      { id: 1, name: "Laura Simon", grade: "Rear Admiral", points: 310, avatar: "LS" },
      { id: 2, name: "Paul Lefebvre", grade: "Captain", points: 280, avatar: "PL" },
      { id: 3, name: "Nina Fontaine", grade: "Commander", points: 210, avatar: "NF" },
      { id: 4, name: "Romain Blanc", grade: "Ensign", points: 120, avatar: "RB" },
      { id: 5, name: "Camille Rey", grade: "Cadet", points: 60, avatar: "CR" },
    ],
    contributions: [
      {
        id: 1,
        astronaut: "Laura Simon",
        activity: "Article de blog",
        points: 80,
        date: "2026-04-10",
        bonus: "×2 first ever",
      },
      {
        id: 2,
        astronaut: "Paul Lefebvre",
        activity: "Talk interne",
        points: 60,
        date: "2026-04-08",
      },
      {
        id: 3,
        astronaut: "Nina Fontaine",
        activity: "Workshop animé",
        points: 85,
        date: "2026-04-06",
        bonus: "+25 first season",
      },
      {
        id: 4,
        astronaut: "Romain Blanc",
        activity: "Contribution open source",
        points: 50,
        date: "2026-04-03",
      },
      {
        id: 5,
        astronaut: "Camille Rey",
        activity: "Parrainage nouveau",
        points: 30,
        date: "2026-04-01",
      },
    ],
    trophies: [
      {
        id: 1,
        icon: "🍩",
        name: "Donut day",
        description: "10 contributions en une saison",
        date: "2026-02-10",
      },
      {
        id: 2,
        icon: "🎯",
        name: "Bullseye",
        description: "Article + talk la même semaine",
        date: "2026-03-20",
      },
    ],
  },
  cats: {
    members: [
      { id: 1, name: "Jade Morel", grade: "Commodore", points: 260, avatar: "JM" },
      { id: 2, name: "Hugo Barbier", grade: "Captain", points: 200, avatar: "HB" },
      { id: 3, name: "Ambre Colin", grade: "Commander", points: 160, avatar: "AC" },
      { id: 4, name: "Léo Garnier", grade: "Lieutenant", points: 90, avatar: "LG" },
      { id: 5, name: "Zoé Mercier", grade: "Rookie", points: 40, avatar: "ZM" },
    ],
    contributions: [
      {
        id: 1,
        astronaut: "Jade Morel",
        activity: "Talk conférence externe",
        points: 80,
        date: "2026-04-09",
      },
      {
        id: 2,
        astronaut: "Hugo Barbier",
        activity: "Article de blog",
        points: 65,
        date: "2026-04-07",
        bonus: "+25 first season",
      },
      {
        id: 3,
        astronaut: "Ambre Colin",
        activity: "Workshop animé",
        points: 60,
        date: "2026-04-05",
      },
      {
        id: 4,
        astronaut: "Léo Garnier",
        activity: "Contribution open source",
        points: 50,
        date: "2026-04-02",
      },
      {
        id: 5,
        astronaut: "Zoé Mercier",
        activity: "Article de blog",
        points: 80,
        date: "2026-04-01",
        bonus: "×2 first ever",
      },
    ],
    trophies: [
      {
        id: 1,
        icon: "🌈",
        name: "Nyan power",
        description: "1ère contribution de la saison",
        date: "2026-01-22",
      },
    ],
  },
  hq: {
    members: [
      { id: 1, name: "Sam Dupuis", grade: "Rookie", points: 0, avatar: "SD" },
      { id: 2, name: "Alex Torres", grade: "Rookie", points: 0, avatar: "AT" },
    ],
    contributions: [],
    trophies: [],
  },
};

export function getPlanetDetail(id: string): PlanetDetailData {
  return DATA[id] ?? { members: [], contributions: [], trophies: [] };
}
