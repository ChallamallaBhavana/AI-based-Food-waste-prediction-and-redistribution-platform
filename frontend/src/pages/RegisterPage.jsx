import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserPlus, AlertCircle, Store, HeartHandshake, Shield, CheckCircle } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'restaurant',
    restaurant_id: '',
    restaurant_name: '',
    location: '',
    ngo_name: '',
    capacity: 100,
    food_requirement: 'All Cooked Meals'
  });

  const [restaurants, setRestaurants] = useState([
    { restaurant_id: 1, restaurant_name: 'Royal Spice Grand', location: 'Road No. 12, Banjara Hills, Hyderabad' },
    { restaurant_id: 2, restaurant_name: 'Paradise Heritage Kitchen', location: 'MG Road, Secunderabad, Hyderabad' },
    { restaurant_id: 3, restaurant_name: 'Tulips Multi-Cuisine Restaurant', location: 'Jonnagaddala Gudem, Nalgonda Highway, Hyderabad' },
    { restaurant_id: 4, restaurant_name: 'Green Leaf Gourmet', location: 'Road No. 36, Jubilee Hills, Hyderabad' },
    { restaurant_id: 5, restaurant_name: 'Dakshin Coastal Kitchen', location: 'Inorbit Mall Road, Madhapur, HITEC City, Hyderabad' }
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear any stale error when the Register page loads and fetch available restaurants from backend
  useEffect(() => {
    setError('');
    async function loadRestaurants() {
      try {
        const res = await api.getAvailableRestaurants();
        if (res && res.restaurants && res.restaurants.length > 0) {
          setRestaurants(res.restaurants);
        }
      } catch (err) {
        console.warn('Could not load restaurants from API, using default list:', err);
      }
    }
    loadRestaurants();
  }, []);

  const handleChange = (e) => {
    if (error) setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRestaurantChange = (e) => {
    if (error) setError('');
    const selectedId = e.target.value;
    const matched = restaurants.find(r => String(r.restaurant_id) === String(selectedId));
    if (matched) {
      setFormData(prev => ({
        ...prev,
        restaurant_id: matched.restaurant_id,
        restaurant_name: matched.restaurant_name,
        location: matched.location || prev.location
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        restaurant_id: '',
        restaurant_name: ''
      }));
    }
  };

  const handleRoleChange = (selectedRole) => {
    if (error) setError('');
    setFormData(prev => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Full name validation
    const trimmedName = (formData.name || '').trim();
    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    // 2. Email format validation
    const trimmedEmail = (formData.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // 3. Contact Phone validation
    const cleanPhone = (formData.phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid contact phone number with at least 10 digits.');
      return;
    }

    // 4. Password validation
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 5. Role-specific validation
    if (formData.role === 'restaurant') {
      if (!formData.restaurant_id || !formData.restaurant_name) {
        setError('Please select a restaurant from the list.');
        return;
      }
      if (!formData.location.trim()) {
        setError('Please enter your restaurant location / address.');
        return;
      }
    } else if (formData.role === 'ngo') {
      if (!formData.ngo_name.trim()) {
        setError('Please enter your NGO or charity foundation name.');
        return;
      }
      if (!formData.location.trim()) {
        setError('Please enter your NGO address / delivery area.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        restaurant_id: formData.restaurant_id ? Number(formData.restaurant_id) : undefined,
        name: trimmedName,
        email: trimmedEmail,
        phone: formData.phone.trim()
      };

      await register(payload);

      // Redirect directly to login flow with success notification
      navigate('/login', {
        state: {
          message: 'Account registered successfully! Please sign in with your email and password.',
          registeredEmail: trimmedEmail
        }
      });
    } catch (err) {
      setError(err.message || 'Registration could not be completed. Please try again.');
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
            Join FoodRescue to predict food surplus and connect with community recipients
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
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
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
                onClick={() => handleRoleChange('restaurant')}
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
                onClick={() => handleRoleChange('ngo')}
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
                <HeartHandshake size={18} /> NGO / Recipient
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
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
                placeholder="+91 98480 12345"
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
                <select
                  name="restaurant_id"
                  required
                  className="form-control"
                  value={formData.restaurant_id || ''}
                  onChange={handleRestaurantChange}
                >
                  <option value="">-- Select a Restaurant --</option>
                  {restaurants.map((rest) => (
                    <option key={rest.restaurant_id} value={rest.restaurant_id}>
                      {rest.restaurant_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Address / Location</label>
                <input
                  type="text"
                  name="location"
                  required
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
                  required
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
                  required
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Secunderabad, Hyderabad"
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
