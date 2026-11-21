import React, { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Save,
  Laptop
} from 'lucide-react';

export function SettingsView({
  profile,
  onUpdateProfile,
  theme,
  onToggleTheme,
  tasks,
  onOpenResetConfirm,
  onOpenClearConfirm
}) {
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || 'Alex Morgan',
    role: profile?.role || 'Product Lead'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;

    onUpdateProfile({
      name: profileForm.name.trim(),
      role: profileForm.role.trim() || 'Contributor'
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleExportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `focusboard-tasks-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="view-container settings-view">
      <div className="settings-panel">
        {/* Section 1: User Profile Settings */}
        <section className="settings-section" aria-labelledby="profile-settings-title">
          <div className="settings-section__header">
            <div className="settings-section__icon-wrap">
              <User size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="profile-settings-title" className="settings-section__title">
                User Profile
              </h2>
              <p className="settings-section__subtitle">
                Customize your identity displayed in the top header and activity logs.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="settings-name-input" className="form-label">
                  Display Name <span className="required-star">*</span>
                </label>
                <input
                  id="settings-name-input"
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="settings-role-input" className="form-label">
                  Role / Title
                </label>
                <input
                  id="settings-role-input"
                  type="text"
                  className="form-input"
                  value={profileForm.role}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  placeholder="e.g. Product Lead, Senior Designer"
                />
              </div>
            </div>

            <div className="settings-form-actions">
              <button type="submit" className="btn btn--primary">
                <Save size={16} aria-hidden="true" />
                <span>Save Profile</span>
              </button>

              {savedSuccess && (
                <span className="save-feedback" role="status">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Profile updated and saved to local storage!</span>
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Section 2: Appearance & Theme */}
        <section className="settings-section" aria-labelledby="theme-settings-title">
          <div className="settings-section__header">
            <div className="settings-section__icon-wrap">
              {theme === 'dark' ? (
                <Moon size={20} aria-hidden="true" />
              ) : (
                <Sun size={20} aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 id="theme-settings-title" className="settings-section__title">
                Appearance & Theme
              </h2>
              <p className="settings-section__subtitle">
                Switch between high-contrast light mode and eye-friendly dark mode.
              </p>
            </div>
          </div>

          <div className="theme-toggle-group" role="radiogroup" aria-label="Theme selection">
            <button
              type="button"
              role="radio"
              aria-checked={theme === 'light'}
              className={`theme-card ${theme === 'light' ? 'theme-card--active' : ''}`}
              onClick={() => theme !== 'light' && onToggleTheme()}
            >
              <div className="theme-card__icon theme-card__icon--light">
                <Sun size={24} aria-hidden="true" />
              </div>
              <div className="theme-card__details">
                <span className="theme-card__title">Light Theme</span>
                <span className="theme-card__desc">Crisp white surface with indigo highlights</span>
              </div>
              <div className="theme-card__radio-indicator" />
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={theme === 'dark'}
              className={`theme-card ${theme === 'dark' ? 'theme-card--active' : ''}`}
              onClick={() => theme !== 'dark' && onToggleTheme()}
            >
              <div className="theme-card__icon theme-card__icon--dark">
                <Moon size={24} aria-hidden="true" />
              </div>
              <div className="theme-card__details">
                <span className="theme-card__title">Dark Theme</span>
                <span className="theme-card__desc">Deep slate surface designed for low-light focus</span>
              </div>
              <div className="theme-card__radio-indicator" />
            </button>
          </div>
        </section>

        {/* Section 3: Data Management */}
        <section className="settings-section" aria-labelledby="data-settings-title">
          <div className="settings-section__header">
            <div className="settings-section__icon-wrap">
              <Download size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="data-settings-title" className="settings-section__title">
                Data & Storage Management
              </h2>
              <p className="settings-section__subtitle">
                Export your current deliverable backlog or reset stored browser records.
              </p>
            </div>
          </div>

          <div className="data-actions-grid">
            <div className="data-action-item">
              <div>
                <h3 className="data-action-title">Export Tasks as JSON</h3>
                <p className="data-action-desc">
                  Download a complete structured backup of all {tasks.length} active deliverables.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleExportTasks}
              >
                <Download size={16} aria-hidden="true" />
                <span>Export ({tasks.length} tasks)</span>
              </button>
            </div>

            <div className="data-action-item">
              <div>
                <h3 className="data-action-title">Reset to Sample Data</h3>
                <p className="data-action-desc">
                  Restore the original 8 curated sample tasks. Your existing tasks will be replaced.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onOpenResetConfirm}
              >
                <RotateCcw size={16} aria-hidden="true" />
                <span>Reset to Sample Data</span>
              </button>
            </div>

            <div className="data-action-item data-action-item--danger">
              <div>
                <h3 className="data-action-title text-danger">Clear All Tasks</h3>
                <p className="data-action-desc">
                  Permanently purge all tasks from local storage. An empty backlog will be preserved.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--danger"
                onClick={onOpenClearConfirm}
              >
                <Trash2 size={16} aria-hidden="true" />
                <span>Clear All Tasks</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsView;
