<!--
LOG DECISIONS WHEN:
- Choosing between architectural approaches
- Selecting libraries or tools
- Making security-related choices
- Deviating from standard patterns

This is append-only. Never delete entries.
-->

# Decision Log

Track key architectural and implementation decisions.

## Format
```
## [YYYY-MM-DD] Decision Title

**Decision**: What was decided
**Context**: Why this decision was needed
**Options Considered**: What alternatives existed
**Choice**: Which option was chosen
**Reasoning**: Why this choice was made
**Trade-offs**: What we gave up
**References**: Related code/docs
```

---

## [2026-04-10] Architecture Monorepo

**Decision**: Monorepo avec trois apps (api, frontend, backoffice) + packages/shared-types
**Context**: Projet interne avec backend Python et deux frontends React partageant des types
**Options Considered**: Multi-repo séparés, monorepo
**Choice**: Monorepo
**Reasoning**: Partage de types TypeScript générés depuis OpenAPI, cohérence des versions, CI unifiée
**Trade-offs**: Complexité de build légèrement plus élevée
**References**: CLAUDE.md section 2
