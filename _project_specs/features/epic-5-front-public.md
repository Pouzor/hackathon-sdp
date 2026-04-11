# EPIC 5 — Front public — Trombinoscope & profils (P1)

⚠️ **Prérequis avant de démarrer :** Demander les assets graphiques (blasons, couleurs, logo, mantras, maquettes).

## F-501 — Page trombinoscope ✅ DONE (mock front-only)

**Route:** `/astronauts`

**Implémentation :** `apps/frontend/src/routes/astronauts/AstronautsPage.tsx`

**Acceptance Criteria:**
- [x] Grille des astronautes (initiales colorées, nom, grade, points)
- [x] Recherche par nom (temps réel)
- [x] Filtre par planète (tabs avec point coloré)
- [x] État vide si aucun résultat
- [x] Blason planète en fond oversized sur chaque card
- [ ] Connecter à l'API (React Query)
- [ ] Pagination si > 20 résultats

---

## F-502 — Page profil astronaute ✅ DONE (mock front-only)

**Route:** `/astronauts/:id`

**Implémentation :** `apps/frontend/src/routes/astronauts/AstronautProfilePage.tsx`

**Acceptance Criteria:**
- [x] Hero : initiales, nom, email, badges planète + grade + ancienneté
- [x] Stats : total points, contributions, trophées, client
- [x] Hobbies
- [x] Historique des contributions (tab)
- [x] Trophées (tab)
- [x] Page 404 si ID inconnu
- [x] Blason planète oversized en fond de page
- [ ] Connecter à l'API (React Query)
- [ ] Lien cliquable vers la planète

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
