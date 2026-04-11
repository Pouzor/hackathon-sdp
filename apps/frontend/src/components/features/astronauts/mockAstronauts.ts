// ── Mock astronaut data ──────────────────────────────────────────────────────

export type Astronaut = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string | null;
  planet: { id: string; name: string; color: string };
  grade: string;
  totalPoints: number;
  hireDate: string;
  hobbies: string;
  client: string;
  contributions: Contribution[];
  trophies: Trophy[];
};

export type Contribution = {
  id: number;
  activity: string;
  points: number;
  date: string;
  bonus?: string;
};

export type Trophy = {
  id: number;
  icon: string;
  name: string;
  description: string;
  date: string;
};

const PLANETS = {
  raccoon: { name: "Raccoons of Asgard", color: "#eab308" },
  duck:    { name: "Duck Invaders",      color: "#22c55e" },
  donut:   { name: "Donut Factory",      color: "#ec4899" },
  cats:    { name: "SchizoCats",         color: "#3b82f6" },
  hq:      { name: "HQ",                color: "#b8c8e8" },
};

export const ASTRONAUTS: Astronaut[] = [
  {
    id: 1,
    firstName: "Alice", lastName: "Martin",
    email: "alice.martin@eleven-labs.com",
    photoUrl: null,
    planet: { id: "raccoon", ...PLANETS.raccoon },
    grade: "Fleet Admiral ★★★", totalPoints: 420,
    hireDate: "2021-03-15", hobbies: "Escalade, Piano", client: "BNP Paribas",
    contributions: [
      { id: 1, activity: "Talk conférence externe", points: 160, date: "2026-04-09", bonus: "×2 first ever" },
      { id: 2, activity: "Workshop animé",          points: 60,  date: "2026-04-05" },
      { id: 3, activity: "Article de blog",         points: 80,  date: "2026-03-20" },
      { id: 4, activity: "Contribution open source",points: 50,  date: "2026-02-14" },
      { id: 5, activity: "Talk interne",            points: 40,  date: "2026-01-28" },
    ],
    trophies: [
      { id: 1, icon: "⚡", name: "Éclair nordique", description: "Talk externe + article même semaine", date: "2026-04-09" },
      { id: 2, icon: "🏆", name: "Premier sang",    description: "1ère contribution de la saison",      date: "2026-01-15" },
    ],
  },
  {
    id: 2,
    firstName: "Bob", lastName: "Leclerc",
    email: "bob.leclerc@eleven-labs.com",
    photoUrl: null,
    planet: { id: "raccoon", ...PLANETS.raccoon },
    grade: "Admiral", totalPoints: 310,
    hireDate: "2022-09-01", hobbies: "Jeux vidéo, Running", client: "Société Générale",
    contributions: [
      { id: 1, activity: "Article de blog",          points: 65,  date: "2026-04-08", bonus: "+25 first season" },
      { id: 2, activity: "Contribution open source", points: 50,  date: "2026-03-12" },
      { id: 3, activity: "Talk interne",             points: 40,  date: "2026-02-05" },
    ],
    trophies: [
      { id: 1, icon: "🔥", name: "En feu", description: "5 contributions en une semaine", date: "2026-03-02" },
    ],
  },
  {
    id: 3,
    firstName: "Clara", lastName: "Dumont",
    email: "clara.dumont@eleven-labs.com",
    photoUrl: null,
    planet: { id: "raccoon", ...PLANETS.raccoon },
    grade: "Captain", totalPoints: 260,
    hireDate: "2023-01-10", hobbies: "Yoga, Lecture", client: "AXA",
    contributions: [
      { id: 1, activity: "Contribution open source", points: 50, date: "2026-04-07" },
      { id: 2, activity: "Article de blog",          points: 80, date: "2026-03-01" },
    ],
    trophies: [],
  },
  {
    id: 4,
    firstName: "François", lastName: "Petit",
    email: "francois.petit@eleven-labs.com",
    photoUrl: null,
    planet: { id: "duck", ...PLANETS.duck },
    grade: "Vice Admiral", totalPoints: 380,
    hireDate: "2020-06-01", hobbies: "Cuisine, Surf", client: "LVMH",
    contributions: [
      { id: 1, activity: "Talk conférence externe", points: 80, date: "2026-04-10" },
      { id: 2, activity: "Contribution open source",points: 50, date: "2026-04-02" },
      { id: 3, activity: "Talk interne",            points: 40, date: "2026-02-18" },
    ],
    trophies: [
      { id: 1, icon: "👾", name: "Space invader", description: "3 talks en une saison", date: "2026-03-15" },
    ],
  },
  {
    id: 5,
    firstName: "Sophie", lastName: "Bernard",
    email: "sophie.bernard@eleven-labs.com",
    photoUrl: null,
    planet: { id: "duck", ...PLANETS.duck },
    grade: "Captain", totalPoints: 290,
    hireDate: "2022-04-20", hobbies: "Photographie, Randonnée", client: "Renault",
    contributions: [
      { id: 1, activity: "Article de blog",          points: 65, date: "2026-04-09", bonus: "+25 first season" },
      { id: 2, activity: "Workshop animé",           points: 60, date: "2026-03-22" },
    ],
    trophies: [
      { id: 1, icon: "🦆", name: "Duck season", description: "1ère contribution de la saison", date: "2026-01-18" },
    ],
  },
  {
    id: 6,
    firstName: "Thomas", lastName: "Moreau",
    email: "thomas.moreau@eleven-labs.com",
    photoUrl: null,
    planet: { id: "duck", ...PLANETS.duck },
    grade: "Commander", totalPoints: 240,
    hireDate: "2023-03-05", hobbies: "Musique, Cyclisme", client: "Orange",
    contributions: [
      { id: 1, activity: "Workshop animé",           points: 60, date: "2026-04-07" },
      { id: 2, activity: "Recrutement (cooptation)", points: 100, date: "2026-03-10" },
    ],
    trophies: [],
  },
  {
    id: 7,
    firstName: "Laura", lastName: "Simon",
    email: "laura.simon@eleven-labs.com",
    photoUrl: null,
    planet: { id: "donut", ...PLANETS.donut },
    grade: "Rear Admiral", totalPoints: 310,
    hireDate: "2021-11-08", hobbies: "Pâtisserie, Natation", client: "Total",
    contributions: [
      { id: 1, activity: "Article de blog", points: 80, date: "2026-04-10", bonus: "×2 first ever" },
      { id: 2, activity: "Talk interne",    points: 60, date: "2026-03-18" },
    ],
    trophies: [
      { id: 1, icon: "🎯", name: "Bullseye", description: "Article + talk la même semaine", date: "2026-03-20" },
    ],
  },
  {
    id: 8,
    firstName: "Paul", lastName: "Lefebvre",
    email: "paul.lefebvre@eleven-labs.com",
    photoUrl: null,
    planet: { id: "donut", ...PLANETS.donut },
    grade: "Captain", totalPoints: 280,
    hireDate: "2022-07-11", hobbies: "BD, Tennis", client: "Engie",
    contributions: [
      { id: 1, activity: "Talk interne",             points: 60, date: "2026-04-08" },
      { id: 2, activity: "Contribution open source", points: 50, date: "2026-03-05" },
    ],
    trophies: [
      { id: 1, icon: "🍩", name: "Donut day", description: "10 contributions en une saison", date: "2026-02-10" },
    ],
  },
  {
    id: 9,
    firstName: "Jade", lastName: "Morel",
    email: "jade.morel@eleven-labs.com",
    photoUrl: null,
    planet: { id: "cats", ...PLANETS.cats },
    grade: "Commodore", totalPoints: 260,
    hireDate: "2023-06-01", hobbies: "Jeu de rôle, Dessin", client: "Capgemini",
    contributions: [
      { id: 1, activity: "Talk conférence externe", points: 80, date: "2026-04-09" },
      { id: 2, activity: "Workshop animé",          points: 60, date: "2026-03-28" },
    ],
    trophies: [
      { id: 1, icon: "🌈", name: "Nyan power", description: "1ère contribution de la saison", date: "2026-01-22" },
    ],
  },
  {
    id: 10,
    firstName: "Hugo", lastName: "Barbier",
    email: "hugo.barbier@eleven-labs.com",
    photoUrl: null,
    planet: { id: "cats", ...PLANETS.cats },
    grade: "Captain", totalPoints: 200,
    hireDate: "2024-01-15", hobbies: "Escape game, Poker", client: "Sncf",
    contributions: [
      { id: 1, activity: "Article de blog", points: 65, date: "2026-04-07", bonus: "+25 first season" },
      { id: 2, activity: "Talk interne",    points: 40, date: "2026-02-20" },
    ],
    trophies: [],
  },
  {
    id: 11,
    firstName: "Ambre", lastName: "Colin",
    email: "ambre.colin@eleven-labs.com",
    photoUrl: null,
    planet: { id: "cats", ...PLANETS.cats },
    grade: "Commander", totalPoints: 160,
    hireDate: "2024-04-02", hobbies: "Danse, Manga", client: "Decathlon",
    contributions: [
      { id: 1, activity: "Workshop animé", points: 60, date: "2026-04-05" },
    ],
    trophies: [],
  },
  {
    id: 12,
    firstName: "Sam", lastName: "Dupuis",
    email: "sam.dupuis@eleven-labs.com",
    photoUrl: null,
    planet: { id: "hq", ...PLANETS.hq },
    grade: "Rookie", totalPoints: 0,
    hireDate: "2026-03-01", hobbies: "Voyages", client: "—",
    contributions: [],
    trophies: [],
  },
];

export function getAstronaut(id: number): Astronaut | undefined {
  return ASTRONAUTS.find((a) => a.id === id);
}
