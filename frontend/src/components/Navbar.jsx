import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, LogOut, User as UserIcon, Shield, Store, HeartHandshake } from 'lucide-react';

export function Navbar() {
  const { user, logout, quickSwitch } = useAuth();
  const navigate = useNavigate();

  const handleDemoSwitch = async (e) => {
    const selected = e.target.value;
    if (!selected) return;

    if (selected === 'restaurant') {
      await quickSwitch('restaurant@example.com', 'password123', 'restaurant');
      navigate('/restaurant/dashboard');
    } else if (selected === 'ngo') {
      await quickSwitch('ngo@example.com', 'password123', 'ngo');
      navigate('/ngo/dashboard');
    } else if (selected === 'admin') {
      await quickSwitch('admin@example.com', 'password123', 'admin');
      navigate('/admin/dashboard');
    }
  };

  const getRoleIcon = () => {
    if (!user) return <UserIcon size={16} />;
    if (user.role === 'restaurant') return <Store size={16} color="#10b981" />;
    if (user.role === 'ngo') return <HeartHandshake size={16} color="#0284c7" />;
    return <Shield size={16} color="#7e22ce" />;
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Leaf size={20} />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>FOOD RESCUE AI</span>
        </Link>
        <span className="navbar-brand-badge">B.Tech Capstone</span>
      </div>

      <div className="navbar-actions">
        {/* Quick Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Demo Switch:</label>
          <select
            onChange={handleDemoSwitch}
            value={user ? user.role : ''}
            style={{
              padding: '6px 12px',
              fontSize: '0.82rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#334155'
            }}
          >
            <option value="" disabled>Switch Role Demo</option>
            <option value="restaurant">🍳 Restaurant View</option>
            <option value="ngo">🤝 NGO Recipient View</option>
            <option value="admin">🛡️ Admin Overview</option>
          </select>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px',
              backgroundColor: '#f1f5f9',
              borderRadius: 30
            }}>
              {getRoleIcon()}
              <div style={{ lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' }}>
                  {user.role} Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="btn btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              title="Sign Out"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '7px 16px' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
