# FocusBoard · Task Management Dashboard

FocusBoard is a responsive, accessible, high-performance task management dashboard crafted with React 18, Vite, and modern CSS. Built with clean software architecture principles, FocusBoard enables individuals and agile teams to manage task lifecycles, monitor progress metrics in real-time, maintain sprint velocity, and absorb deep-work principles via an interactive carousel.

---

## Live Links & Repository

- **Hosted Application (Demo):** [https://focusboard-demo.vercel.app](https://focusboard-demo.vercel.app) *(Replace with your deployment URL)*
- **GitHub Repository:** [https://github.com/sathvikkasanagpttu/focusboard](https://github.com/sathvikkasanagpttu/focusboard)

---

## Tech Stack

- **Core Framework:** React 18.3+ (Functional components, React Hooks)
- **Build Tool:** Vite 5.4+ (Ultra-fast HMR and optimized production bundles)
- **Language:** JavaScript (ES6+ standard)
- **Styling:** Plain CSS with CSS Custom Properties (`:root` design tokens), CSS Grid, and Flexbox
- **Persistence:** Custom `useLocalStorage` hook with automated JSON synchronization and validation
- **Iconography:** `lucide-react` (Lightweight tree-shakeable SVG icons)
- **Zero Redux / Zero External State Libraries / Zero Tailwind:** Strict adherence to vanilla React state and modular CSS.

---

## Features

- **Dynamic Statistics & Progress Tracking:**
  - Real-time aggregation of Total Tasks, In Progress, Completed, and Completion Percentage (`Math.round((completed / total) * 100)`).
  - Animated visual progress bar indicating sprint velocity.
  - Metrics update instantly across all create, edit, delete, and inline status modification actions.
- **Interactive Focus Notes Carousel:**
  - 3 curated productivity slides focused on deep work, time blocking, and the two-minute rule.
  - Circular wrap-around navigation with Next and Previous triggers.
  - Interactive pagination dots with active state indicators and `aria-label`s.
  - Accessible keyboard navigation (`ArrowLeft` and `ArrowRight`) with `aria-roledescription="carousel"` and `aria-live="polite"`.
- **Comprehensive Task Lifecycle Management:**
  - **Create Task:** Accessible modal dialog (sized to 760×822px on desktop, transitioning to a bottom-sheet on mobile). Includes strict validation rejecting whitespace-only titles and missing due dates.
  - **Edit Task:** Instant field pre-population reusing `TaskForm` with strict ID preservation to prevent duplication.
  - **Delete Task:** Destructive confirmation dialog conforming to WAI-ARIA `role="alertdialog"`, complete with focus trapping, Escape cancellation, and focus restoration to the trigger.
  - **Inline Status Updates:** Switch statuses directly on any task card ("To do", "In progress", "Completed") with immediate metric recalculation.
- **Combined Search & Multi-Criteria Filtering:**
  - Case-insensitive real-time title search with a one-click input clear button.
  - Status tab bar (`role="tablist"`) with per-status item counters.
  - Priority dropdown filter ("Low", "Medium", "High").
  - Seamless AND logic combination across search, status, and priority.
  - One-click "Reset filters" trigger.
  - Contextual empty states for zero total tasks vs zero filter matches.
- **Rich Task Presentation:**
  - Two-line description clamping.
  - Semantic category tags (Design, Development, Testing, Research).
  - Priority badges with distinctive visual icons and colors.
  - Due date tracking with automatic overdue alerts if overdue and incomplete.
- **Accessibility & Responsiveness:**
  - Semantic HTML5 structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`).
  - Accessible labels for every interactive input and WCAG AA contrast compliance.
  - Visible `:focus-visible` focus rings.
  - "Skip to main content" link for keyboard navigation.
  - Respect for `prefers-reduced-motion`.
  - Tested across 1440px desktop, 768px tablet, and 390px mobile viewports without horizontal scroll.

---

## Folder Structure

```
focusboard/
  public/
  src/
    assets/
    components/
      ConfirmDialog.jsx
      FilterTabs.jsx
      FocusNotes.jsx
      Header.jsx
      SearchBar.jsx
      Sidebar.jsx
      StatCard.jsx
      TaskCard.jsx
      TaskForm.jsx
      TaskList.jsx
    data/
      sampleTasks.js
    hooks/
      useLocalStorage.js
    App.jsx
    index.css
    main.jsx
  screenshots/
    .gitkeep
  .gitignore
  AI_USAGE.md
  index.html
  package.json
  README.md
  vite.config.js
```

---

## State Management Architecture

FocusBoard purposely eschews heavy third-party state managers like Redux or Zustand in favor of idiomatic React 18 paradigms:

1. **Why `useState` + Custom `useLocalStorage` + `useMemo` Over Redux:**
   - **Reduced Overhead & Zero Boilerplate:** For a client-side productivity dashboard, Redux introduces substantial boilerplate (actions, reducers, dispatchers, store configuration) without tangible architectural benefits.
   - **Single Source of Truth:** The `tasks` array stored in local storage acts as the single primary source of truth.
   - **Derived Data via `useMemo`:** Filtered views, status counts, and statistical aggregates are never duplicated into separate state variables. They are computed dynamically using `useMemo([tasks, searchText, statusFilter, priorityFilter])`. This eliminates out-of-sync bugs, state divergence, and unnecessary re-renders.

2. **How CRUD Operations Update State:**
   - **Create:** Newly created tasks receive a cryptographically unique identifier (`crypto.randomUUID()` with a high-resolution timestamp fallback) and are prepended to the array via functional state updates: `setTasks(prev => [newTask, ...prev])`.
   - **Read:** Retrieved lazily during initial mount.
   - **Update:** When editing task details or toggling status, functional array mapping is utilized: `setTasks(prev => prev.map(t => t.id === targetId ? updated : t))`.
   - **Delete:** Target tasks are purged by filtering: `setTasks(prev => prev.filter(t => t.id !== targetId))`.

3. **How LocalStorage Synchronizes with State:**
   - The `useLocalStorage` hook implements lazy initialization inside `useState(() => ...)`.
   - The stored item is parsed safely within a `try/catch` block. If the key does not exist or corrupted non-array data is found, it falls back to `sampleTasks`.
   - **Preserving User Deletions:** If a user deletes all tasks (resulting in an empty array `[]`), `Array.isArray([])` evaluates to `true`, ensuring the initial sample tasks never overwrite an intentional empty state.
   - A synchronized `useEffect` serializes the current state back into `localStorage` on any modification.

4. **Carousel State Management:**
   - The `FocusNotes` carousel maintains an isolated `currentIndex` integer state.
   - Circular wrap-around is managed via modulo arithmetic: `(prev + 1) % totalSlides` and `(prev - 1 + totalSlides) % totalSlides`.
   - Keyboard listeners on `ArrowLeft` and `ArrowRight` trigger these transitions without polluting parent application state.

---

## Installation, Development & Production Commands

### 1. Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized, tree-shaken static bundle in the `dist/` directory.

### 5. Preview Production Build Locally
```bash
npm run preview
```

---

## Deployment Instructions

### Deploy to Vercel
1. Install Vercel CLI or link through [vercel.com](https://vercel.com).
2. Configure settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Deploy to Netlify
1. Connect repository on [netlify.com](https://netlify.com).
2. Configure build settings:
   - **Base directory:** `/`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

---

## Screenshots

Place your captured desktop (1440×1000), tablet (768×1024), and mobile (390×1128) screenshots in the `screenshots/` directory:

- `screenshots/desktop-1440.png` - Desktop overview with 4-column metric cards and sidebar
- `screenshots/create-task-modal.png` - Task creation modal dialog
- `screenshots/mobile-390.png` - Mobile responsive layout with drawer and stacked task cards

---

## Known Limitations

- **Browser Storage Limits:** `localStorage` is restricted to ~5MB per origin. For large-scale multi-user or enterprise task backlogs, migration to IndexedDB or a persistent remote API (e.g. Supabase, PostgreSQL) would be required.
- **Single-device Scope:** Tasks stored in `localStorage` do not automatically synchronize across different browsers or separate devices without an authenticated cloud backend.
