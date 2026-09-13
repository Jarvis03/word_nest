# Domain docs

This is a single-context repository. Engineering skills should use the following domain documentation when it exists.

## Before exploring

- Read `CONTEXT.md` at the repository root for the project's domain language.
- Read relevant architectural decisions under `docs/adr/`.
- If either location does not yet exist, proceed silently. Domain documentation is created when terms or decisions are actually resolved.

## Use the project's vocabulary

When naming a domain concept in an issue, proposal, hypothesis, or test, use the term defined in `CONTEXT.md`. Do not substitute a synonym that the glossary explicitly avoids.

If a needed concept is missing, first reconsider whether it already has a project term. Otherwise note the gap for a future domain-documentation session.

## Flag ADR conflicts

If proposed work contradicts an existing ADR, surface the conflict explicitly instead of silently overriding the decision.
