# EPIC 4 — Trophées (P1/P2)

## F-401 — Modèle Trophy & attribution manuelle (P1) ✅ DONE

**Implémentation :**
- `apps/api/src/models/trophy.py` + `apps/api/src/models/trophy_attribution.py`
- `apps/api/src/schemas/trophy.py`
- `apps/api/src/repositories/trophy.py`
- `apps/api/src/api/v1/trophies.py`
- Migration Alembic : `5188b4636b70_add_trophies_and_trophy_attributions`
- Types OpenAPI régénérés + exports dans `packages/shared-types/src/index.ts`

**Acceptance Criteria:**
- [x] CRUD trophées (admin) : `name`, `description`, `icon_url`, `rule_type`, `rule_config`, `season_id`
- [x] Attribution manuelle : `POST /api/v1/trophies/attributions`
- [x] Cible : astronaute OU planète (pas les deux) — contrainte CHECK en BDD + validation Pydantic
- [x] Lié à la saison active automatiquement
- [x] `GET /trophies/attributions?astronaut_id=X` et `?planet_id=X`
- [x] `DELETE /trophies/attributions/:id`

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Attribution à astronaute | 201, lié à la saison |
| Attribution à planète ET astronaute | 422 |
| Non-admin | 403 |

---

## F-402 — Trophées automatiques par règles (P2)

**Description:** Moteur de règles JSON évalué après chaque attribution de points.

**Acceptance Criteria:**
- [ ] `rule_type = "automatic"`, `rule_config` en JSON
- [ ] Règles supportées : `min_activities_in_season`, `min_points_total`, `challenge_rank`
- [ ] Évaluation async après chaque `PointAttribution`
- [ ] Attribution unique par astronaute/planète par saison pour un trophée donné

**Exemple rule_config:**
```json
{"type": "min_activities_in_season", "activity_category": "article", "min_count": 3}
```

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Règle "3 articles", astronaute en a 2 | Pas de trophée |
| Astronaute soumet 3ème article | Trophée attribué |
| 4ème article | Pas de doublon |

---

## F-403 — Affichage des trophées sur la fiche astronaute (P1) ✅ DONE

**Implémentation :**
- `apps/frontend/src/routes/astronauts/AstronautProfilePage.tsx`
- `apps/frontend/src/api/astronauts.ts` — `useTrophyAttributions(astronautId)`
- `apps/frontend/src/api/types.ts` — type `TrophyAttribution` ajouté

**Acceptance Criteria:**
- [x] Section trophées sur la page profil (onglet "Trophées")
- [x] Icône (emoji) + nom + commentaire + date
- [x] État vide géré (message "Aucun trophée pour l'instant")
- [x] `StatCard` Trophées affiche le vrai count
- [x] Tri chronologique desc

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 0 trophée | Message "Aucun trophée pour l'instant" |
| Plusieurs trophées | Tous affichés, triés par date |

---

## F-404 — Historique des trophées planète (P1) ✅ DONE

**Implémentation :**
- `apps/frontend/src/components/features/planet-detail/PlanetDetail.tsx`
- `apps/frontend/src/api/astronauts.ts` — `usePlanetTrophyAttributions(planetId)` (polling 30s)

**Acceptance Criteria:**
- [x] Onglet "Trophées" sur la page planète (PlanetDetail overlay)
- [x] Icône + nom + commentaire + date
- [x] Tri chronologique desc
- [x] État vide géré
- [x] Stat "Trophées" dans le header du panel mise à jour en temps réel
- [ ] Groupé par saison (non implémenté — acceptable MVP)
- [ ] Filtre par saison (non implémenté — acceptable MVP)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Planète avec trophées | Tous affichés triés par date |
| 0 trophée | Message "Aucun trophée pour l'instant" |
