import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Design', 'Development', 'Testing', 'Research'];
const STATUSES = ['To do', 'In progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

/**
 * TaskForm modal for creating and updating tasks.
 * Includes complete validation, accessible focus trap, inline error descriptions,
 * and responsive modal / mobile sheet styling.
 */
export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  initialTask = null
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    status: 'To do',
    priority: 'Medium',
    dueDate: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  const isEditing = Boolean(initialTask);

  // Synchronize form values whenever modal opens or target task changes
  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setFormData({
          title: initialTask.title || '',
          description: initialTask.description || '',
          category: initialTask.category || 'Development',
          status: initialTask.status || 'To do',
          priority: initialTask.priority || 'Medium',
          dueDate: initialTask.dueDate || ''
        });
      } else {
        // Default due date to today + 3 days in YYYY-MM-DD
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        const yyyy = defaultDate.getFullYear();
        const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
        const dd = String(defaultDate.getDate()).padStart(2, '0');

        setFormData({
          title: '',
          description: '',
          category: 'Development',
          status: 'To do',
          priority: 'Medium',
          dueDate: `${yyyy}-${mm}-${dd}`
        });
      }
      setErrors({});
      setTouched({});

      // Set focus to the first interactive field
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialTask]);

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const trimmedTitle = formData.title.trim();

    if (!trimmedTitle) {
      newErrors.title = 'Task title is required and cannot be empty.';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === 'title' && !formData.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Task title is required.' }));
    }
    if (name === 'dueDate' && !formData.dueDate) {
      setErrors((prev) => ({ ...prev, dueDate: 'Due date is required.' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      title: true,
      dueDate: true
    });

    if (!validate()) return;

    const finalTaskData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim()
    };

    if (isEditing && initialTask) {
      onSubmit({
        ...initialTask,
        ...finalTaskData
      });
    } else {
      const uniqueId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      onSubmit({
        id: uniqueId,
        ...finalTaskData
      });
    }

    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="modal-container"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update the parameters and milestones for this task.'
                : 'Define details, priority, category, and due date to track your workflow.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close task modal without saving"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="task-title-input" className="form-label">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title-input"
              ref={titleInputRef}
              name="title"
              type="text"
              className={`form-input ${errors.title && touched.title ? 'form-input--error' : ''}`}
              placeholder="e.g. Design Dark Mode Token Palette"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(errors.title && touched.title)}
              aria-describedby={errors.title && touched.title ? 'title-error-msg' : undefined}
              required
            />
            {errors.title && touched.title && (
              <p id="title-error-msg" className="form-error" role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="task-desc-input" className="form-label">
              Description <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="task-desc-input"
              name="description"
              rows={3}
              className="form-textarea"
              placeholder="Add comprehensive specifications, acceptance criteria, or relevant links..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Row 1: Category & Priority */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-category-select" className="form-label">
                Category
              </label>
              <select
                id="task-category-select"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority-select" className="form-label">
                Priority <span className="required-star">*</span>
              </label>
              <select
                id="task-priority-select"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Status & Due Date */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status-select" className="form-label">
                Status <span className="required-star">*</span>
              </label>
              <select
                id="task-status-select"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-due-date-input" className="form-label">
                Due Date <span className="required-star">*</span>
              </label>
              <div className="date-input-wrap">
                <input
                  id="task-due-date-input"
                  name="dueDate"
                  type="date"
                  className={`form-input ${errors.dueDate && touched.dueDate ? 'form-input--error' : ''}`}
                  value={formData.dueDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.dueDate && touched.dueDate)}
                  aria-describedby={errors.dueDate && touched.dueDate ? 'due-error-msg' : undefined}
                  required
                />
              </div>
              {errors.dueDate && touched.dueDate && (
                <p id="due-error-msg" className="form-error" role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.dueDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
