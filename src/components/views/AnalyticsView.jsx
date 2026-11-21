import React, { useState, useMemo } from 'react';
import { calculateTaskStats } from '../../utils/taskStats';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  Table,
  Plus,
  CheckSquare
} from 'lucide-react';

const STATUS_COLORS = {
  'To do': '#f59e0b',
  'In progress': '#4f46e5',
  Completed: '#10b981'
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#64748b'
};

const CATEGORY_COLORS = {
  Design: '#8b5cf6',
  Development: '#3b82f6',
  Testing: '#f97316',
  Research: '#14b8a6'
};

export function AnalyticsView({ tasks, onCreateTask }) {
  const [showTableMode, setShowTableMode] = useState(false);

  // Derived metrics with useMemo
  const stats = useMemo(() => {
    return calculateTaskStats(tasks);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="view-container analytics-view">
        <section className="task-empty-state" aria-label="No analytics data">
          <div className="task-empty-state__icon-wrap">
            <CheckSquare size={36} aria-hidden="true" />
          </div>
          <h3 className="task-empty-state__title">No task analytics available</h3>
          <p className="task-empty-state__text">
            Analytics, KPI trends, and status charts will generate dynamically once you create tasks.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onCreateTask}
          >
            <Plus size={18} aria-hidden="true" />
            <span>Create your first task</span>
          </button>
        </section>
      </div>
    );
  }

  // Calculate SVG Donut chart segments
  // Circumference for radius 70 = 2 * PI * 70 ≈ 439.82297
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const total = stats.total || 1;

  let accumulatedPercent = 0;
  const donutSegments = Object.entries(stats.statusCounts).map(([status, count]) => {
    const fraction = count / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    return {
      status,
      count,
      percent: Math.round(fraction * 100),
      color: STATUS_COLORS[status] || '#94a3b8',
      strokeDasharray,
      strokeDashoffset
    };
  });

  // Calculate max count for category & priority scaling
  const maxPriorityCount = Math.max(...Object.values(stats.priorityCounts), 1);
  const maxCategoryCount = Math.max(...Object.values(stats.categoryCounts), 1);

  return (
    <div className="view-container analytics-view">
      {/* View Header with accessibility table toggle */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-header__title">Workspace Velocity & Distribution</h2>
          <p className="analytics-header__subtitle">
            Real-time computed metrics across {stats.total} total deliverables
          </p>
        </div>

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => setShowTableMode((prev) => !prev)}
          aria-pressed={showTableMode}
        >
          <Table size={15} aria-hidden="true" />
          <span>{showTableMode ? 'Switch to Charts' : 'View as Table'}</span>
        </button>
      </div>

      {/* KPI Row */}
      <section className="analytics-kpi-grid" aria-label="Key Performance Indicators">
        <div className="analytics-kpi-card">
          <div className="kpi-card__top">
            <span className="kpi-card__label">Completion Rate</span>
            <div className="kpi-card__icon kpi-card__icon--success">
              <TrendingUp size={18} aria-hidden="true" />
            </div>
          </div>
          <span className="kpi-card__value">{stats.completionRate}%</span>
          <div className="kpi-card__bar">
            <div
              className="kpi-card__bar-fill kpi-card__bar-fill--success"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <span className="kpi-card__sub">{stats.completed} of {stats.total} deliverables done</span>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-card__top">
            <span className="kpi-card__label">Overdue Tasks</span>
            <div className={`kpi-card__icon ${stats.overdueCount > 0 ? 'kpi-card__icon--danger' : 'kpi-card__icon--neutral'}`}>
              <AlertTriangle size={18} aria-hidden="true" />
            </div>
          </div>
          <span className="kpi-card__value">{stats.overdueCount}</span>
          <span className="kpi-card__sub">
            {stats.overdueCount === 0 ? 'Backlog on track' : 'Requires immediate attention'}
          </span>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-card__top">
            <span className="kpi-card__label">Due This Week</span>
            <div className="kpi-card__icon kpi-card__icon--info">
              <Calendar size={18} aria-hidden="true" />
            </div>
          </div>
          <span className="kpi-card__value">{stats.dueThisWeekCount}</span>
          <span className="kpi-card__sub">Upcoming scheduled deadlines</span>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-card__top">
            <span className="kpi-card__label">Avg / Category</span>
            <div className="kpi-card__icon kpi-card__icon--purple">
              <Layers size={18} aria-hidden="true" />
            </div>
          </div>
          <span className="kpi-card__value">{stats.avgTasksPerCategory}</span>
          <span className="kpi-card__sub">Across {Object.keys(stats.categoryCounts).length} task domains</span>
        </div>
      </section>

      {/* Accessible Table Alternative Mode */}
      {showTableMode ? (
        <section className="analytics-tables-wrapper" aria-label="Tabular analytics breakdown">
          <div className="analytics-table-card">
            <h3 className="analytics-card__title">Tasks by Status</h3>
            <table className="analytics-data-table">
              <thead>
                <tr>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">Task Count</th>
                  <th scope="col" className="text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {donutSegments.map((s) => (
                  <tr key={s.status}>
                    <td>
                      <span className="table-color-dot" style={{ backgroundColor: s.color }} />
                      {s.status}
                    </td>
                    <td className="text-right">{s.count}</td>
                    <td className="text-right">{s.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="analytics-table-card">
            <h3 className="analytics-card__title">Tasks by Priority</h3>
            <table className="analytics-data-table">
              <thead>
                <tr>
                  <th scope="col">Priority</th>
                  <th scope="col" className="text-right">Task Count</th>
                  <th scope="col" className="text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.priorityCounts).map(([priority, count]) => (
                  <tr key={priority}>
                    <td>
                      <span className="table-color-dot" style={{ backgroundColor: PRIORITY_COLORS[priority] }} />
                      {priority}
                    </td>
                    <td className="text-right">{count}</td>
                    <td className="text-right">{Math.round((count / total) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="analytics-table-card">
            <h3 className="analytics-card__title">Tasks by Category</h3>
            <table className="analytics-data-table">
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col" className="text-right">Task Count</th>
                  <th scope="col" className="text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.categoryCounts).map(([cat, count]) => (
                  <tr key={cat}>
                    <td>
                      <span className="table-color-dot" style={{ backgroundColor: CATEGORY_COLORS[cat] || '#888' }} />
                      {cat}
                    </td>
                    <td className="text-right">{count}</td>
                    <td className="text-right">{Math.round((count / total) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* Visual SVG & CSS Charts Grid */
        <section className="analytics-charts-grid" aria-label="Visual analytics charts">
          {/* Chart 1: Donut Chart - Status Breakdown */}
          <div className="analytics-card" aria-label="Task Status Donut Chart">
            <div className="analytics-card__header">
              <h3 className="analytics-card__title">Task Status Breakdown</h3>
              <span className="analytics-card__tag">Overall Distribution</span>
            </div>

            <div className="donut-chart-container">
              <div className="donut-chart-wrap">
                <svg
                  viewBox="0 0 200 200"
                  className="donut-svg"
                  role="img"
                  aria-label={`Donut chart showing ${stats.total} tasks: ${donutSegments
                    .map((s) => `${s.count} ${s.status}`)
                    .join(', ')}`}
                >
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="var(--border-subtle)"
                    strokeWidth="24"
                  />
                  {donutSegments.map((segment) => (
                    <circle
                      key={segment.status}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="24"
                      strokeDasharray={segment.strokeDasharray}
                      strokeDashoffset={segment.strokeDashoffset}
                      transform="rotate(-90 100 100)"
                      className="donut-segment"
                    />
                  ))}
                </svg>

                <div className="donut-center-label" aria-hidden="true">
                  <span className="donut-center-val">{stats.total}</span>
                  <span className="donut-center-sub">Tasks</span>
                </div>
              </div>

              {/* Legend */}
              <div className="donut-legend">
                {donutSegments.map((s) => (
                  <div key={s.status} className="donut-legend-item">
                    <span className="legend-indicator" style={{ backgroundColor: s.color }} />
                    <span className="legend-name">{s.status}</span>
                    <span className="legend-count">{s.count}</span>
                    <span className="legend-percent">({s.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Horizontal Bar Chart - Priority Breakdown */}
          <div className="analytics-card" aria-label="Task Priority Breakdown">
            <div className="analytics-card__header">
              <h3 className="analytics-card__title">Tasks by Priority</h3>
              <span className="analytics-card__tag">Urgency Mapping</span>
            </div>

            <div className="bar-chart-horizontal">
              {['High', 'Medium', 'Low'].map((p) => {
                const count = stats.priorityCounts[p] || 0;
                const widthPercent = (count / maxPriorityCount) * 100;
                const totalPercent = Math.round((count / total) * 100);

                return (
                  <div key={p} className="h-bar-row">
                    <div className="h-bar-label">
                      <span className="h-bar-name">{p}</span>
                      <span className="h-bar-count">{count} items ({totalPercent}%)</span>
                    </div>
                    <div className="h-bar-track">
                      <div
                        className="h-bar-fill"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: PRIORITY_COLORS[p]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 3: Vertical Bar Chart - Category Breakdown */}
          <div className="analytics-card analytics-card--wide" aria-label="Task Category Breakdown">
            <div className="analytics-card__header">
              <h3 className="analytics-card__title">Domain Workload by Category</h3>
              <span className="analytics-card__tag">Functional Areas</span>
            </div>

            <div className="category-bars-container">
              {Object.entries(stats.categoryCounts).map(([cat, count]) => {
                const heightPercent = maxCategoryCount > 0 ? (count / maxCategoryCount) * 100 : 0;
                const totalPercent = Math.round((count / total) * 100);

                return (
                  <div key={cat} className="v-bar-col">
                    <div className="v-bar-val">{count}</div>
                    <div className="v-bar-track">
                      <div
                        className="v-bar-fill"
                        style={{
                          height: `${Math.max(10, heightPercent)}%`,
                          backgroundColor: CATEGORY_COLORS[cat] || 'var(--primary-500)'
                        }}
                      />
                    </div>
                    <span className="v-bar-name">{cat}</span>
                    <span className="v-bar-sub">{totalPercent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default AnalyticsView;
