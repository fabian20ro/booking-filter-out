# Lessons Learned

> Maintained by AI agents. Contains validated, reusable insights.
> **Read at the start of every task. Update at the end of every iteration.**

## How to Use This File

### Reading (Start of Every Task)
Read this before writing any code to avoid repeating known mistakes.

### Writing (End of Every Iteration)
If a new reusable insight was gained, add it to the appropriate category.

### Promotion from Iteration Log
Patterns appearing 2+ times in `ITERATION_LOG.md` should be promoted here.

### Pruning
Obsolete lessons → Archive section at bottom (with date and reason). Never delete.

---

## Booking.com DOM Structure

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Browser Compatibility

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Bookmarklet Constraints

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Extension Behavior

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

**[2026-05-12] README action inventory** — Keep the extension quickstart aligned with the actual toolbar buttons; if the UI gains a button like "Copy non-excluded hotels", the README should name it explicitly.

**[2026-05-12] Mobile/desktop UI parity** — When content.js and bookmarklet.js share an action, mirror the exact user-visible button labels and success messages so the desktop extension and bookmarklet stay consistent.

**[2026-05-13] Mobile install labels** — The mobile install page should use the exact toolbar action labels, not paraphrases, so the preview matches the live bookmarklet UI.

**[2026-05-13] External names as text nodes** — Hotel names come from Booking.com and should be rendered with `textContent` in saved-name lists; avoid `innerHTML` so the hover list stays safe and markup-neutral.

## Deployment

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Code Patterns & Pitfalls

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

**[2026-05-11] Explicit no-op feedback** — For idempotent save actions, a success message like "Saved 0 items" reads like a bug; show a dedicated no-op message instead.

---

## Archive

<!-- Format: **[YYYY-MM-DD] Archived [YYYY-MM-DD]** Title — Reason for archival -->
