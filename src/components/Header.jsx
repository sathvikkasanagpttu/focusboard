import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';

const VIEW_TITLES = {
  dashboard: {
    breadcrumb: 'Dashboard',
    heading: 'Task Management'
  },
  tasks: {
    breadcrumb: 'All Tasks',
    heading: 'All Tasks Directory'
  },
  calendar: {
    breadcrumb: 'Calendar',
    heading: 'Schedule & Deadlines'
  },
  analytics: {
    breadcrumb: 'Analytics',
    heading: 'Performance Analytics'
  },
  settings: {
    breadcrumb: 'Settings',
    heading: 'Workspace Settings'
  }
};

/**
 * Top application header containing mobile navigation trigger,
 * dynamic breadcrumbs, main heading per view, primary "Add Task" action,
 * and user profile avatar synchronized with Settings.
 */
export function Header({
  activeView = 'dashboard',
  onToggleSidebar,
  isSidebarOpen,
  onOpenTaskForm,
  profile = { name: 'Alex Morgan', role: 'Product Lead' },
  headingRef
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const viewMeta = VIEW_TITLES[activeView] || VIEW_TITLES.dashboard;

  // Calculate initials from name
  const nameParts = (profile?.name || 'Alex Morgan').trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : (nameParts[0] ? nameParts[0].substring(0, 2).toUpperCase() : 'AM');

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__menu-btn"
          onClick={onToggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        <div className="app-header__title-group">
          <div className="app-header__breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{viewMeta.breadcrumb}</span>
          </div>
          <h1
            id="main-content-heading"
            ref={headingRef}
            className="app-header__heading"
            tabIndex={-1}
          >
            {viewMeta.heading}
          </h1>
        </div>
      </div>

      <div className="app-header__right">
        <div className="app-header__date" title="Current session date">
          <span>{currentDate}</span>
        </div>

        <button
          type="button"
          className="btn btn--primary app-header__add-btn"
          onClick={onOpenTaskForm}
        >
          <Plus size={18} aria-hidden="true" />
          <span>Add Task</span>
        </button>

        <button
          type="button"
          className="app-header__icon-btn"
          aria-label="View notifications (3 unread)"
        >
          <Bell size={20} aria-hidden="true" />
          <span className="notification-dot" aria-hidden="true" />
        </button>

        <div
          className="user-profile"
          tabIndex={0}
          role="button"
          aria-label={`${profile.name}, ${profile.role}`}
        >
          <div className="user-profile__avatar">
            <span>{initials}</span>
          </div>
          <div className="user-profile__details">
            <span className="user-profile__name">{profile.name}</span>
            <span className="user-profile__role">{profile.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
