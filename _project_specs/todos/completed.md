# Completed

Done items for reference. Move here from active.md when complete.

---

## [2026-04-11] Trombinoscope + profil astronaute (F-501, F-502 mock)
- AstronautsPage : grille avec recherche, filtres planète, blason oversized en fond des cards
- AstronautProfilePage : fiche complète (grade, points, ancienneté, hobbies, contributions, trophées), blason oversized en fond de page
- 12 astronautes mock sur 5 planètes, routing React Router

## [2026-04-11] Homepage système solaire (F-505 mock)
- Système solaire 3D avec perspective, animations orbitales, planètes billboard
- Composants planète custom (PNGs SchizoCats/Donut/Duck, SVG Raccoon/HQ/Soleil)
- StarField canvas, ceinture d'astéroïdes, soleil SVG avec corona
- NavBar (Astronautes, Mon Profil, compteur Mes Points) glassmorphisme
- Leaderboard widget gauche avec classement et barres de progression

## [2026-04-11] Page détail planète (F-504 mock)
- Overlay clic planète : panneau gauche (blason + planète 3D pulsante) + panneau droit (tabs)
- Onglet contributions par défaut, membres, trophées
- Données mock dans `mockData.ts`
- Transitions CSS (fade + translateX) sur sélection/fermeture

## [2026-04-11] Backend EPIC 2+3 (F-201 à F-306)
- Modèles Planet, Astronaut, Season, Activity, Grade, PointAttribution
- Endpoints CRUD + attribution de points
- Règles métier : multiplicateur 1ère contribution ever, bonus 1ère saison, ancienneté
