# EPIC 5 — Front public — Trombinoscope & profils (P1)

⚠️ **Prérequis avant de démarrer :** Demander les assets graphiques (blasons, couleurs, logo, mantras, maquettes).

## F-501 — Page trombinoscope ✅ DONE

**Route:** `/astronauts`

**Implémentation :** `apps/frontend/src/routes/astronauts/AstronautsPage.tsx`

**Acceptance Criteria:**
- [x] Grille des astronautes (photo/initiales, prénom, nom, planète)
- [x] Recherche par nom (debounced)
- [x] Filtre par planète (dropdown)
- [x] État vide si aucun résultat
- [ ] Pagination — scroll infini non implémenté (acceptable MVP)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Recherche "dupont" | Seuls les "dupont" affichés |
| Filtre planète "Mars" | Seuls les astronautes Mars |
| 0 résultat | Message "Aucun astronaute trouvé" |
| Scroll infini | Page suivante chargée |

---

## F-502 — Page profil astronaute (consultation) ✅ DONE

**Route:** `/astronauts/:id`

**Implémentation :** `apps/frontend/src/routes/astronauts/AstronautProfilePage.tsx`

**Acceptance Criteria:**
- [x] Infos : photo/initiales, prénom/nom, email, planète, hire_date
- [x] Total points + grade courant
- [x] Historique des contributions (React Query)
- [x] Profil inexistant → page 404 dédiée
- [ ] Section trophées (dépend de F-403)
- [ ] Pagination contributions (à implémenter)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Profil existant | Toutes les sections chargées |
| `/astronauts/9999` | Page 404 |
| Historique > 10 | Pagination présente |

---

## F-503 — Édition de son propre profil ✅ DONE

**Route:** `/profile/edit`

**Implémentation :**
- `apps/frontend/src/routes/profile/ProfileEditPage.tsx`
- `apps/frontend/src/api/astronauts.ts` — `useUpdateProfile()`
- PR #8 mergée le 2026-04-12

**Acceptance Criteria:**
- [x] Formulaire avec `photo_url`, `hobbies`, `client` uniquement
- [x] Champs `email`, `planet_id`, `total_points` absents du formulaire
- [x] Validation Zod
- [x] Feedback erreur (message d'erreur API affiché)
- [x] Redirect vers profil après succès
- [x] Route protégée (nécessite auth)

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
