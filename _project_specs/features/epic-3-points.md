# EPIC 3 — Attribution de points (P1)

## F-301 — Attribution de points à un astronaute

**Description:** Endpoint admin pour attribuer des points, historisation immuable.

**Acceptance Criteria:**
- [ ] `POST /api/v1/point-attributions` (admin uniquement)
- [ ] Corps : `astronaut_id`, `activity_id`, `points` (optionnel, défaut = `base_points`), `comment`
- [ ] `season_id` = saison active (automatique)
- [ ] `planet_id` = planète de l'astronaute (automatique)
- [ ] Incrémente `astronaut.total_points` ET compteur planète de la saison
- [ ] Historisation immuable (pas de UPDATE sur `PointAttribution`)
- [ ] Applique les modificateurs (F-303, F-304) automatiquement

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Attribution 40 pts | `astronaut.total_points` += 40, compteur planète += 40 |
| Pas de saison active | 400 avec message explicite |
| `activity_id` inexistant | 422 |
| Non-admin | 403 |

---

## F-302 — Attribution à plusieurs co-auteurs

**Description:** Multi-assignation pour activités collaboratives.

**Acceptance Criteria:**
- [ ] `astronaut_ids` (liste) dans le corps de la requête
- [ ] Activité doit avoir `allow_multiple_assignees = true`
- [ ] Chaque co-auteur reçoit **le total des points** (pas de split)
- [ ] Une `PointAttribution` créée par astronaute

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Article à deux (40 pts) | Chacun reçoit 40 pts |
| Activité sans `allow_multiple_assignees` + 2 astronautes | 400 |
| 3 co-auteurs | 3 attributions, 3 × 40 pts |

---

## F-303 — Multiplicateur "1ère contribution ever"

**Description:** Bonus x2 pour la toute première contribution d'un astronaute.

**Acceptance Criteria:**
- [ ] Détecté automatiquement au moment de l'attribution
- [ ] Si aucun `PointAttribution` antérieur → points × 2
- [ ] Multiplicateur appliqué avant sauvegarde
- [ ] Indiqué dans le `comment` système ou champ dédié

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 1ère contribution (40 pts) | 80 pts reçus |
| 2ème contribution (40 pts) | 40 pts reçus |
| Attributions simultanées (race condition) | Seule la première reçoit x2 |

---

## F-304 — Bonus "1ère contribution de la saison"

**Description:** +25 pts automatiques pour la 1ère contribution dans la saison active.

**Acceptance Criteria:**
- [ ] Vérifié à chaque attribution
- [ ] Si aucune attribution pour cet astronaute dans la saison active → +25 pts
- [ ] Déclenché une seule fois par saison par astronaute
- [ ] Cumulable avec le multiplicateur F-303 (si 1ère ever ET 1ère de la saison)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 1ère contribution de la saison (40 pts) | 40 + 25 = 65 pts |
| 2ème contribution de la saison | Pas de bonus |
| Nouvelle saison, déjà contribué l'ancienne | Bonus déclenché à nouveau |

---

## F-305 — Calcul automatique des points d'ancienneté

**Description:** Crédit automatique des points d'ancienneté à la création de saison.

**Acceptance Criteria:**
- [ ] Déclenché à l'activation d'une nouvelle saison
- [ ] Calcul : `floor((today - hire_date).years) × points_per_year`
- [ ] Crée une `PointAttribution` par astronaute (activité type "ancienneté")
- [ ] Idempotent (pas de doublon si rejoué)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Astronaute 3 ans, 50 pts/an | +150 pts attribution |
| Rejouer le calcul | Aucun doublon |
| Astronaute embauché cette semaine | 0 pts (0 années complètes) |

---

## F-306 — Suppression / correction d'une attribution

**Description:** Suppression admin avec audit log et recalcul des compteurs.

**Acceptance Criteria:**
- [ ] `DELETE /api/v1/point-attributions/{id}` (admin uniquement)
- [ ] Soft delete (conserver pour audit) ou hard delete avec log séparé
- [ ] Recalcul de `astronaut.total_points` et compteur planète
- [ ] Audit log : qui a supprimé, quand, pourquoi (`reason` obligatoire)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Suppression attribution 40 pts | `total_points` -= 40, compteur planète -= 40 |
| Suppression sans `reason` | 422 |
| Non-admin | 403 |
