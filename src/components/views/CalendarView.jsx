import React, { useState, useMemo } from 'react';
import {
  getMonthGrid,
  MONTH_NAMES,
  WEEKDAYS,
  formatDisplayDate,
  formatDateToYMD,
  isDateOverdue,
  parseDate
} from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2
} from 'lucide-react';

const STATUS_ICONS = {
  'To do': Clock,
  'In progress': AlertCircle,
  'Completed': CheckCircle2
};

export function CalendarView({
  tasks,
  onEditTask,
  onDeleteTask,
  onCreateTaskWithDate
}) {
  // Default to November 2026 (matching system date & sample tasks)
  const initialDate = new Date();
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());

  // Navigation handlers
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // Map tasks by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        if (!map[task.dueDate]) {
          map[task.dueDate] = [];
        }
        map[task.dueDate].push(task);
      }
    });
    return map;
  }, [tasks]);

  // Compute 35 or 42 grid cells
  const gridDays = useMemo(() => {
    return getMonthGrid(year, month);
  }, [year, month]);

  // Agenda list of tasks for the active month (sorted by date)
  const monthlyAgenda = useMemo(() => {
    const currentMonthYMD = `${year}-${String(month + 1).padStart(2, '0')}`;
    const datesWithTasks = Object.keys(tasksByDate)
      .filter((dateStr) => dateStr.startsWith(currentMonthYMD))
      .sort();

    return datesWithTasks.map((dateStr) => ({
      dateStr,
      tasks: tasksByDate[dateStr]
    }));
  }, [tasksByDate, year, month]);

  return (
    <div className="view-container calendar-view">
      <section className="calendar-panel" aria-label="Task schedule calendar">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="calendar-header__info">
            <h2 className="calendar-header__title" id="calendar-month-label">
              {MONTH_NAMES[month]} {year}
            </h2>
            <span className="calendar-header__badge">
              {monthlyAgenda.reduce((acc, item) => acc + item.tasks.length, 0)} scheduled tasks
            </span>
          </div>

          <div className="calendar-header__nav">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={handleToday}
              aria-label="Jump to current month"
            >
              Today
            </button>
            <div className="calendar-header__btn-group">
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handlePrevMonth}
                aria-label={`Previous month (${month === 0 ? MONTH_NAMES[11] : MONTH_NAMES[month - 1]})`}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handleNextMonth}
                aria-label={`Next month (${month === 11 ? MONTH_NAMES[0] : MONTH_NAMES[month + 1]})`}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Month Grid */}
        <div
          className="calendar-grid-wrapper"
          role="grid"
          aria-labelledby="calendar-month-label"
        >
          {/* Weekday Header Row */}
          <div className="calendar-weekdays-row" role="row">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="calendar-weekday-col"
                role="columnheader"
                aria-label={day}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Grid Matrix */}
          <div className="calendar-days-matrix">
            {gridDays.map((day, idx) => {
              const dayTasks = tasksByDate[day.dateString] || [];
              const visibleChips = dayTasks.slice(0, 2);
              const extraCount = dayTasks.length - 2;

              return (
                <div
                  key={idx}
                  role="gridcell"
                  tabIndex={0}
                  className={`calendar-day-cell ${
                    !day.isCurrentMonth ? 'calendar-day-cell--outside' : ''
                  } ${day.isToday ? 'calendar-day-cell--today' : ''}`}
                  aria-label={`${formatDisplayDate(day.dateString)}, ${
                    dayTasks.length
                  } tasks`}
                  onClick={() => onCreateTaskWithDate(day.dateString)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (e.target === e.currentTarget) {
                        e.preventDefault();
                        onCreateTaskWithDate(day.dateString);
                      }
                    }
                  }}
                >
                  <div className="calendar-day-cell__top">
                    <span
                      className={`calendar-day-number ${
                        day.isToday ? 'calendar-day-number--today' : ''
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {day.isCurrentMonth && (
                      <button
                        type="button"
                        className="calendar-add-day-btn"
                        title={`Add task for ${day.dateString}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateTaskWithDate(day.dateString);
                        }}
                        aria-label={`Add task for ${day.dateString}`}
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Task Chips */}
                  <div className="calendar-chips-list">
                    {visibleChips.map((task) => {
                      const isCompleted = task.status === 'Completed';
                      const isOverdue = isDateOverdue(task.dueDate, isCompleted);
                      const StatusIcon = STATUS_ICONS[task.status] || Clock;
                      const statusSlug = task.status.toLowerCase().replace(/\s+/g, '-');

                      return (
                        <button
                          key={task.id}
                          type="button"
                          className={`calendar-task-chip chip--${statusSlug} ${
                            isOverdue ? 'chip--overdue' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          title={`${task.title} (${task.status}${
                            isOverdue ? ' · Overdue' : ''
                          })`}
                          aria-label={`Edit task: ${task.title}, ${task.status}`}
                        >
                          {isOverdue ? (
                            <AlertTriangle size={11} className="chip-icon" aria-hidden="true" />
                          ) : (
                            <StatusIcon size={11} className="chip-icon" aria-hidden="true" />
                          )}
                          <span className="chip-text">{task.title}</span>
                        </button>
                      );
                    })}

                    {extraCount > 0 && (
                      <span
                        className="calendar-more-badge"
                        title={`${extraCount} more task${extraCount > 1 ? 's' : ''}`}
                      >
                        +{extraCount} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Agenda View (Visible <= 768px) */}
        <div className="calendar-agenda-view" aria-label="Monthly task agenda">
          <div className="agenda-header">
            <h3 className="agenda-title">Agenda for {MONTH_NAMES[month]} {year}</h3>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => onCreateTaskWithDate(formatDateToYMD(new Date()))}
            >
              <Plus size={14} aria-hidden="true" />
              <span>Add Task</span>
            </button>
          </div>

          {monthlyAgenda.length === 0 ? (
            <div className="agenda-empty">
              <CalendarIcon size={32} className="agenda-empty-icon" aria-hidden="true" />
              <p>No tasks scheduled for this month.</p>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => onCreateTaskWithDate(formatDateToYMD(new Date()))}
              >
                Schedule a task
              </button>
            </div>
          ) : (
            <div className="agenda-list">
              {monthlyAgenda.map(({ dateStr, tasks }) => (
                <div key={dateStr} className="agenda-date-group">
                  <div className="agenda-date-header">
                    <span className="agenda-date-label">
                      {formatDisplayDate(dateStr)}
                    </span>
                    <span className="agenda-date-count">
                      {tasks.length} {tasks.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="agenda-tasks">
                    {tasks.map((task) => {
                      const isCompleted = task.status === 'Completed';
                      const isOverdue = isDateOverdue(task.dueDate, isCompleted);
                      const StatusIcon = STATUS_ICONS[task.status] || Clock;

                      return (
                        <div
                          key={task.id}
                          className={`agenda-task-item ${
                            isCompleted ? 'agenda-task-item--completed' : ''
                          }`}
                        >
                          <div className="agenda-task-left">
                            <span className={`status-pill status-pill--${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              <StatusIcon size={12} aria-hidden="true" />
                              <span>{task.status}</span>
                            </span>
                            <div className="agenda-task-info">
                              <span className="agenda-task-title">{task.title}</span>
                              {task.category && (
                                <span className="agenda-task-meta">{task.category} · {task.priority} Priority</span>
                              )}
                            </div>
                          </div>

                          <div className="agenda-task-actions">
                            <button
                              type="button"
                              className="task-action-btn"
                              onClick={() => onEditTask(task)}
                              aria-label={`Edit "${task.title}"`}
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="task-action-btn task-action-btn--delete"
                              onClick={() => onDeleteTask(task)}
                              aria-label={`Delete "${task.title}"`}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CalendarView;
