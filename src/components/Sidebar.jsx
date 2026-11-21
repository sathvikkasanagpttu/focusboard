import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Settings,
  Sparkles,
  X,
  Layers
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { id: 'tasks', label: 'All Tasks', icon: CheckSquare, active: false },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, active: false },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, active: false },
  { id: 'settings', label: 'Settings', icon: Settings, active: false },
];

/**
 * Sidebar navigation component.
 * On desktop (1440px), permanently docked.
 * On tablet/mobile (<=1024px), functions as an accessible slide-in drawer with backdrop.
 */
export function Sidebar({ isOpen, onClose }) {
  const sidebarRef = useRef(null);

  // Close on Escape when mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
        aria-label="Main Navigation"
      >
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__brand-icon">
              <Layers size={22} aria-hidden="true" />
            </div>
            <div className="sidebar__brand-text">
              <span className="sidebar__brand-title">FocusBoard</span>
              <span className="sidebar__brand-badge">PRO</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar__close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__menu">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="sidebar__menu-item">
                  <a
                    href={`#${item.id}`}
                    className={`sidebar__link ${item.active ? 'sidebar__link--active' : ''}`}
                    aria-current={item.active ? 'page' : undefined}
                    onClick={(e) => {
                      if (!item.active) {
                        e.preventDefault();
                      }
                      if (isOpen) {
                        onClose();
                      }
                    }}
                  >
                    <Icon size={19} className="sidebar__link-icon" aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="workspace-badge">
            <div className="workspace-badge__avatar">
              <Sparkles size={16} aria-hidden="true" />
            </div>
            <div className="workspace-badge__info">
              <span className="workspace-badge__name">Product Workspace</span>
              <span className="workspace-badge__meta">8 Members Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
