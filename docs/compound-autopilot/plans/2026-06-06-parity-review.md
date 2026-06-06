# Plan: Full Parity Audit (Bookmarklet vs. Extension)

**Goal:** Ensure 100% functional and interaction parity between `bookmarklet.js` and `content.js` to comply with the "must stay functionally in sync" requirement in `AGENTS.md`.

## Context
Current posture is `feature-ready`. The project focuses heavily on parity between mobile (bookmarklet) and desktop (extension) surfaces.

## Implementation Units

### Tier 0: Core Logic Parity
- [ ] Compare `getSavedList`, `setSavedList`, `getVisibleHotelNames`, `mergeSavedWithVisible`, `toggleDimSavedHotels`, `clearSavedList`, and `getNonExcludedVisibleHotels` between `bookmarklet.js` and `content.js`.
- [ ] Verify `STORAGE_KEY` and `SELECTORS` are identical.
- [ ] Verification: Diff check of logic flows.

### Tier 1: UI & Control Parity
- [ ] Compare button configurations (labels, icons, IDs) in both files.
- [ ] Verify `createButton` implementation vs manual element creation.
- [ ] Check styling consistency (CSS classes/styles in `bookmarklet.js` vs `content.js` and `style.css`).
- [0] Verification: Visual/Textual comparison of config objects.

### Tier 2: Interaction & Accessibility Parity
- [ ] Check event listeners: `click`, `mouseenter`, `focus`, `blur`, `mouseleave`, `keydown` (Enter/Space).
- [ ] Verify ARIA attributes: `role`, `aria-live`, `aria-atomic`, `aria-controls`, `aria-expanded`, `aria-hidden`, `aria-label`, `tabindex`.
- [ [Verification: Event handler mapping check.

### Tier 3: Resilience & Error Handling Parity
- [ ] Check `showMessage` / `fallbackCopy` logic and parity.
- [ ] Verify `updateHotelListCount` and list rendering logic.
- [ [Verification: Code flow comparison for edge cases (e.g., empty lists).

## Expected Files Modified
- None (Read-only review).

## Risk
- Low. This is a review-only task.
