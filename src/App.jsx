import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useHashView } from './hooks/useHashView';
import { sampleTasks } from './data/sampleTasks';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { ConfirmDialog } from './components/ConfirmDialog';

import { DashboardView } from './components/views/DashboardView';
import { AllTasksView } from './components/views/AllTasksView';
import { CalendarView } from './components/views/CalendarView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';

export function App() {
  // Synchronize view routing with URL hash (#dashboard, #tasks, #calendar, #analytics, #settings)
  const [activeView, setActiveView] = useHashView('dashboard');

  // Single Source of Truth for tasks across all views
  const [tasks, setTasks] = useLocalStorage('focusboard_tasks', sampleTasks);

  // User Profile state persisted in localStorage
  const [profile, setProfile] = useLocalStorage('focusboard_profile', {
    name: 'Alex Morgan',
    role: 'Product Lead'
  });

  // Theme state persisted in localStorage and synced with data-theme on <html>
  const [theme, setTheme] = useLocalStorage('focusboard_theme', 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headingRef = useRef(null);

  // Modal states for creating / editing tasks
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formInitialDueDate, setFormInitialDueDate] = useState('');

  // Confirmation dialog states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Search & Filter state for Dashboard view
  const [dashSearchText, setDashSearchText] = useState('');
  const [dashStatusFilter, setDashStatusFilter] = useState('All');
  const [dashPriorityFilter, setDashPriorityFilter] = useState('All');

  // Computed dashboard statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'In progress').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      inProgress,
      completed,
      completionRate
    };
  }, [tasks]);

  // Derived counts for dashboard status tabs
  const statusCounts = useMemo(() => {
    return {
      All: tasks.length,
      'To do': tasks.filter((t) => t.status === 'To do').length,
      'In progress': tasks.filter((t) => t.status === 'In progress').length,
      Completed: tasks.filter((t) => t.status === 'Completed').length
    };
  }, [tasks]);

  // Derived visible tasks for dashboard
  const dashVisibleTasks = useMemo(() => {
    const q = dashSearchText.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !q || (task.title && task.title.toLowerCase().includes(q));
      const matchesStatus =
        dashStatusFilter === 'All' || task.status === dashStatusFilter;
      const matchesPriority =
        dashPriorityFilter === 'All' || task.priority === dashPriorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, dashSearchText, dashStatusFilter, dashPriorityFilter]);

  const hasDashActiveFilters =
    dashSearchText.trim() !== '' ||
    dashStatusFilter !== 'All' ||
    dashPriorityFilter !== 'All';

  const handleDashResetFilters = () => {
    setDashSearchText('');
    setDashStatusFilter('All');
    setDashPriorityFilter('All');
  };

  // Navigation handler
  const handleNavigate = (viewId) => {
    setActiveView(viewId);
    setIsMobileMenuOpen(false);
    // Accessibility: shift focus to main content heading
    setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
  };

  // Task CRUD operations
  const handleOpenCreateModal = (initialDate = '') => {
    setEditingTask(null);
    setFormInitialDueDate(typeof initialDate === 'string' ? initialDate : '');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormInitialDueDate('');
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setFormInitialDueDate('');
  };

  const handleFormSubmit = (taskData) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? taskData : t))
      );
    } else {
      setTasks((prev) => [taskData, ...prev]);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Deletion handling
  const handleDeleteRequest = (task) => {
    setDeleteTarget(task);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // Reset to sample tasks handling
  const handleResetToSampleConfirm = () => {
    setTasks(sampleTasks);
    setIsResetConfirmOpen(false);
  };

  // Clear all tasks handling
  const handleClearAllConfirm = () => {
    setTasks([]);
    setIsClearConfirmOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Main Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeView={activeView}
        onNavigate={handleNavigate}
      />

      <div className="app-main-wrapper">
        {/* Top Header */}
        <Header
          activeView={activeView}
          isSidebarOpen={isMobileMenuOpen}
          onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
          onOpenTaskForm={() => handleOpenCreateModal()}
          profile={profile}
          headingRef={headingRef}
        />

        {/* Dynamic Main Views */}
        <main id="main-content" className="main-content" tabIndex={-1}>
          {activeView === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              stats={stats}
              statusCounts={statusCounts}
              visibleTasks={dashVisibleTasks}
              searchText={dashSearchText}
              onSearchChange={setDashSearchText}
              onClearSearch={() => setDashSearchText('')}
              statusFilter={dashStatusFilter}
              onStatusChange={setDashStatusFilter}
              priorityFilter={dashPriorityFilter}
              onPriorityChange={setDashPriorityFilter}
              hasActiveFilters={hasDashActiveFilters}
              onResetFilters={handleDashResetFilters}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteRequest}
              onTaskStatusChange={handleStatusChange}
              onCreateTask={() => handleOpenCreateModal()}
            />
          )}

          {activeView === 'tasks' && (
            <AllTasksView
              tasks={tasks}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteRequest}
              onTaskStatusChange={handleStatusChange}
              onCreateTask={() => handleOpenCreateModal()}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteRequest}
              onCreateTaskWithDate={(dateStr) => handleOpenCreateModal(dateStr)}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              tasks={tasks}
              onCreateTask={() => handleOpenCreateModal()}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={setProfile}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              tasks={tasks}
              onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
              onOpenClearConfirm={() => setIsClearConfirmOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Task Creation & Editing Modal (Available in all views) */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
        initialDueDate={formInitialDueDate}
      />

      {/* Single Task Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        taskTitle={deleteTarget?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Reset to Sample Tasks Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Backlog to Sample Tasks?"
        description="This will overwrite your existing deliverables with the 8 initial sample tasks. Any custom tasks you created will be replaced."
        confirmText="Reset to Sample"
        confirmVariant="danger"
        onConfirm={handleResetToSampleConfirm}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Clear All Tasks Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="Clear All Tasks in Workspace?"
        description="Are you sure you want to delete all tasks? This action will leave your workspace backlog completely empty and cannot be undone."
        confirmText="Clear All Tasks"
        confirmVariant="danger"
        onConfirm={handleClearAllConfirm}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
}

export default App;
