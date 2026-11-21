import React from 'react';
import { Menu, Plus, Bell, Sparkles } from 'lucide-react';

/**
 * Top application header containing mobile navigation trigger,
 * breadcrumbs, primary "Add Task" action, notifications, and user profile avatar.
 */
export function Header({
  onToggleSidebar,
  isSidebarOpen,
  onOpenTaskForm
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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
            <span className="breadcrumb-current">Dashboard</span>
          </div>
          <h1 className="app-header__heading">Task Management</h1>
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

        <div className="user-profile" tabIndex={0} role="button" aria-label="Alex Morgan, Senior Product Lead">
          <div className="user-profile__avatar">
            <span>AM</span>
          </div>
          <div className="user-profile__details">
            <span className="user-profile__name">Alex Morgan</span>
            <span className="user-profile__role">Product Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
