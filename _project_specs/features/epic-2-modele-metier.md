# EPIC 2 — Modèle métier & configuration (P1)

## F-201 — Modèle Planet

**Acceptance Criteria:**
- [ ] CRUD complet admin (`/api/v1/planets`)
- [ ] Champs : `name`, `mantra`, `blason_url`, `color_hex`, `is_competing`, `is_default_for_newcomers`
- [ ] Seed des 6 planètes existantes
- [ ] Unicité du nom
- [ ] Suppression contrôlée (pas si des astronautes y sont rattachés)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Création planète | 201 + planète en BDD |
| Nom dupliqué | 409 Conflict |
| Suppression planète avec astronautes | 400 avec message |
| Non-admin CRUD | 403 |

---

## F-202 — Modèle Astronaut

**Acceptance Criteria:**
- [ ] CRUD admin + édition profil par le propriétaire
- [ ] Champs : `first_name`, `last_name`, `email`, `photo_url`, `hobbies`, `client`, `planet_id`, `hire_date`, `total_points`
- [ ] Un astronaute peut modifier : `photo_url`, `hobbies`, `client` uniquement
- [ ] Admin peut tout modifier sauf `total_points` (calculé)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Astronaute modifie son profil | 200, champs autorisés mis à jour |
| Astronaute tente de changer `total_points` | Champ ignoré ou 400 |
| Astronaute modifie profil d'un autre | 403 |
| Admin modifie n'importe quel profil | 200 |

---

## F-203 — Modèle Season

**Acceptance Criteria:**
- [ ] CRUD admin
- [ ] Une seule saison `is_active` à la fois (contrainte)
- [ ] Activation d'une saison désactive l'ancienne
- [ ] Clôture : reset des compteurs planète, conservation des points individuels
- [ ] Archivage des trophées de saison

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Activation 2ème saison | Ancienne désactivée |
| 2 saisons actives en même temps | 400 |
| Clôture saison | Points planète = 0, points astronautes conservés |
| Trophées après clôture | Archivés avec `season_id` |

---

## F-204 — Modèle Activity

**Acceptance Criteria:**
- [ ] CRUD admin (`/api/v1/activities`)
- [ ] Champs : `name`, `base_points`, `category`, `is_collaborative`, `allow_multiple_assignees`
- [ ] Catalogue pré-rempli (seed) avec les activités du brief

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

## F-205 — Modèle Grade

**Acceptance Criteria:**
- [ ] CRUD admin
- [ ] Seed des 14 grades (rookie → Fleet Admiral 3 stars)
- [ ] Calcul du grade courant basé sur `total_points`
- [ ] Endpoint `GET /api/v1/astronauts/{id}/grade`

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

## F-206 — Configuration ancienneté

**Acceptance Criteria:**
- [ ] Endpoint admin `PUT /api/v1/config/seniority`
- [ ] Paramètre `points_per_year` (défaut : 50)
- [ ] Calcul : `floor(years_since_hire) × points_per_year`
- [ ] Modifié → recalcul des points d'ancienneté de tous les astronautes

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 3 ans d'ancienneté, 50 pts/an | +150 pts |
| Modification `points_per_year` → 100 | Astronaute à 3 ans → +300 pts |
