# EPIC 5 — Front public — Trombinoscope & profils (P1)

⚠️ **Prérequis avant de démarrer :** Demander les assets graphiques (blasons, couleurs, logo, mantras, maquettes).

## F-501 — Page trombinoscope

**Route:** `/astronauts`

**Acceptance Criteria:**
- [ ] Grille des astronautes (photo, prénom, nom, planète)
- [ ] Recherche par nom (debounced)
- [ ] Filtre par planète (dropdown)
- [ ] Pagination (20 par page) ou scroll infini
- [ ] État vide si aucun résultat

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Recherche "dupont" | Seuls les "dupont" affichés |
| Filtre planète "Mars" | Seuls les astronautes Mars |
| 0 résultat | Message "Aucun astronaute trouvé" |
| Scroll infini | Page suivante chargée |

---

## F-502 — Page profil astronaute (consultation)

**Route:** `/astronauts/:id`

**Acceptance Criteria:**
- [ ] Infos : photo, prénom/nom, email, planète, hire_date
- [ ] Total points + grade courant avec icône
- [ ] Historique des contributions (paginé, 10 par page)
- [ ] Section trophées (F-403)
- [ ] Lien vers la page de sa planète
- [ ] Profil inexistant → 404

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Profil existant | Toutes les sections chargées |
| `/astronauts/9999` | Page 404 |
| Historique > 10 | Pagination présente |

---

## F-503 — Édition de son propre profil

**Route:** `/profile/edit`

**Acceptance Criteria:**
- [ ] Formulaire avec `photo_url`, `hobbies`, `client` uniquement
- [ ] Champs `email`, `planet_id`, `total_points` absents du formulaire
- [ ] Validation Zod
- [ ] Feedback succès/erreur

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Modification hobbies | Mis à jour en BDD et affiché |
| Tentative PUT avec `total_points` | Champ ignoré par l'API |
| Accès à `/profile/edit` sans auth | Redirect vers /login |

---

## F-504 — Page détail planète ✅ DONE (mock front-only)

**Route:** overlay depuis la homepage (clic sur la planète)

**Implémentation :**
- `apps/frontend/src/components/features/planet-detail/PlanetDetail.tsx`
- `apps/frontend/src/components/features/planet-detail/mockData.ts`

**Acceptance Criteria:**
- [x] Blason + planète 3D animée (pulse), couleur, total points saison
- [x] Liste des astronautes membres (triée par points, grade affiché)
- [x] Historique des trophées (icône, description, date)
- [x] Timeline des contributions (astronaute, activité, points, bonus)
- [x] Onglet contributions ouvert par défaut
- [ ] Connecter à l'API (remplacer mockData par React Query hooks)
- [ ] Total points recalculé dynamiquement (React Query polling)
- [ ] Planète inexistante → 404

---

## F-505 — Page classement / scoreboard ✅ DONE (mock front-only, widget homepage)

**Implémentation :** widget `Leaderboard` dans `apps/frontend/src/routes/home/HomePage.tsx`

**Acceptance Criteria:**
- [x] 4 planètes `is_competing = true` triées par score, barres de progression
- [x] Total saison en footer du widget
- [ ] Pas de page dédiée `/scoreboard` pour l'instant (acceptable MVP)
- [ ] Connecter à l'API (React Query, polling 30s)
