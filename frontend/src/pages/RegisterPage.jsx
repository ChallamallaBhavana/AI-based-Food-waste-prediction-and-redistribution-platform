import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Store, HeartHandshake, Shield } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'restaurant',
    restaurant_name: '',
    location: '',
    ngo_name: '',
    capacity: 100,
    food_requirement: 'All Cooked Meals'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(formData);
      if (user.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else if (user.role === 'ngo') {
        navigate('/ngo/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
      <div className="card" style={{ maxWidth: 540, width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Create an Account</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 6 }}>
            Join the automated surplus recovery and redistribution network
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
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'restaurant' })}
                style={{
                  padding: '10px 8px',
                  borderRadius: 8,
                  border: formData.role === 'restaurant' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  backgroundColor: formData.role === 'restaurant' ? '#ecfdf5' : '#ffffff',
                  color: formData.role === 'restaurant' ? '#065f46' : '#64748b',
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
                onClick={() => setFormData({ ...formData, role: 'ngo' })}
                style={{
                  padding: '10px 8px',
                  borderRadius: 8,
                  border: formData.role === 'ngo' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  backgroundColor: formData.role === 'ngo' ? '#e0f2fe' : '#ffffff',
                  color: formData.role === 'ngo' ? '#075985' : '#64748b',
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
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                style={{
                  padding: '10px 8px',
                  borderRadius: 8,
                  border: formData.role === 'admin' ? '2px solid #7e22ce' : '1px solid #e2e8f0',
                  backgroundColor: formData.role === 'admin' ? '#f3e8ff' : '#ffffff',
                  color: formData.role === 'admin' ? '#581c87' : '#64748b',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Reddy"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98480 00000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. manager@kitchen.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              required
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
            />
          </div>

          {/* Conditional Restaurant Fields */}
          {formData.role === 'restaurant' && (
            <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 18, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: 10 }}>Restaurant Details</h4>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Restaurant / Establishment Name</label>
                <input
                  type="text"
                  name="restaurant_name"
                  className="form-control"
                  value={formData.restaurant_name}
                  onChange={handleChange}
                  placeholder="e.g. Deccan Spice Hub"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Address / Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Banjara Hills, Hyderabad"
                />
              </div>
            </div>
          )}

          {/* Conditional NGO Fields */}
          {formData.role === 'ngo' && (
            <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 18, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: 10 }}>NGO Details</h4>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">NGO / Foundation Name</label>
                <input
                  type="text"
                  name="ngo_name"
                  className="form-control"
                  value={formData.ngo_name}
                  onChange={handleChange}
                  placeholder="e.g. Hope Shelter Trust"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Location / Area</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Secunderabad"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Daily Capacity (kg)</label>
                  <input
                    type="number"
                    name="capacity"
                    className="form-control"
                    value={formData.capacity}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Food Requirement</label>
                  <select
                    name="food_requirement"
                    className="form-control"
                    value={formData.food_requirement}
                    onChange={handleChange}
                  >
                    <option value="All Cooked Meals">All Cooked Meals</option>
                    <option value="Vegetarian Only">Vegetarian Only</option>
                    <option value="Cooked Meals & Bakery">Cooked Meals & Bakery</option>
                    <option value="Dry Rations Only">Dry Rations Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.96rem', marginTop: 8 }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'} <UserPlus size={18} />
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.86rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: '#10b981' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
