export const getStatusColor = (status) => {
  const map = { TODO: '#94a3b8', IN_PROGRESS: '#f59e0b', DONE: '#22c55e' };
  return map[status] || '#94a3b8';
};
export const formatDate = (dateStr) => {
  if (!dateStr) return 'No due date';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'DONE') return false;
  return new Date(dueDate) < new Date();
};
export const getErrorMessage = (error) => {
  if (error.response?.data?.errors) return error.response.data.errors.map((e) => e.msg).join(', ');
  return error.response?.data?.message || 'Something went wrong';
};
