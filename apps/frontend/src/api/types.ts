// TODO: Ces types doivent être générés via openapi-typescript depuis /openapi.json
// (cf. CLAUDE.md §2 et packages/shared-types). En attendant, ils reflètent manuellement
// les schémas Pydantic du backend — toute modification du backend doit être répercutée ici.

export type Planet = {
  id: number;
  name: string;
  mantra: string | null;
  blason_url: string | null;
  color_hex: string | null;
  is_competing: boolean;
  is_default_for_newcomers: boolean;
  season_score: number;
};

export type Astronaut = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  hobbies: string | null;
  client: string | null;
  hire_date: string | null;
  planet_id: number | null;
  roles: string[];
  total_points: number;
  grade_name: string | null;
  created_at: string;
  updated_at: string;
};

export type PointAttribution = {
  id: number;
  astronaut_id: number;
  planet_id: number;
  activity_id: number;
  season_id: number;
  awarded_by: number;
  points: number;
  comment: string | null;
  first_ever_multiplier_applied: boolean;
  first_season_bonus_applied: boolean;
  awarded_at: string;
  activity_name: string | null;
  astronaut_first_name: string | null;
  astronaut_last_name: string | null;
};

export type Activity = {
  id: number;
  name: string;
  base_points: number;
  category: string;
  is_collaborative: boolean;
  allow_multiple_assignees: boolean;
};

export type Season = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
};

export type Grade = {
  id: number;
  name: string;
  threshold_points: number;
  order: number;
};
