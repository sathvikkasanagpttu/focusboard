/**
 * Date utility functions for calendar rendering, overdue calculation,
 * and date formatting with zero timezone shift.
 */

export function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

export function formatDateToYMD(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d || isNaN(d.getTime())) return dateStr || '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isDateOverdue(dueDateStr, isCompleted = false) {
  if (isCompleted || !dueDateStr) return false;
  const due = parseDate(dueDateStr);
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function isDateThisWeek(dueDateStr) {
  if (!dueDateStr) return false;
  const due = parseDate(dueDateStr);
  if (!due) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sunday as start of current week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  // Saturday as end of current week
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return due >= startOfWeek && due <= endOfWeek;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Builds a month grid matrix (6 weeks of 7 days = 42 cells)
 * for a given year and month (0-indexed).
 */
export function getMonthGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, dayNum);
    days.push({
      dateObj,
      dateString: formatDateToYMD(dateObj),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: isSameDay(dateObj, today)
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    days.push({
      dateObj,
      dateString: formatDateToYMD(dateObj),
      dayNumber: i,
      isCurrentMonth: true,
      isToday: isSameDay(dateObj, today)
    });
  }

  // Next month leading days to complete the 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  const totalNeeded = days.length + remainingCells < 35 ? 35 - days.length : remainingCells;

  for (let i = 1; i <= totalNeeded; i++) {
    const dateObj = new Date(year, month + 1, i);
    days.push({
      dateObj,
      dateString: formatDateToYMD(dateObj),
      dayNumber: i,
      isCurrentMonth: false,
      isToday: isSameDay(dateObj, today)
    });
  }

  return days;
}
