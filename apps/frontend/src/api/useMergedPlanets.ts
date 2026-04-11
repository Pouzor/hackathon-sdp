/**
 * Fusionne les données API (name, season_score, is_competing, color_hex)
 * avec la config visuelle statique (orbitRadius, period, size, Component).
 *
 * Le mapping se fait par nom de planète (insensible à la casse).
 * Si l'API est indisponible, les valeurs mock du PLANET_CONFIG sont utilisées.
 */
import { usePlanets } from "./planets";
import { PLANET_CONFIG, type PlanetData } from "@/components/features/solar-system/SolarSystem";

export function useMergedPlanets(): { planets: PlanetData[]; isLoading: boolean } {
  const { data: apiPlanets, isLoading } = usePlanets();

  const planets: PlanetData[] = PLANET_CONFIG.map((config) => {
    if (!apiPlanets) return config;

    const apiPlanet = apiPlanets.find(
      (p) => p.name.toLowerCase() === config.name.toLowerCase()
    );
    if (!apiPlanet) return config;

    return {
      ...config,
      apiId: apiPlanet.id,
      score: apiPlanet.season_score,
      isCompeting: apiPlanet.is_competing,
      color: apiPlanet.color_hex ?? config.color,
    };
  });

  return { planets, isLoading };
}
