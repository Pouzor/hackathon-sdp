# EPIC 3 — Attribution de points (P1)

## F-301 — Attribution de points à un astronaute ✅

**Description:** Endpoint admin pour attribuer des points, historisation immuable.

**Acceptance Criteria:**
- [x] `POST /api/v1/point-attributions` (admin uniquement)
- [x] Corps : `astronaut_ids`, `activity_id`, `points` (optionnel, défaut = `base_points`), `comment`
- [x] `season_id` = saison active (automatique)
- [x] `planet_id` = planète de l'astronaute (automatique)
- [x] Incrémente `astronaut.total_points` ET compteur planète de la saison (`SeasonPlanetScore`)
- [x] Historisation immuable (pas de UPDATE sur `PointAttribution`)
- [x] Applique les modificateurs (F-303, F-304) automatiquement

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Attribution 40 pts | `astronaut.total_points` += 40, compteur planète += 40 |
| Pas de saison active | 400 avec message explicite |
| `activity_id` inexistant | 422 |
| Non-admin | 403 |

---

## F-302 — Attribution à plusieurs co-auteurs ✅

**Description:** Multi-assignation pour activités collaboratives.

**Acceptance Criteria:**
- [x] `astronaut_ids` (liste) dans le corps de la requête
- [x] Activité doit avoir `allow_multiple_assignees = true`
- [x] Chaque co-auteur reçoit **le total des points** (pas de split)
- [x] Une `PointAttribution` créée par astronaute

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Article à deux (40 pts) | Chacun reçoit 40 pts |
| Activité sans `allow_multiple_assignees` + 2 astronautes | 400 |
| 3 co-auteurs | 3 attributions, 3 × 40 pts |

---

## F-303 — Multiplicateur "1ère contribution ever" ✅

**Description:** Bonus x2 pour la toute première contribution d'un astronaute.

**Acceptance Criteria:**
- [x] Détecté automatiquement au moment de l'attribution
- [x] Si aucun `PointAttribution` antérieur → points × 2
- [x] Multiplicateur appliqué avant sauvegarde
- [x] Tracé via champ dédié `first_ever_multiplier_applied` sur `PointAttribution`

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 1ère contribution (40 pts) | 80 pts reçus |
| 2ème contribution (40 pts) | 40 pts reçus |
| Attributions simultanées (race condition) | Seule la première reçoit x2 |

---

## F-304 — Bonus "1ère contribution de la saison" ✅

**Description:** +25 pts automatiques pour la 1ère contribution dans la saison active.

**Acceptance Criteria:**
- [x] Vérifié à chaque attribution
- [x] Si aucune attribution pour cet astronaute dans la saison active → +25 pts
- [x] Déclenché une seule fois par saison par astronaute
- [x] Cumulable avec le multiplicateur F-303 (si 1ère ever ET 1ère de la saison)
- [x] Tracé via champ dédié `first_season_bonus_applied` sur `PointAttribution`

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 1ère contribution de la saison (40 pts) | 40 + 25 = 65 pts |
| 2ème contribution de la saison | Pas de bonus |
| Nouvelle saison, déjà contribué l'ancienne | Bonus déclenché à nouveau |

---

## F-305 — Calcul automatique des points d'ancienneté ❌ (non implémenté)

**Description:** Crédit automatique des points d'ancienneté à la création de saison.

**Acceptance Criteria:**
- [ ] Déclenché à l'activation d'une nouvelle saison
- [ ] Calcul : `floor((today - hire_date).years) × points_per_year`
- [ ] Crée une `PointAttribution` par astronaute (activité type "ancienneté")
- [ ] Idempotent (pas de doublon si rejoué)

> **Note:** Dépend de F-206 (endpoint config ancienneté) et F-202 (CRUD astronautes)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Astronaute 3 ans, 50 pts/an | +150 pts attribution |
| Rejouer le calcul | Aucun doublon |
| Astronaute embauché cette semaine | 0 pts (0 années complètes) |

---

## F-306 — Suppression / correction d'une attribution ✅

**Description:** Suppression admin avec audit log et recalcul des compteurs.

**Acceptance Criteria:**
- [x] `DELETE /api/v1/point-attributions/{id}` (admin uniquement)
- [x] Soft delete (champs `is_deleted`, `deleted_by`, `deletion_reason`, `deleted_at`)
- [x] Recalcul de `astronaut.total_points` et compteur planète (`SeasonPlanetScore`)
- [x] Audit log : `deleted_by` (astronaut_id), `deleted_at`, `deletion_reason` (obligatoire)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Suppression attribution 40 pts | `total_points` -= 40, compteur planète -= 40 |
| Suppression sans `reason` | 422 |
| Non-admin | 403 |
