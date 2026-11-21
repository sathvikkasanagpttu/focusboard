import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const STATUS_TABS = [
  { id: 'All', label: 'All' },
  { id: 'To do', label: 'To do' },
  { id: 'In progress', label: 'In progress' },
  { id: 'Completed', label: 'Completed' }
];

const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

/**
 * FilterTabs handles status category tabs and priority filtering with counts.
 * Accessible with role="tablist", aria-selected, and a filter reset trigger.
 */
export function FilterTabs({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  statusCounts = {},
  hasActiveFilters = false,
  onResetFilters
}) {
  return (
    <div className="filter-tabs-container">
      <div className="filter-tabs" role="tablist" aria-label="Filter tasks by status">
        {STATUS_TABS.map((tab) => {
          const isSelected = statusFilter === tab.id;
          const count = statusCounts[tab.id] ?? 0;

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
              aria-selected={isSelected}
              className={`filter-tab ${isSelected ? 'filter-tab--active' : ''}`}
              onClick={() => onStatusChange(tab.id)}
            >
              <span className="filter-tab__label">{tab.label}</span>
              <span className="filter-tab__count" aria-label={`${count} tasks`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="filter-actions">
        <div className="priority-select-wrap">
          <label htmlFor="priority-filter-select" className="priority-select-label">
            <Filter size={14} aria-hidden="true" />
            <span>Priority:</span>
          </label>
          <select
            id="priority-filter-select"
            className="priority-select"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            aria-label="Filter tasks by priority"
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority === 'All' ? 'All Priorities' : priority}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="filter-reset-btn"
            onClick={onResetFilters}
            aria-label="Reset all search and filter parameters"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterTabs;
