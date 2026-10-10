import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, CheckCircle, Store, HeartHandshake, Shield } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('restaurant');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(trimmedEmail, password, role);
      if (user.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else if (user.role === 'ngo') {
        navigate('/ngo/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
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
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Sign In to Portal</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 6 }}>
            Access FoodRescue Food Waste Prediction & Redistribution
          </p>
        </div>

        {/* Success Alert (e.g. from registration redirect) */}
        {successMessage && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: '0.86rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0, color: '#059669' }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
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
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Role Selector */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => { setRole('restaurant'); setError(''); }}
                style={{
                  padding: '9px 6px',
                  borderRadius: 8,
                  border: role === 'restaurant' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  backgroundColor: role === 'restaurant' ? '#ecfdf5' : '#ffffff',
                  color: role === 'restaurant' ? '#065f46' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Store size={16} /> Restaurant
              </button>

              <button
                type="button"
                onClick={() => { setRole('ngo'); setError(''); }}
                style={{
                  padding: '9px 6px',
                  borderRadius: 8,
                  border: role === 'ngo' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  backgroundColor: role === 'ngo' ? '#e0f2fe' : '#ffffff',
                  color: role === 'ngo' ? '#075985' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <HeartHandshake size={16} /> NGO
              </button>

              <button
                type="button"
                onClick={() => { setRole('admin'); setError(''); }}
                style={{
                  padding: '9px 6px',
                  borderRadius: 8,
                  border: role === 'admin' ? '2px solid #7e22ce' : '1px solid #e2e8f0',
                  backgroundColor: role === 'admin' ? '#f3e8ff' : '#ffffff',
                  color: role === 'admin' ? '#581c87' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Shield size={16} /> Admin
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
              onChange={handleEmailChange}
              placeholder="e.g. manager@kitchen.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={handlePasswordChange}
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
      </div>
    </div>
  );
}
