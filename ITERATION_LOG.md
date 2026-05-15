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

### [2026-05-15] Hover-list visibility state sync

**Context:** Keep the saved hotel list toggle aligned across click, hover, and keyboard access.
**What happened:** Reworked the saved-list toggle in content.js and bookmarklet.js to derive visibility from the DOM state, added aria-expanded / aria-hidden updates, and removed the stale bookmarklet boolean state.
**Outcome:** Success
**Insight:** When the same panel is controlled by multiple interactions, a separate visibility flag can drift unless every hide path updates it.
**Promoted to Lessons Learned:** Yes

---

### [2026-05-13] README action label parity

**Context:** Keep the README quickstart aligned with the live toolbar action labels.
**What happened:** Updated the README step from "Exclude added hotels" to "Toggle dimming" so the docs match the actual button name.
**Outcome:** Success
**Insight:** User-facing docs should mirror the exact action label, not a paraphrase.
**Promoted to Lessons Learned:** No

---
### [2026-05-14] README action label sync

**Context:** Keep the README quickstart aligned with the exact toolbar labels shown in the UI.
**What happened:** Updated the README quickstart to use the literal action names: Add visible hotels, Toggle dimming, Copy non-excluded hotels, and Clear hotel filter list.
**Outcome:** Success
**Insight:** Quickstart copy should mirror the exact UI labels, not leftover shorthand.
**Promoted to Lessons Learned:** No

---
### [2026-05-14] Saved-count badge parity

**Context:** Make the desktop extension easier to use without relying only on the hover trigger.
**What happened:** Added click-to-toggle behavior for the saved-count badge in content.js, matched the affordance in the desktop styling, and documented the interaction in the README for both extension and mobile use.
**Outcome:** Success
**Insight:** When a count badge already exposes useful state, making it interactive on every surface reduces hunting for the saved list.
**Promoted to Lessons Learned:** Yes

---
### [2026-05-14] Keyboard access for saved-count badge

**Context:** Keep the saved-count badge interaction usable for keyboard users, not just pointer users.
**What happened:** Added tabindex + Enter/Space handling to the saved-count badge in content.js and bookmarklet.js, and added matching focus-visible styling in style.css and the bookmarklet inline CSS.
**Outcome:** Success
**Insight:** If a live status badge opens the saved list, it should act like a reachable control too.
**Promoted to Lessons Learned:** Yes

---
<!-- New entries above this line, most recent first -->
---
### [2026-05-14] Saved-count live region sync

**Context:** Improve accessibility for the saved-count badge in both the extension panel and bookmarklet toolbar.
**What happened:** Added `role=status`, `aria-live=polite`, and `aria-atomic=true` to the shared `hotel-list-status` element in content.js and bookmarklet.js so count changes can be announced.
**Outcome:** Success
**Insight:** Count badges that change after actions should be live regions on both surfaces, not just visually updated text.
**Promoted to Lessons Learned:** Yes

---
### [2026-05-13] Safe saved-name rendering

**Context:** Reduce the risk of HTML injection in the saved hotel-name hover list.
**What happened:** Updated content.js and bookmarklet.js so the saved-name list is built with DOM nodes and `textContent` instead of raw `innerHTML`.
**Outcome:** Success
**Insight:** Treat hotel names as untrusted input even when they come from the page you are filtering.
**Promoted to Lessons Learned:** Yes

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
