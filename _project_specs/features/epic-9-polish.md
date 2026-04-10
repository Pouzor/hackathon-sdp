# EPIC 9 — Polish & accessibilité (P3)

## F-901 — Responsive mobile
- Adaptation mobile des deux fronts
- Tests visuels Playwright sur viewport mobile (375px)

## F-902 — Accessibilité (a11y)
- Conformité WCAG AA basique : contrastes, alt text, aria-labels, navigation clavier
- `axe-core` intégré dans les tests Playwright

## F-903 — Mode sombre
- Toggle dark/light côté front public
- Persistance via `localStorage`

## F-904 — Notifications in-app
- Toast lors d'événements : attribution reçue, trophée gagné
- Dismiss manuel ou auto (5s)

## F-905 — Export CSV
- Export historique points, classement saison
- Format : `astronaut_name,planet,activity,points,date`
