# AGENTS.md

work style: telegraph; noun-phrases ok; drop grammar; min tokens.

> bootstrap context only. discoverable from codebase → don't put here.
> corrections + patterns → LESSONS_LEARNED.md.

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

## Legacy & Deprecated

<!-- codebase parts that actively mislead. add entries only when needed. -->

## Learning System

Every session:
1. start: read `LESSONS_LEARNED.md`
2. during: note surprises
3. end: append `ITERATION_LOG.md`
4. reusable insight? → also add `LESSONS_LEARNED.md`
5. same issue 2+ times in log? → promote to `LESSONS_LEARNED.md`
6. surprise? → flag to developer (they decide: fix codebase / update LESSONS_LEARNED / adjust this file)

| File | Purpose | Write When |
|------|---------|------------|
| `LESSONS_LEARNED.md` | curated wisdom + corrections | reusable insight gained |
| `ITERATION_LOG.md` | raw session journal, append-only | every iteration |

Rules: never delete from ITERATION_LOG. Obsolete lessons → Archive in LESSONS_LEARNED. Date-stamp YYYY-MM-DD. When in doubt: log it.

### Periodic Maintenance
Config files audited periodically via `SETUP_AI_AGENT_CONFIG.md`.
See "Periodic Maintenance Protocol" section.

## Sub-Agents

`.claude/agents/`. Invoke proactively.

| Agent | File | When |
|-------|------|-------------|
| Architect | `.claude/agents/architect.md` | System design, scalability, refactoring |
| Planner | `.claude/agents/planner.md` | Complex multi-step features — plan before coding |
| UX Expert | `.claude/agents/ux-expert.md` | UI components, interaction patterns, accessibility |
| Agent Creator | `.claude/agents/agent-creator.md` | Need a new specialized agent for a recurring task domain |
