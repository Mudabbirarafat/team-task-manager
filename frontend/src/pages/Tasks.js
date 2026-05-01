import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, getStatusColor } from '../utils/helpers';

const STATUS_OPTIONS = ['ALL', 'TODO', 'IN_PROGRESS', 'DONE'];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/tasks')
      .then(res => setTasks(res.data.tasks))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (e) { console.error(e); }
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);
  const isAdmin = user?.role === 'ADMIN';

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''} {filter !== 'ALL' ? `· ${filter.replace('_', ' ')}` : ''}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              border: '1px solid',
              borderColor: filter === s ? 'var(--accent)' : 'var(--border2)',
              background: filter === s ? 'var(--accent-dim)' : 'transparent',
              color: filter === s ? 'var(--accent-light)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {s.replace('_', ' ')}
            <span style={{ marginLeft: 6, fontSize: 11 }}>
              ({s === 'ALL' ? tasks.length : tasks.filter(t => t.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <div style={{ fontSize: 36 }}>◻</div>
          <p>{filter === 'ALL' ? 'No tasks found.' : `No ${filter.replace('_', ' ')} tasks.`}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(task => {
            const overdue = isOverdue(task.dueDate, task.status);
            // 
            const canEdit = isAdmin || task.assignedTo?._id?.toString() === user?.id?.toString();
            return (
              <div key={task._id} className="card" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', gap: 16,
                borderLeft: `3px solid ${overdue ? 'var(--danger)' : getStatusColor(task.status)}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{task.title}</span>
                    {overdue && <span className="badge badge-overdue" style={{ fontSize: 10 }}>OVERDUE</span>}
                  </div>
                  {task.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                      {task.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>📁 {task.projectId?.name}</span>
                    {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                    <span>📅 {formatDate(task.dueDate)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(task._id, e.target.value)}
                    disabled={!canEdit}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border2)',
                      color: getStatusColor(task.status), borderRadius: 6, padding: '5px 10px',
                      fontSize: 12, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.5 }}>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>✕</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
