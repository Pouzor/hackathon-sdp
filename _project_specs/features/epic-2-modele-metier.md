# EPIC 2 — Modèle métier & configuration (P1)

## F-201 — Modèle Planet ✅

**Acceptance Criteria:**
- [x] CRUD complet admin (`/api/v1/planets`)
- [x] Champs : `name`, `mantra`, `blason_url`, `color_hex`, `is_competing`, `is_default_for_newcomers`
- [x] Seed des 6 planètes existantes
- [x] Unicité du nom
- [ ] Suppression contrôlée (pas si des astronautes y sont rattachés) — _à implémenter dans F-202_

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Création planète | 201 + planète en BDD |
| Nom dupliqué | 409 Conflict |
| Suppression planète avec astronautes | 400 avec message |
| Non-admin CRUD | 403 |

---

## F-202 — Modèle Astronaut 🔶 (partiel) — self-edit ✅ DONE

**Implémentation :**
- `apps/api/src/api/v1/astronauts.py` — `PATCH /api/v1/astronauts/{id}` (self-edit + admin)
- `apps/api/src/schemas/astronaut.py` — `AstronautSelfUpdate` (photo_url, hobbies, client)
- `apps/api/src/repositories/astronaut.py` — `update_profile()`
- PR #7 mergée le 2026-04-12

**Acceptance Criteria:**
- [x] Modèle SQLAlchemy + migration (champs complets)
- [x] Un astronaute peut modifier : `photo_url`, `hobbies`, `client` uniquement
- [x] Admin peut modifier le profil de n'importe quel astronaute (mêmes champs)
- [x] Astronaute modifiant le profil d'un autre → 403
- [x] `total_points` ignoré (non exposé dans le schéma)
- [ ] Admin CRUD complet (first_name, last_name, planet_id, hire_date) — _à implémenter_

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Astronaute modifie son profil | 200, champs autorisés mis à jour |
| Astronaute tente de changer `total_points` | Champ ignoré ou 400 |
| Astronaute modifie profil d'un autre | 403 |
| Admin modifie n'importe quel profil | 200 |

---

## F-203 — Modèle Season ✅

**Acceptance Criteria:**
- [x] CRUD admin (`/api/v1/seasons`)
- [x] Une seule saison `is_active` à la fois (contrainte + endpoint `activate`)
- [x] Activation d'une saison désactive l'ancienne
- [x] Clôture : reset des compteurs planète (`SeasonPlanetScore`), conservation des points individuels
- [ ] Archivage des trophées de saison — _dépend de F-Epic 4_

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Activation 2ème saison | Ancienne désactivée |
| 2 saisons actives en même temps | 400 |
| Clôture saison | Points planète = 0, points astronautes conservés |
| Trophées après clôture | Archivés avec `season_id` |

---

## F-204 — Modèle Activity ✅

**Acceptance Criteria:**
- [x] CRUD admin (`/api/v1/activities`)
- [x] Champs : `name`, `base_points`, `category`, `is_collaborative`, `allow_multiple_assignees`
- [x] Catalogue pré-rempli (seed) avec les activités du brief (9 activités)

**Catalogue seed initial:**
- Article de blog (40 pts)
- Talk interne (60 pts)
- Talk conférence externe (80 pts)
- Workshop animé (60 pts)
- Participation challenge (variable)
- Contribution open source (50 pts)
- Recrutement (cooptation) (100 pts)
- Parrainage nouveau (30 pts)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Création activité | 201 |
| `base_points` négatif | 422 |

---

## F-205 — Modèle Grade ✅

**Acceptance Criteria:**
- [x] CRUD admin (`/api/v1/grades`)
- [x] Seed des 14 grades (Rookie → Fleet Admiral ★★★)
- [x] Calcul du grade courant basé sur `total_points` (`GradeRepository.get_for_points`)
- [ ] Endpoint `GET /api/v1/astronauts/{id}/grade` — _à implémenter dans F-202_

**Grades (seed):**
Rookie (0), Cadet (100), Ensign (250), Lieutenant (500), Commander (1000),
Captain (2000), Commodore (3500), Rear Admiral (5000), Vice Admiral (7000),
Admiral (9500), Fleet Admiral 1★ (12500), Fleet Admiral 2★ (16000), Fleet Admiral 3★ (20000+)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 0 pts | Rookie |
| 10000 pts | Fleet Admiral 2★ |
| Modification seuil | Grade recalculé |

---

## F-206 — Configuration ancienneté 🔶 (partiel)

**Acceptance Criteria:**
- [x] Modèle `SeniorityConfig` en BDD (seed : `points_per_year = 50`)
- [ ] Endpoint admin `PUT /api/v1/config/seniority` — _non encore créé_
- [x] Paramètre `points_per_year` (défaut : 50)
- [ ] Calcul : `floor(years_since_hire) × points_per_year`
- [ ] Modifié → recalcul des points d'ancienneté de tous les astronautes

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 3 ans d'ancienneté, 50 pts/an | +150 pts |
| Modification `points_per_year` → 100 | Astronaute à 3 ans → +300 pts |
