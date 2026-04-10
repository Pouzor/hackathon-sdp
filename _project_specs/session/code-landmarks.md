<!--
UPDATE WHEN:
- Adding new entry points or key files
- Introducing new patterns
- Discovering non-obvious behavior
-->

# Code Landmarks

Quick reference to important parts of the codebase.

## Entry Points
| Location | Purpose |
|----------|---------|
| apps/api/src/main.py | FastAPI application entry |
| apps/frontend/src/main.tsx | Frontend React entry |
| apps/backoffice/src/main.tsx | Backoffice React entry |

## Core Business Logic
| Location | Purpose |
|----------|---------|
| apps/api/src/services/ | Logique métier (points, grades, trophées) |
| apps/api/src/api/v1/ | Routes FastAPI versionnées |

## Configuration
| Location | Purpose |
|----------|---------|
| apps/api/src/core/ | Config, sécurité, dépendances communes |
| .env.example | Variables d'environnement à copier |

## Key Patterns
| Pattern | Example Location | Notes |
|---------|------------------|-------|
| Routes → Services → Repos | apps/api/src/ | Pas de logique métier dans les routes |
| Types générés OpenAPI | packages/shared-types/ | Ne jamais écrire les types à la main côté front |

## Testing
| Location | Purpose |
|----------|---------|
| apps/api/tests/ | Tests Python (pytest) |
| apps/frontend/src/**/*.test.tsx | Tests composants (Vitest + RTL) |
| e2e/ | Tests Playwright |

## Gotchas & Non-Obvious Behavior
| Location | Issue | Notes |
|----------|-------|-------|
| JWT claims | astronaut_id + planet_id | L'attribution planète est une donnée métier, pas un rôle |
| Google OAuth | hd claim | Vérifier que le domaine est @eleven-labs.com côté backend |
