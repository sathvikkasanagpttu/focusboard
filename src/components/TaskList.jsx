import React from 'react';
import { TaskCard } from './TaskCard';
import { Plus, CheckSquare, SearchX, RotateCcw } from 'lucide-react';

/**
 * TaskList component rendering the grid of tasks and responsive empty states.
 */
export function TaskList({
  tasks,
  totalTaskCount,
  onEdit,
  onDelete,
  onStatusChange,
  onCreateClick,
  onResetFilters
}) {
  // Scenario 1: No tasks exist in the user's storage
  if (totalTaskCount === 0) {
    return (
      <section className="task-empty-state" aria-label="No tasks available">
        <div className="task-empty-state__icon-wrap">
          <CheckSquare size={36} aria-hidden="true" />
        </div>
        <h3 className="task-empty-state__title">No tasks yet</h3>
        <p className="task-empty-state__text">
          Get started on your productivity journey by creating your first task.
        </p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onCreateClick}
        >
          <Plus size={18} aria-hidden="true" />
          <span>Create your first task</span>
        </button>
      </section>
    );
  }

  // Scenario 2: Tasks exist, but the active search/filters returned 0 results
  if (tasks.length === 0) {
    return (
      <section className="task-empty-state" aria-label="No search matches">
        <div className="task-empty-state__icon-wrap task-empty-state__icon-wrap--neutral">
          <SearchX size={36} aria-hidden="true" />
        </div>
        <h3 className="task-empty-state__title">No tasks match your filters</h3>
        <p className="task-empty-state__text">
          Try adjusting your search query, status tab, or priority filter to find what you need.
        </p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onResetFilters}
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Reset filters</span>
        </button>
      </section>
    );
  }

  // Scenario 3: Standard active task grid
  return (
    <section className="task-grid" aria-label="Task items list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </section>
  );
}

export default TaskList;
