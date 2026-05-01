import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, getStatusColor, getErrorMessage } from '../utils/helpers';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [memberUserId, setMemberUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchData();
    if (user?.role === 'ADMIN') {
      api.get('/projects/users').then(res => setUsers(res.data.users)).catch(console.error);
    }
  }, [fetchData, user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/tasks', { ...taskForm, projectId: id });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', dueDate: '' });
      fetchData();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post(`/projects/${id}/members`, { userId: memberUserId });
      setShowMemberModal(false);
      setMemberUserId('');
      fetchData();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));
    } catch (e) { console.error(e); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="spinner" />;
  if (!project) return <div className="card"><p>Project not found.</p></div>;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Link to="/projects" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Projects</Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => { setError(''); setShowMemberModal(true); }}>+ Member</button>
            <button className="btn btn-primary" onClick={() => { setError(''); setShowTaskModal(true); }}>+ Task</button>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>TEAM MEMBERS</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {project.members?.map(m => (
            <div key={m._id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', background: 'var(--surface2)', borderRadius: 999, fontSize: 13,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--accent-light)', fontWeight: 700 }}>
                {m.name[0]}
              </div>
              {m.name}
              <span className={`badge badge-${m.role?.toLowerCase()}`} style={{ fontSize: 10 }}>{m.role}</span>
            </div>
          ))}
          {project.members?.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No members yet</p>}
        </div>
      </div>

      {/* Tasks */}
      <h2 style={{ fontSize: 16, marginBottom: 16 }}>Tasks ({tasks.length})</h2>
      {tasks.length === 0 ? (
        <div className="empty-state card"><div style={{ fontSize: 36 }}>◻</div><p>No tasks yet</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => {
            const overdue = isOverdue(task.dueDate, task.status);
            return (
              <div key={task._id} className="card" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', borderLeft: `3px solid ${getStatusColor(task.status)}`,
                ...(overdue ? { borderColor: 'var(--danger)' } : {}),
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{task.title}</span>
                    {overdue && <span className="badge badge-overdue" style={{ fontSize: 10 }}>OVERDUE</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Assigned to <strong style={{ color: 'var(--text-dim)' }}>{task.assignedTo?.name}</strong>
                    {' · '}Due: {formatDate(task.dueDate)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(task._id, e.target.value)}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: getStatusColor(task.status),
                      borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}
                    // 
                    disabled={!isAdmin && task.assignedTo?._id?.toString() !== user?.id?.toString()}>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>✕</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">New Task</h2>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Task title"
                  value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} placeholder="Optional description"
                  value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Assign To *</label>
                <select className="form-input" value={taskForm.assignedTo}
                  onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })} required>
                  <option value="">Select member…</option>
                  {project.members?.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add Member</h2>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Select User</label>
                <select className="form-input" value={memberUserId}
                  onChange={e => setMemberUserId(e.target.value)} required>
                  <option value="">Choose a user…</option>
                  {users.filter(u => !project.members?.find(m => m._id === u._id)).map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email}) — {u.role}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
