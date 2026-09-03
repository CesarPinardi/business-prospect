# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repository root.
- Relevant ADRs under `docs/adr/`.

If these files do not exist, proceed silently. Domain documentation is created lazily when terminology or architectural decisions are resolved.

## File structure

This repository uses a single-context layout:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept, use the term defined in `CONTEXT.md`. Do not drift toward explicitly avoided synonyms.

If a required concept is absent, reconsider the new terminology or record the domain-modeling gap.

## Flag ADR conflicts

Explicitly surface any proposal that contradicts an existing ADR instead of silently overriding it.
