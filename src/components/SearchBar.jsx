import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar component with an accessible label, search icon,
 * and a one-click clear button when text is present.
 */
export function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="search-bar">
      <label htmlFor="task-search-input" className="sr-only">
        Search tasks by title
      </label>
      <div className="search-bar__wrapper">
        <Search className="search-bar__icon" size={18} aria-hidden="true" />
        <input
          id="task-search-input"
          type="search"
          className="search-bar__input"
          placeholder="Search tasks by title..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="search-bar__clear-btn"
            onClick={onClear}
            aria-label="Clear search input"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
