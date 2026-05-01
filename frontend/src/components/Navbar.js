import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-name">TaskFlow</span>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
        <Link to="/projects" className={`nav-link ${isActive('/projects')}`}>Projects</Link>
        <Link to="/tasks" className={`nav-link ${isActive('/tasks')}`}>Tasks</Link>
      </div>
      <div className="navbar-user">
        <span className="user-badge">{user?.role}</span>
        <span className="user-name">{user?.name}</span>
        <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
