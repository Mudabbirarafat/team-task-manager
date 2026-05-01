import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, getStatusColor } from '../utils/helpers';

const StatCard = ({ label, value, color, icon }) => (
  <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne', color }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const { stats, recentTasks, projects } = data || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard label="Total Tasks" value={stats?.totalTasks ?? 0} color="var(--accent)" />
        <StatCard label="Completed" value={stats?.completedTasks ?? 0} color="var(--success)" />
        <StatCard label="In Progress" value={stats?.inProgressTasks ?? 0} color="var(--warning)" />
        <StatCard label="Overdue" value={stats?.overdueTasks ?? 0} color="var(--danger)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16 }}>Recent Tasks</h2>
            <Link to="/tasks" style={{ fontSize: 13, color: 'var(--accent-light)' }}>View all →</Link>
          </div>
          {recentTasks?.length === 0 ? (
            <div className="empty-state"><p>No tasks yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentTasks?.map(task => (
                <div key={task._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8,
                  border: `1px solid ${isOverdue(task.dueDate, task.status) ? 'rgba(239,68,68,0.2)' : 'transparent'}`
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {task.projectId?.name} · {formatDate(task.dueDate)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 500,
                    background: `${getStatusColor(task.status)}20`, color: getStatusColor(task.status),
                  }}>{task.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects (admin) or Todo list (member) */}
        {user?.role === 'ADMIN' ? (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16 }}>My Projects ({stats?.totalProjects ?? 0})</h2>
              <Link to="/projects" style={{ fontSize: 13, color: 'var(--accent-light)' }}>View all →</Link>
            </div>
            {projects?.length === 0 ? (
              <div className="empty-state"><p>No projects yet</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projects?.map(p => (
                  <Link to={`/projects/${p._id}`} key={p._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8,
                    transition: 'border-color 0.2s', border: '1px solid transparent',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 20 }}>Task Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'To Do', value: stats?.todoTasks, color: 'var(--text-muted)' },
                { label: 'In Progress', value: stats?.inProgressTasks, color: 'var(--warning)' },
                { label: 'Done', value: stats?.completedTasks, color: 'var(--success)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--text-dim)' }}>{label}</div>
                  <div style={{
                    flex: 3, background: 'var(--surface2)', borderRadius: 999, height: 6, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 999, background: color,
                      width: `${stats?.totalTasks ? (value / stats.totalTasks) * 100 : 0}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color, width: 20, textAlign: 'right' }}>{value ?? 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
