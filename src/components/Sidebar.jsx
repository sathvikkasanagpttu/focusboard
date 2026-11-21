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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/**
 * Sidebar navigation component supporting view routing and accessibility.
 * On desktop (1440px), permanently docked.
 * On tablet/mobile (<=1024px), functions as an accessible slide-in modal drawer with backdrop.
 */
export function Sidebar({
  isOpen,
  onClose,
  activeView = 'dashboard',
  onNavigate
}) {
  const sidebarRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Focus management and focus trapping when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement;

      // Bring focus to the close button inside drawer
      const timer = setTimeout(() => {
        const closeBtn = sidebarRef.current?.querySelector('.sidebar__close-btn');
        if (closeBtn && window.getComputedStyle(closeBtn).display !== 'none') {
          closeBtn.focus();
        } else {
          const firstLink = sidebarRef.current?.querySelector('.sidebar__link');
          firstLink?.focus();
        }
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return;
        }

        // Focus trap inside drawer
        if (e.key === 'Tab' && sidebarRef.current) {
          const focusable = Array.from(
            sidebarRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && !el.disabled;
          });

          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        if (
          previouslyFocusedElement.current &&
          typeof previouslyFocusedElement.current.focus === 'function'
        ) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  const handleItemClick = (e, viewId) => {
    e.preventDefault();
    onNavigate(viewId);
  };

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
              const isActive = activeView === item.id;

              return (
                <li key={item.id} className="sidebar__menu-item">
                  <a
                    href={`#${item.id}`}
                    className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => handleItemClick(e, item.id)}
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
