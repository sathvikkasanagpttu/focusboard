# FocusBoard · Modern Task Management Dashboard

FocusBoard is an enterprise-grade, accessible, and responsive task management application built with **React 18**, **Vite**, and **vanilla CSS**. Designed with clean software architecture principles, FocusBoard enables agile teams and professionals to organize task lifecycles, track sprint velocity, analyze workload distribution, and maintain peak focus.

---

## Repository

- **GitHub Repository:** [https://github.com/sathvikkasanagpttu/focusboard](https://github.com/sathvikkasanagpttu/focusboard)

---

## Architecture & Technology Stack

| Layer | Technology | Key Capabilities & Highlights |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18.3+** | Functional components, custom hooks, `useMemo` derived computations |
| **Build & Bundler** | **Vite 5.4+** | Sub-second HMR, tree-shaking, optimized ES module production output |
| **Routing** | **Hash-Based Client Router** | Lightweight `useHashView` hook; zero external router dependencies |
| **Styling & Theming** | **Modern Vanilla CSS** | CSS Custom Properties (`:root` & `[data-theme="dark"]`), Grid, Flexbox |
| **State Persistence** | **Browser LocalStorage** | Resilient `useLocalStorage` hook with empty-backlog retention |
| **Iconography** | **Lucide React** | Semantic, tree-shakeable SVG icons |
| **Accessibility (A11y)**| **WCAG 2.1 AA Compliant** | WAI-ARIA roles, keyboard navigation, focus trapping, skip link |

> **Zero External State Dependencies:** FocusBoard strictly uses React 18 built-in primitives (`useState`, `useMemo`, `useCallback`, `useEffect`) and custom hooks—avoiding heavy state libraries (Redux, Zustand) or CSS utility frameworks (Tailwind).

---

## Multi-View Workspace

FocusBoard features five dedicated workspace views, all synchronized with the URL hash (`#dashboard`, `#tasks`, `#calendar`, `#analytics`, `#settings`) and powered by a single shared source of truth.

```
                    ┌───────────────────────────────┐
                    │     App.jsx (tasks State)     │
                    │   localStorage Synchronization │
                    └───────────────┬───────────────┘
                                    │
       ┌──────────────┬─────────────┼─────────────┬──────────────┐
       ▼              ▼             ▼             ▼              ▼
┌──────────────┐┌───────────┐┌─────────────┐┌───────────┐┌──────────────┐
│  Dashboard   ││ All Tasks ││  Calendar   ││ Analytics ││   Settings   │
│ 4 KPI Cards  ││ Sortable  ││ Month Grid  ││ SVG Donut ││ Profile Edit │
│ Focus Notes  ││ Data Table││ Task Chips  ││ H/V Bars  ││ Light / Dark │
│ Work Items   ││ Responsive││ Agenda Mode ││ Table Alt ││ Data Backup  │
└──────────────┘└───────────┘└─────────────┘└───────────┘└──────────────┘
```

### 1. Dashboard View (`#dashboard`)
- **Dynamic KPI Cards:** Instant computation of *Total Tasks*, *In Progress*, *Completed*, and *Completion Rate* ($\frac{\text{Completed}}{\text{Total}} \times 100$) with animated velocity progress bars and zero-division guards.
- **Focus Notes Carousel:** Accessible 3-slide productivity guide featuring circular wrap-around navigation, dot indicators, and keyboard arrow controls.
- **Work Items Catalog:** Responsive card grid equipped with case-insensitive search, status tab filters, and priority filtering.

### 2. All Tasks View (`#tasks`)
- **Full-Width Data Table:** Structured columns for *Task Title*, *Category*, *Priority*, *Status*, *Due Date*, and *Actions*.
- **Multi-Field Sorting:** Real-time sorting by *Due Date (Earliest / Latest)*, *Priority (High to Low)*, and *Title (A–Z)*.
- **Inline Status Modification:** Change any task's status directly from the table or card dropdown.
- **Mobile Adaptive Cards:** Automatically collapses into high-density stacked cards on mobile viewports ($\le 768\text{px}$) with zero horizontal scrolling.

### 3. Schedule & Deadlines Calendar (`#calendar`)
- **Custom Month Grid:** Hand-crafted calendar grid matrix featuring *Previous Month*, *Next Month*, and a *Today* jump button.
- **Status-Colored Task Chips:** Categorized task chips displaying status icons (Clock, AlertCircle, CheckCircle2) with `+N more` overflow badges.
- **Direct Task Scheduling:** Click any task chip to open the Edit modal; click an empty calendar cell to open the Add Task dialog pre-filled with that date.
- **Overdue Detection:** Visual alert badges for uncompleted tasks with past due dates.
- **Mobile Agenda View:** Transitions to a chronological, date-grouped Agenda layout on tablet and mobile viewports.

### 4. Workspace Analytics (`#analytics`)
- **100% Derived Calculations:** Zero hardcoded statistics—all metrics are computed on the fly using `useMemo`.
- **SVG Donut Chart:** High-precision SVG circular distribution of tasks by status with centered metrics and legend breakdown.
- **Priority Urgency Bar Chart:** Horizontal distribution chart mapping backlog load across High, Medium, and Low priorities.
- **Domain Workload Chart:** Vertical bar chart highlighting workload across Design, Development, Testing, and Research.
- **Executive KPI Row:** Tracks Completion %, Overdue Count, Due This Week, and Average Tasks per Domain.
- **Accessible Table Alternative:** "View as Table" toggle providing full tabular data for screen reader users.

### 5. Workspace Settings (`#settings`)
- **Profile Customization:** Edit Display Name and Title (persisted under `focusboard_profile`), dynamically updating Header avatar initials and titles across the workspace.
- **Dual Theme Engine:** Instant Light / Dark mode toggle applying semantic CSS variables via the `data-theme` attribute on `<html>` (persisted under `focusboard_theme`).
- **Data Export & Portability:** One-click JSON backup export (`focusboard-tasks-YYYY-MM-DD.json`).
- **Lifecycle Safety Controls:** "Reset to Sample Data" and "Clear All Tasks" protected by accessible confirmation alert dialogs.

---

## Directory Structure

```text
FocusBoard/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── views/
│   │   │   ├── AllTasksView.jsx    # Full-width sortable table & mobile cards
│   │   │   ├── AnalyticsView.jsx   # SVG charts, KPI metrics & table alternative
│   │   │   ├── CalendarView.jsx    # Month grid matrix & mobile agenda view
│   │   │   ├── DashboardView.jsx   # KPI cards, carousel & work items catalog
│   │   │   └── SettingsView.jsx    # Profile, dark/light theme & data management
│   │   ├── ConfirmDialog.jsx       # WAI-ARIA alertdialog with focus trap
│   │   ├── FilterTabs.jsx          # Status filter tabs with dynamic item counters
│   │   ├── FocusNotes.jsx          # 3-slide productivity principle carousel
│   │   ├── Header.jsx              # View-sensitive breadcrumbs & profile avatar
│   │   ├── SearchBar.jsx           # Case-insensitive title search & clear button
│   │   ├── Sidebar.jsx             # Accessible nav links with mobile drawer
│   │   ├── StatCard.jsx            # Reusable metric card with progress bar
│   │   ├── TaskCard.jsx            # Card component with badges & inline status
│   │   ├── TaskForm.jsx            # Modal dialog for creating and editing tasks
│   │   └── TaskList.jsx            # Task grid with dual-scenario empty states
│   ├── data/
│   │   └── sampleTasks.js          # 8 diverse sample tasks across all statuses
│   ├── hooks/
│   │   ├── useHashView.js          # Hash routing & browser history synchronization
│   │   └── useLocalStorage.js      # Robust localStorage persistence hook
│   ├── utils/
│   │   ├── dateUtils.js            # Zero-timezone date parsing, grid & overdue logic
│   │   └── taskStats.js            # Pure aggregation helper for KPI calculations
│   ├── App.jsx                     # Core application orchestrator & shared state
│   ├── index.css                   # Master design system & [data-theme="dark"] tokens
│   └── main.jsx                    # React 18 createRoot application entry
├── screenshots/                    # Viewport and feature reference captures
├── .gitignore                      # Git exclusion rules
├── AI_USAGE.md                     # Transparent AI usage and verification log
├── index.html                      # HTML entry with Plus Jakarta Sans & favicon
├── package.json                    # Application metadata and dependencies
└── vite.config.js                  # Vite configuration
```

---

## Getting Started

### Prerequisites
- **Node.js:** `18.x` or higher
- **npm:** `9.x` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/sathvikkasanagpttu/focusboard.git
cd focusboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, tree-shaken static production bundle in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## State Management & Persistence Logic

1. **Single Source of Truth:**
   The `tasks` array maintained in `App.jsx` acts as the single primary data store. Changes made in the *Table view*, *Calendar view*, or *Dashboard* update the identical state reference, ensuring seamless synchronization without redundant state copies.

2. **Derived Data Computation:**
   Filtered tasks, sort orders, status counters, and analytics aggregates are never held in secondary state. Instead, they are derived via `useMemo`:
   ```javascript
   const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);
   ```
   This guarantees complete immunity from desynchronization bugs and eliminates unnecessary re-renders.

3. **Empty-State Retention:**
   The `useLocalStorage` hook verifies array validity using `Array.isArray(parsed)`. If a user intentionally deletes all tasks, the empty backlog `[]` is preserved rather than being mistakenly overwritten by sample data on page reload.

---

## Accessibility (A11y) & Responsive Standards

- **Keyboard Trapping & Restoration:** Both `TaskForm` and `ConfirmDialog` constrain keyboard Tab navigation within the active modal and return focus to the originating trigger upon closure.
- **Semantic Structure:** Constructed with `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and standard table semantics (`<thead>`, `<tbody>`, `<th>`, `<td>`).
- **ARIA Declarations:** Features `role="alertdialog"`, `role="tablist"`, `role="tab"`, `role="grid"`, `role="gridcell"`, and `role="carousel"`.
- **Responsive Fluidity:** Carefully crafted breakpoints for **1440px (Desktop)**, **768px (Tablet)**, and **390px (Mobile)** guarantee full touch-target usability ($\ge 44\text{px}$) with no horizontal page scroll.
- **Motion Sensitivity:** Enforces `@media (prefers-reduced-motion: reduce)` to disable non-essential animations for users with motion sensitivities.

---

## License

This project is developed for assignment and demonstration purposes under the [MIT License](LICENSE).
