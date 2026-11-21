import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const CATEGORY_COLORS = {
  Design: 'category-design',
  Development: 'category-dev',
  Testing: 'category-testing',
  Research: 'category-research'
};

const PRIORITY_CONFIG = {
  High: { icon: ArrowUp, className: 'priority-high' },
  Medium: { icon: Minus, className: 'priority-medium' },
  Low: { icon: ArrowDown, className: 'priority-low' }
};

const STATUS_ICONS = {
  'To do': Clock,
  'In progress': AlertCircle,
  'Completed': CheckCircle2
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isCompleted = task.status === 'Completed';

  // Parse YYYY-MM-DD locally to avoid timezone skew
  let isOverdue = false;
  let formattedDate = task.dueDate;

  if (task.dueDate) {
    const parts = task.dueDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dueDateObj = new Date(year, month, day);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      isOverdue = !isCompleted && dueDateObj < today;

      formattedDate = dueDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  const PriorityIcon = PRIORITY_CONFIG[task.priority]?.icon || Minus;
  const StatusIcon = STATUS_ICONS[task.status] || Clock;
  const categoryClass = CATEGORY_COLORS[task.category] || 'category-default';
  const priorityClass = PRIORITY_CONFIG[task.priority]?.className || 'priority-medium';

  return (
    <article className={`task-card ${isCompleted ? 'task-card--completed' : ''}`}>
      <div className="task-card__top">
        <div className="task-card__badges">
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

        <div className="task-card__actions">
          <button
            type="button"
            className="task-action-btn"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
          >
            <Pencil size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="task-action-btn task-action-btn--delete"
            onClick={() => onDelete(task)}
            aria-label={`Delete "${task.title}"`}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <h3 className="task-card__title" title={task.title}>
        {task.title}
      </h3>

      {task.description && (
        <p className="task-card__description">
          {task.description}
        </p>
      )}

      <div className="task-card__footer">
        <div
          className={`task-card__due-date ${isOverdue ? 'task-card__due-date--overdue' : ''}`}
          title={isOverdue ? 'Overdue' : 'Due date'}
        >
          {isOverdue ? (
            <AlertTriangle size={14} aria-hidden="true" />
          ) : (
            <Calendar size={14} aria-hidden="true" />
          )}
          <span>
            {isOverdue && <strong className="overdue-tag">Overdue · </strong>}
            {formattedDate}
          </span>
        </div>

        <div className="task-card__status-control">
          <div className={`status-pill status-pill--${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
            <StatusIcon size={13} aria-hidden="true" />
            <span>{task.status}</span>
          </div>

          <label htmlFor={`status-select-${task.id}`} className="sr-only">
            Change status for {task.title}
          </label>
          <select
            id={`status-select-${task.id}`}
            className="task-card__status-select"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
          >
            <option value="To do">To do</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
