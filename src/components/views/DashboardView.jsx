import React from 'react';
import { StatCard } from '../StatCard';
import { FocusNotes } from '../FocusNotes';
import { SearchBar } from '../SearchBar';
import { FilterTabs } from '../FilterTabs';
import { TaskList } from '../TaskList';

import {
  CheckSquare,
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

/**
 * DashboardView renders the original overview:
 * - 4 StatCards with sprint progress indicator
 * - 3-slide Focus Notes carousel
 * - Work Items panel with search, filter tabs, and responsive task cards
 */
export function DashboardView({
  tasks,
  stats,
  statusCounts,
  visibleTasks,
  searchText,
  onSearchChange,
  onClearSearch,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  hasActiveFilters,
  onResetFilters,
  onEditTask,
  onDeleteTask,
  onTaskStatusChange,
  onCreateTask
}) {
  return (
    <div className="view-container dashboard-view">
      {/* Section 1: Metrics Overview */}
      <section className="stats-grid" aria-label="Task progress summary">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={CheckSquare}
          subtitle="All registered backlog items"
          variant="total"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          subtitle="Currently active sprint work"
          variant="progress"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          subtitle="Successfully delivered"
          variant="completed"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={TrendingUp}
          subtitle="Sprint velocity indicator"
          progressBar={true}
          progressValue={stats.completionRate}
          variant="rate"
        />
      </section>

      {/* Section 2: Focus Notes Carousel */}
      <FocusNotes />

      {/* Section 3: Task Management Dashboard Panel */}
      <section className="task-section" aria-label="Tasks workspace">
        <div className="task-section__header">
          <div className="task-section__title-wrap">
            <h2 className="task-section__title">Work Items</h2>
            <span className="task-section__count-tag">
              {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="task-section__controls">
            <SearchBar
              value={searchText}
              onChange={onSearchChange}
              onClear={onClearSearch}
            />
          </div>
        </div>

        <FilterTabs
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          priorityFilter={priorityFilter}
          onPriorityChange={onPriorityChange}
          statusCounts={statusCounts}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={onResetFilters}
        />

        <TaskList
          tasks={visibleTasks}
          totalTaskCount={tasks.length}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onStatusChange={onTaskStatusChange}
          onCreateClick={onCreateTask}
          onResetFilters={onResetFilters}
        />
      </section>
    </div>
  );
}

export default DashboardView;
