# AI Assistance Log (FocusBoard)

This document provides a transparent record of artificial intelligence tools, prompt workflows, and architectural guidance utilized throughout the design, development, and testing of the **FocusBoard** project.

---

## 1. Tools & Models Used

- **AI Assistants:** Google DeepMind Gemini Agent / Antigravity Assistant
- **Primary Model:** Gemini 3.8 Flash (High-precision developer execution)
- **Tool Capabilities Utilized:** Shell command execution, file tree modeling, code refactoring, accessibility and responsive verification.

---

## 2. Representative Prompts

Below are 4 representative prompts utilized during the iterative creation of FocusBoard:

### Prompt 1: Component & Architecture Scaffolding
> *"Design the component hierarchy and data model for a production-grade task dashboard named FocusBoard using React 18, Vite, and plain CSS. Ensure zero external state libraries are used and construct a custom useLocalStorage hook that preserves user-cleared empty states without reverting to sample data."*

### Prompt 2: Accessible Modal Dialog & Focus Trap
> *"Build an accessible modal component for creating and editing tasks (`TaskForm.jsx`) conforming to WCAG 2.1 AA. Implement a focus trap with Shift+Tab support, Escape key dismissal, inline validation for whitespace-only titles, and `aria-invalid` / `aria-describedby` linkage."*

### Prompt 3: Responsive Metrics & Focus Notes Carousel
> *"Create a 4-metric statistics grid and an accessible Focus Notes carousel with circular wrap-around navigation, dot indicators, and keyboard navigation. Ensure that statistics update dynamically upon any task mutation and that the layout transitions smoothly from a 1440px desktop grid to a 768px 2x2 grid and 390px stacked view."*

### Prompt 4: Multi-Criteria Filter Derivation & Empty States
> *"Implement combined AND-logic filtering across real-time title search, status tabs with counters, and a priority select dropdown. Calculate visible tasks purely through `useMemo` without storing filtered results in state, and handle distinct empty states for 'No tasks created' vs 'No tasks match criteria'."*

---

## 3. Key AI-Assisted Areas

1. **State Synchronization & Persistence Safety:**
   - Architecture of the `useLocalStorage` hook with guarded lazy evaluation.
   - Verification that saving `[]` does not trigger the fallback to `sampleTasks.js`.
2. **Accessible Interaction Design (A11y):**
   - Incorporation of WAI-ARIA roles (`role="alertdialog"`, `role="tablist"`, `role="tab"`, `role="carousel"`).
   - Implementation of focus-trapping routines and returning focus to trigger buttons upon modal dismissal.
3. **Pure CSS Responsive System:**
   - Structuring CSS custom properties (`:root`) for cohesive design tokens.
   - Crafting responsive fluid grids (`repeat(auto-fill, minmax(320px, 1fr))`) and media queries preventing horizontal scrolling on mobile viewports down to 390px.
4. **Validation & Edge Case Handling:**
   - Date handling to prevent timezone skew on standard `YYYY-MM-DD` string inputs.
   - Overdue calculation logic based on local midnight comparisons.

---

## 4. Verified or Corrected Suggestion

**Area Examined:** LocalStorage lazy initial state fallback check and empty array retention.

**AI Initial Output / Suggestion:**
The initial suggested implementation evaluated `localStorage.getItem(key)` with `parsed && parsed.length > 0 ? parsed : initialValue`.

**Verification / Correction Applied:**
During rigorous edge-case testing, I observed that checking `parsed.length > 0` caused a user's intentional deletion of all tasks (resulting in an empty backlog `[]`) to be mistakenly overwritten by the initial `sampleTasks` on page refresh. I updated the condition to verify `Array.isArray(parsed)` directly instead of requiring a non-zero length. This guarantees that an empty task list created by the user is faithfully preserved across browser reloads while still gracefully falling back to `sampleTasks` when no previous storage key exists.
