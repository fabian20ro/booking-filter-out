# Iteration Log

> Append-only journal of AI agent work sessions.
> **Add an entry at the end of every iteration.**
> Same issue 2+ times? Promote to `LESSONS_LEARNED.md`.

## Entry Format

---

### [YYYY-MM-DD] Brief Description

**Context:** What was the goal
**What happened:** Key actions, decisions
**Outcome:** Success / partial / failure
**Insight:** (optional) What would you tell the next agent?
**Promoted to Lessons Learned:** Yes / No

---

### [2026-05-13] README action label parity

**Context:** Keep the README quickstart aligned with the live toolbar action labels.
**What happened:** Updated the README step from "Exclude added hotels" to "Toggle dimming" so the docs match the actual button name.
**Outcome:** Success
**Insight:** User-facing docs should mirror the exact action label, not a paraphrase.
**Promoted to Lessons Learned:** No

---
<!-- New entries above this line, most recent first -->
---

### [2026-05-13] Mobile install label parity

**Context:** Keep the mobile install page aligned with the live bookmarklet toolbar labels.
**What happened:** Updated the mobile usage grid so it now says "Toggle dimming" and "Clear hotel filter list" instead of paraphrases.
**Outcome:** Success
**Insight:** Preview text should mirror the exact action labels users will tap.
**Promoted to Lessons Learned:** Yes

---

### [2026-05-12] Explicit no-op clear feedback

**Context:** Make the clear-list action say when there was nothing to clear.
**What happened:** Updated content.js and bookmarklet.js so "Clear hotel filter list" now reports "Hotel filter list was already empty." when the saved list is empty, instead of always claiming a clear happened.
**Outcome:** Success
**Insight:** Keep idempotent actions honest in both surfaces.
**Promoted to Lessons Learned:** No

---

### [2026-05-12] Mobile label sync

**Context:** Align mobile install page labels with the extension buttons.
**What happened:** Updated the mobile usage grid to say "Add visible hotels" and "Copy non-excluded hotels" so it matches the toolbar actions.
**Outcome:** Success
**Insight:** Keep visible action labels exact across surfaces.
**Promoted to Lessons Learned:** No

---
2026-05-12 | Bookmarklet sync: aligned mobile labels/messages with the extension for add/copy/clear actions and kept return shape consistent.
2026-05-12 | Docs sync: README extension quickstart now mentions the Copy non-excluded hotels action.
2026-05-11 | UX polish: show explicit no-op message when "Add visible hotels" finds no new names; kept content.js and bookmarklet.js in sync.
2026-05-05 | Refactor: shared core pattern in content.js + bookmarklet.js; Firefox MV3 support via gecko settings in manifest; README install steps updated.
