import React, { useState, useMemo } from 'react';
import { SearchBar } from '../SearchBar';
import { FilterTabs } from '../FilterTabs';
import { formatDisplayDate, isDateOverdue } from '../../utils/dateUtils';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowUpDown,
  Plus,
  CheckSquare,
  SearchX,
  RotateCcw
} from 'lucide-react';

const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };

const PRIORITY_CONFIG = {
  High: { icon: ArrowUp, className: 'priority-high' },
  Medium: { icon: Minus, className: 'priority-medium' },
  Low: { icon: ArrowDown, className: 'priority-low' }
};

const CATEGORY_COLORS = {
  Design: 'category-design',
  Development: 'category-dev',
  Testing: 'category-testing',
  Research: 'category-research'
};

const STATUS_ICONS = {
  'To do': Clock,
  'In progress': AlertCircle,
  'Completed': CheckCircle2
};

export function AllTasksView({
  tasks,
  onEditTask,
  onDeleteTask,
  onTaskStatusChange,
  onCreateTask
}) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate-asc');

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      All: tasks.length,
      'To do': tasks.filter((t) => t.status === 'To do').length,
      'In progress': tasks.filter((t) => t.status === 'In progress').length,
      Completed: tasks.filter((t) => t.status === 'Completed').length
    };
  }, [tasks]);

  const hasActiveFilters =
    searchText.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All';

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  // Filter & sort
  const visibleTasks = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      const matchesSearch =
        !q || (task.title && task.title.toLowerCase().includes(q));
      const matchesStatus =
        statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'dueDate-asc') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      if (sortBy === 'dueDate-desc') {
        return (b.dueDate || '').localeCompare(a.dueDate || '');
      }
      if (sortBy === 'priority') {
        return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }, [tasks, searchText, statusFilter, priorityFilter, sortBy]);

  return (
    <div className="view-container all-tasks-view">
      <section className="task-section" aria-label="All tasks catalog">
        {/* Top Header bar with search and sort */}
        <div className="task-section__header">
          <div className="task-section__title-wrap">
            <h2 className="task-section__title">All Tasks Table</h2>
            <span className="task-section__count-tag">
              {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="task-section__controls all-tasks-controls">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              onClear={() => setSearchText('')}
            />

            <div className="sort-select-wrap">
              <label htmlFor="tasks-sort-select" className="sort-select-label">
                <ArrowUpDown size={14} aria-hidden="true" />
                <span>Sort by:</span>
              </label>
              <select
                id="tasks-sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dueDate-asc">Due Date (Earliest first)</option>
                <option value="dueDate-desc">Due Date (Latest first)</option>
                <option value="priority">Priority (High to Low)</option>
                <option value="title">Title (A – Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter tabs and priority selector */}
        <FilterTabs
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          statusCounts={statusCounts}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Empty state: No total tasks */}
        {tasks.length === 0 ? (
          <section className="task-empty-state" aria-label="No tasks registered">
            <div className="task-empty-state__icon-wrap">
              <CheckSquare size={36} aria-hidden="true" />
            </div>
            <h3 className="task-empty-state__title">No tasks in your backlog</h3>
            <p className="task-empty-state__text">
              Create your first task to start organizing and tracking your deliverables.
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
        ) : visibleTasks.length === 0 ? (
          /* Empty state: No search / filter matches */
          <section className="task-empty-state" aria-label="No search matches">
            <div className="task-empty-state__icon-wrap task-empty-state__icon-wrap--neutral">
              <SearchX size={36} aria-hidden="true" />
            </div>
            <h3 className="task-empty-state__title">No tasks match your filters</h3>
            <p className="task-empty-state__text">
              Try adjusting your search criteria, status tab, or priority filter.
            </p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleResetFilters}
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>Reset filters</span>
            </button>
          </section>
        ) : (
          /* Responsive Table on desktop / Stacked Cards on mobile */
          <div className="tasks-table-container">
            <table className="tasks-table" role="table">
              <thead>
                <tr>
                  <th scope="col" className="col-title">Task Title</th>
                  <th scope="col" className="col-category">Category</th>
                  <th scope="col" className="col-priority">Priority</th>
                  <th scope="col" className="col-status">Status</th>
                  <th scope="col" className="col-due">Due Date</th>
                  <th scope="col" className="col-actions text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const isOverdue = isDateOverdue(task.dueDate, isCompleted);
                  const PriorityIcon = PRIORITY_CONFIG[task.priority]?.icon || Minus;
                  const StatusIcon = STATUS_ICONS[task.status] || Clock;
                  const categoryClass = CATEGORY_COLORS[task.category] || 'category-default';
                  const priorityClass = PRIORITY_CONFIG[task.priority]?.className || 'priority-medium';

                  return (
                    <tr
                      key={task.id}
                      className={`tasks-table__row ${isCompleted ? 'tasks-table__row--completed' : ''}`}
                    >
                      <td className="col-title">
                        <div className="table-task-info">
                          <span className="table-task-title" title={task.title}>
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="table-task-desc" title={task.description}>
                              {task.description}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="col-category">
                        {task.category ? (
                          <span className={`task-badge ${categoryClass}`}>
                            {task.category}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      <td className="col-priority">
                        <span className={`task-badge ${priorityClass}`}>
                          <PriorityIcon size={12} aria-hidden="true" />
                          <span>{task.priority}</span>
                        </span>
                      </td>

                      <td className="col-status">
                        <div className="table-status-wrap">
                          <label htmlFor={`table-status-${task.id}`} className="sr-only">
                            Change status for {task.title}
                          </label>
                          <div className={`status-pill status-pill--${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            <StatusIcon size={12} aria-hidden="true" />
                            <span>{task.status}</span>
                          </div>
                          <select
                            id={`table-status-${task.id}`}
                            className="table-status-select"
                            value={task.status}
                            onChange={(e) => onTaskStatusChange(task.id, e.target.value)}
                          >
                            <option value="To do">To do</option>
                            <option value="In progress">In progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </td>

                      <td className="col-due">
                        <div className={`table-due-date ${isOverdue ? 'table-due-date--overdue' : ''}`}>
                          {isOverdue ? (
                            <AlertTriangle size={14} aria-hidden="true" />
                          ) : (
                            <Calendar size={14} aria-hidden="true" />
                          )}
                          <span>
                            {isOverdue && <strong>Overdue · </strong>}
                            {formatDisplayDate(task.dueDate)}
                          </span>
                        </div>
                      </td>

                      <td className="col-actions text-right">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="task-action-btn"
                            onClick={() => onEditTask(task)}
                            aria-label={`Edit "${task.title}"`}
                            title="Edit task"
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="task-action-btn task-action-btn--delete"
                            onClick={() => onDeleteTask(task)}
                            aria-label={`Delete "${task.title}"`}
                            title="Delete task"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Stacked Card View (displayed via CSS media query) */}
            <div className="mobile-task-cards">
              {visibleTasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const isOverdue = isDateOverdue(task.dueDate, isCompleted);
                const PriorityIcon = PRIORITY_CONFIG[task.priority]?.icon || Minus;
                const StatusIcon = STATUS_ICONS[task.status] || Clock;
                const categoryClass = CATEGORY_COLORS[task.category] || 'category-default';
                const priorityClass = PRIORITY_CONFIG[task.priority]?.className || 'priority-medium';

                return (
                  <article
                    key={task.id}
                    className={`mobile-task-card ${isCompleted ? 'mobile-task-card--completed' : ''}`}
                  >
                    <div className="mobile-task-card__header">
                      <div className="mobile-task-card__badges">
                        {task.category && (
                          <span className={`task-badge ${categoryClass}`}>
                            {task.category}
                          </span>
                        )}
                        <span className={`task-badge ${priorityClass}`}>
                          <PriorityIcon size={12} aria-hidden="true" />
                          <span>{task.priority}</span>
                        </span>
                      </div>
                      <div className="mobile-task-card__actions">
                        <button
                          type="button"
                          className="task-action-btn"
                          onClick={() => onEditTask(task)}
                          aria-label={`Edit "${task.title}"`}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="task-action-btn task-action-btn--delete"
                          onClick={() => onDeleteTask(task)}
                          aria-label={`Delete "${task.title}"`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mobile-task-card__title">{task.title}</h3>
                    {task.description && (
                      <p className="mobile-task-card__desc">{task.description}</p>
                    )}

                    <div className="mobile-task-card__footer">
                      <div className={`table-due-date ${isOverdue ? 'table-due-date--overdue' : ''}`}>
                        {isOverdue ? (
                          <AlertTriangle size={14} aria-hidden="true" />
                        ) : (
                          <Calendar size={14} aria-hidden="true" />
                        )}
                        <span>
                          {isOverdue && <strong>Overdue · </strong>}
                          {formatDisplayDate(task.dueDate)}
                        </span>
                      </div>

                      <div className="table-status-wrap">
                        <label htmlFor={`mobile-status-${task.id}`} className="sr-only">
                          Change status for {task.title}
                        </label>
                        <div className={`status-pill status-pill--${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          <StatusIcon size={12} aria-hidden="true" />
                          <span>{task.status}</span>
                        </div>
                        <select
                          id={`mobile-status-${task.id}`}
                          className="table-status-select"
                          value={task.status}
                          onChange={(e) => onTaskStatusChange(task.id, e.target.value)}
                        >
                          <option value="To do">To do</option>
                          <option value="In progress">In progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AllTasksView;
