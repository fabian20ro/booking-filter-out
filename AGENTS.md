# AGENTS.md

> This file provides non-discoverable bootstrap context.
> If the model can find it in the codebase, it does not belong here.
> For corrections and patterns, see LESSONS_LEARNED.md.

## Constraints

- **Zero dependencies, zero tooling — intentional.** No package manager, no bundler, no transpiler, no test framework, no linter. Do not add any.
- **bookmarklet.js must be ES5.** No arrow functions, no `const`/`let`, no template literals, no destructuring. It runs in bookmarklet execution contexts on older mobile browsers.
- **bookmarklet.js must be fully self-contained.** It inlines its own CSS and cannot reference external files.
- **content.js and bookmarklet.js must stay functionally in sync.** They implement the same feature for two platforms (extension vs. mobile). Changes to one likely require matching changes to the other.
- **GitHub Pages deploys repo root.** `deploy.yml` uploads `path: .` — every file in root is publicly served. Do not add files to root unless they should be public web assets.
- **DOM selectors are fragile.** `[data-testid="property-card"]` and `[data-testid="title"]` are Booking.com internals that may change without notice.

## Files to Update Together

| Change | Files |
|--------|-------|
| Filter logic | `content.js`, `bookmarklet.js` |
| UI/panel styling | `style.css` (extension), inline CSS in `bookmarklet.js` (mobile) |
| New Booking.com selectors | `content.js`, `bookmarklet.js` |

## Shared State

- localStorage key `animalFriendlyList` (JSON array of hotel name strings). Both `content.js` and `bookmarklet.js` read/write this key.

## Learning System

This project uses a persistent learning system. Follow this workflow every session:

1. **Start of task:** Read `LESSONS_LEARNED.md` — it contains validated corrections and patterns
2. **During work:** Note any surprises or non-obvious discoveries
3. **End of iteration:** Append to `ITERATION_LOG.md` with what happened
4. **If insight is reusable and validated:** Also add to `LESSONS_LEARNED.md`
5. **If same issue appears 2+ times in log:** Promote to `LESSONS_LEARNED.md`
6. **If something surprised you:** Flag it to the developer

| File | Purpose | When to Write |
|------|---------|---------------|
| `LESSONS_LEARNED.md` | Curated, validated wisdom and corrections | When insight is reusable |
| `ITERATION_LOG.md` | Raw session journal (append-only, never delete) | Every iteration (always) |

Rules: Never delete from ITERATION_LOG. Obsolete lessons → Archive section in LESSONS_LEARNED (not deleted). Date-stamp everything YYYY-MM-DD.

### Periodic Maintenance
This project's config files are audited periodically using `SETUP_AI_AGENT_CONFIG.md`.
See that document's "Periodic Maintenance Protocol" section for the full audit procedure.

## Sub-Agents

Specialized agents in `.claude/agents/`. Invoke proactively — don't wait to be asked.

| Agent | File | Invoke When |
|-------|------|-------------|
| Architect | `.claude/agents/architect.md` | System design, scalability, refactoring |
| Planner | `.claude/agents/planner.md` | Complex multi-step features — plan before coding |
| UX Expert | `.claude/agents/ux-expert.md` | UI components, interaction patterns, accessibility |
| Agent Creator | `.claude/agents/agent-creator.md` | Need a new specialized agent for a recurring task domain |
