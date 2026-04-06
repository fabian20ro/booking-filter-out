## 2024-05-24 - Interactive Hover Menus Need Focus States
**Learning:** Pure CSS or mouse-only event hover states (`mouseenter`/`mouseleave`) are completely inaccessible to keyboard users, preventing them from interacting with or reading crucial supplementary information (like the saved hotel list).
**Action:** When adding supplementary UI elements that appear on hover, always add parallel `focus` and `blur` event listeners to make them keyboard accessible. Ensure `blur` correctly hides the element when focus is lost.

## 2024-05-24 - Dynamic DOM Insertions Need ARIA Live
**Learning:** Dynamically created message boxes (like toast notifications) are visually obvious but completely invisible to screen readers unless specifically marked.
**Action:** For simple status messages that appear and disappear dynamically, always set `role="status"` and `aria-live="polite"` so screen readers will announce them without aggressively interrupting the user's current flow.
