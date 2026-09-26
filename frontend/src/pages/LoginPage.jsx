import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Store, HeartHandshake, Shield, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { login, quickSwitch } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('restaurant@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('restaurant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, role);
      if (user.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else if (user.role === 'ngo') {
        navigate('/ngo/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (r, e, p) => {
    setRole(r);
    setEmail(e);
    setPassword(p);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      backgroundColor: '#f8fafc'
    }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Sign In to Portal</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 6 }}>
            Access the Food Waste Prediction & Redistribution System
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: '0.86rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selector Tabs */}
          <div className="form-group">
            <label className="form-label">Select Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => setDemoCredentials('restaurant', 'restaurant@example.com', 'password123')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 8,
                  border: role === 'restaurant' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  backgroundColor: role === 'restaurant' ? '#ecfdf5' : '#ffffff',
                  color: role === 'restaurant' ? '#065f46' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                <Store size={18} /> Restaurant
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('ngo', 'ngo@example.com', 'password123')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 8,
                  border: role === 'ngo' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  backgroundColor: role === 'ngo' ? '#e0f2fe' : '#ffffff',
                  color: role === 'ngo' ? '#075985' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                <HeartHandshake size={18} /> NGO
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('admin', 'admin@example.com', 'password123')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 8,
                  border: role === 'admin' ? '2px solid #7e22ce' : '1px solid #e2e8f0',
                  backgroundColor: role === 'admin' ? '#f3e8ff' : '#ffffff',
                  color: role === 'admin' ? '#581c87' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                <Shield size={18} /> Admin
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. restaurant@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.96rem', marginTop: 10 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <LogIn size={18} />
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.86rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: '#10b981' }}>
            Register here
          </Link>
        </div>

        {/* Quick Demo Help */}
        <div style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.78rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: '#f59e0b' }} />
          Tip: Click any role button above to auto-fill pre-seeded credentials.
        </div>
      </div>
    </div>
  );
}
