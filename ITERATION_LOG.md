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

<!-- New entries above this line, most recent first -->
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
