// src/utils/index.js

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function getRoleBadgeClass(role) {
  const map = {
    ADMIN: 'badge-primary',
    SCHOOL_ADMIN: 'badge-info',
    TEACHER: 'badge-warning',
    STUDENT: 'badge-success',
  };
  return map[role] || 'badge-neutral';
}

export function getStatusBadgeClass(status) {
  const map = {
    ACTIVE: 'badge-success',
    TRANSFERRED: 'badge-info',
    GRADUATED: 'badge-primary',
    WITHDRAWN: 'badge-warning',
    DECEASED: 'badge-neutral',
    PENDING: 'badge-warning',
    SENDING_APPROVED: 'badge-info',
    RECEIVING_CONFIRMED: 'badge-primary',
    COMPLETED: 'badge-success',
    REJECTED: 'badge-danger',
    CANCELLED: 'badge-neutral',
    PRESENT: 'badge-success',
    ABSENT: 'badge-danger',
    LATE: 'badge-warning',
    EXCUSED: 'badge-info',
  };
  return map[status] || 'badge-neutral';
}

export function getAttendanceCellClass(status) {
  const map = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    EXCUSED: 'excused',
  };
  return map[status] || '';
}

export function getTransferStep(status) {
  const steps = ['PENDING', 'SENDING_APPROVED', 'RECEIVING_CONFIRMED', 'COMPLETED'];
  return steps.indexOf(status);
}

export function formatPercent(value) {
  if (value == null) return '—';
  return `${Number(value).toFixed(1)}%`;
}

export function getGradeClass(grade) {
  if (!grade) return '';
  return `grade-${grade}`;
}
