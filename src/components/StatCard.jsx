import React from 'react';

/**
 * Reusable StatCard displaying key productivity metrics.
 * Supports dynamic numeric values, icon badges, and an optional completion progress bar.
 */
export function StatCard({ title, value, icon: Icon, subtitle, progressBar = false, progressValue = 0, variant = 'default' }) {
  return (
    <article className={`stat-card stat-card--${variant}`}>
      <div className="stat-card__header">
        <span className="stat-card__title">{title}</span>
        <div className="stat-card__icon-wrap" aria-hidden="true">
          <Icon className="stat-card__icon" size={20} />
        </div>
      </div>

      <div className="stat-card__body">
        <span className="stat-card__value">{value}</span>
        {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
      </div>

      {progressBar && (
        <div className="stat-card__progress-container" aria-hidden="true">
          <div
            className="stat-card__progress-bar"
            style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
          />
        </div>
      )}
    </article>
  );
}

export default StatCard;
