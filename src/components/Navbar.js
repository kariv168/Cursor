import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiUser, FiShoppingCart } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <FiShoppingCart className="navbar-brand-icon" />
        SuperMarket System
      </Link>
      
      <ul className="navbar-nav">
        <li>
          <Link 
            to="/dashboard" 
            className={isActiveRoute('/dashboard') ? 'active' : ''}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/sales" 
            className={isActiveRoute('/sales') ? 'active' : ''}
          >
            Sales Data
          </Link>
        </li>
        {isAdmin() && (
          <li>
            <Link 
              to="/users" 
              className={isActiveRoute('/users') ? 'active' : ''}
            >
              User Management
            </Link>
          </li>
        )}
      </ul>
      
      <div className="navbar-user">
        <div className="navbar-user-info">
          <span className="navbar-user-name">
            <FiUser size={16} style={{ marginRight: '5px' }} />
            {user?.name || user?.email}
          </span>
          <span className="navbar-user-role">
            {user?.role_name || user?.role || 'User'}
          </span>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="navbar-logout"
          title="Logout"
        >
          <FiLogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;