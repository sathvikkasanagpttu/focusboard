import { isDateOverdue, isDateThisWeek } from './dateUtils';

/**
 * Computes analytics and aggregated metrics derived from the tasks state.
 */
export function calculateTaskStats(tasks = []) {
  const total = tasks.length;
  const statusCounts = {
    'To do': 0,
    'In progress': 0,
    Completed: 0
  };

  const priorityCounts = {
    High: 0,
    Medium: 0,
    Low: 0
  };

  const categoryCounts = {
    Design: 0,
    Development: 0,
    Testing: 0,
    Research: 0
  };

  let overdueCount = 0;
  let dueThisWeekCount = 0;

  tasks.forEach((task) => {
    const isCompleted = task.status === 'Completed';

    // Status
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status] += 1;
    } else {
      statusCounts[task.status] = 1;
    }

    // Priority
    if (priorityCounts[task.priority] !== undefined) {
      priorityCounts[task.priority] += 1;
    } else {
      priorityCounts[task.priority] = 1;
    }

    // Category
    const cat = task.category || 'Other';
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat] += 1;
    } else {
      categoryCounts[cat] = 1;
    }

    // Overdue
    if (isDateOverdue(task.dueDate, isCompleted)) {
      overdueCount += 1;
    }

    // Due this week
    if (isDateThisWeek(task.dueDate)) {
      dueThisWeekCount += 1;
    }
  });

  const completed = statusCounts['Completed'] || 0;
  const inProgress = statusCounts['In progress'] || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categories = Object.keys(categoryCounts);
  const activeCategoriesCount = categories.length || 1;
  const avgTasksPerCategory = total > 0 ? (total / activeCategoriesCount).toFixed(1) : '0';

  return {
    total,
    completed,
    inProgress,
    completionRate,
    overdueCount,
    dueThisWeekCount,
    avgTasksPerCategory,
    statusCounts,
    priorityCounts,
    categoryCounts
  };
}
