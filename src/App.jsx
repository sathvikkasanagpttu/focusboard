import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { sampleTasks } from './data/sampleTasks';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { FocusNotes } from './components/FocusNotes';
import { SearchBar } from './components/SearchBar';
import { FilterTabs } from './components/FilterTabs';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { ConfirmDialog } from './components/ConfirmDialog';

import {
  CheckSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus
} from 'lucide-react';

export function App() {
  // Primary persistent state synchronized with localStorage
  const [tasks, setTasks] = useLocalStorage('focusboard_tasks', sampleTasks);

  // Search & Filtering states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal & Drawer visibility states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derived statistics: always computed from full task list
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

  // Derived counts for the status tabs
  const statusCounts = useMemo(() => {
    return {
      All: tasks.length,
      'To do': tasks.filter((t) => t.status === 'To do').length,
      'In progress': tasks.filter((t) => t.status === 'In progress').length,
      Completed: tasks.filter((t) => t.status === 'Completed').length
    };
  }, [tasks]);

  // Derived filtered tasks using AND logic: Search + Status + Priority
  const visibleTasks = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    return tasks.filter((task) => {
      // 1. Search filter: case-insensitive partial match on title
      const matchesSearch =
        normalizedQuery === '' ||
        (task.title && task.title.toLowerCase().includes(normalizedQuery));

      // 2. Status filter
      const matchesStatus =
        statusFilter === 'All' || task.status === statusFilter;

      // 3. Priority filter
      const matchesPriority =
        priorityFilter === 'All' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchText, statusFilter, priorityFilter]);

  const hasActiveFilters =
    searchText.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All';

  // Task CRUD operations
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = (taskData) => {
    if (editingTask) {
      // Edit existing task by ID
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? taskData : t))
      );
    } else {
      // Prepend newly created task to top
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

  const handleDeleteRequest = (task) => {
    setDeleteTarget(task);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('All');
    setPriorityFilter('All');
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
      />

      <div className="app-main-wrapper">
        {/* Top Header */}
        <Header
          isSidebarOpen={isMobileMenuOpen}
          onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
          onOpenTaskForm={handleOpenCreateModal}
        />

        {/* Main Content Area */}
        <main id="main-content" className="main-content" tabIndex={-1}>
          {/* Section 1: Metrics Overview */}
          <section className="stats-grid" aria-label="Task progress summary">
            <StatCard
              title="Total Tasks"
              value={stats.total}
              icon={CheckSquare}
              subtitle="All registered backlog items"
              variant="total"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={Clock}
              subtitle="Currently active sprint work"
              variant="progress"
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle2}
              subtitle="Successfully delivered"
              variant="completed"
            />
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              icon={TrendingUp}
              subtitle="Sprint velocity indicator"
              progressBar={true}
              progressValue={stats.completionRate}
              variant="rate"
            />
          </section>

          {/* Section 2: Focus Notes Carousel */}
          <FocusNotes />

          {/* Section 3: Task Management Dashboard Panel */}
          <section className="task-section" aria-label="Tasks workspace">
            <div className="task-section__header">
              <div className="task-section__title-wrap">
                <h2 className="task-section__title">Work Items</h2>
                <span className="task-section__count-tag">
                  {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <div className="task-section__controls">
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  onClear={() => setSearchText('')}
                />
              </div>
            </div>

            <FilterTabs
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              statusCounts={statusCounts}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />

            <TaskList
              tasks={visibleTasks}
              totalTaskCount={tasks.length}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteRequest}
              onStatusChange={handleStatusChange}
              onCreateClick={handleOpenCreateModal}
              onResetFilters={handleResetFilters}
            />
          </section>
        </main>
      </div>

      {/* Task Creation & Editing Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
      />

      {/* Task Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        taskTitle={deleteTarget?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default App;
