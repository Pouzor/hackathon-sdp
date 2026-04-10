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

## F-504 — Page détail planète

**Route:** `/planets/:id`

**Acceptance Criteria:**
- [ ] Header : blason, nom, mantra, couleur de fond, total points saison courante
- [ ] Liste des astronautes membres (photos + noms)
- [ ] Historique des trophées (F-404)
- [ ] Timeline des activités et points gagnés (triée par date desc)
- [ ] Total points recalculé dynamiquement (React Query polling ou invalidation)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Page planète | Tous les blocs présents |
| Attribution de points en arrière-plan | Total mis à jour sans reload |
| Planète inexistante | 404 |

---

## F-505 — Page classement / scoreboard

**Route:** `/` ou `/scoreboard`

**Acceptance Criteria:**
- [ ] Classement des 4 planètes `is_competing = true` uniquement
- [ ] Points de la saison active (pas les points totaux)
- [ ] Mise à jour par polling React Query (30s en MVP)
- [ ] Planètes hors compétition absentes du classement

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 4 planètes en compétition | 4 lignes, triées desc |
| Planète "Nouveaux arrivants" | Absente du classement |
| Après attribution de points | Position mise à jour au prochain poll |
