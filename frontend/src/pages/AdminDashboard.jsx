import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Shield,
  Users,
  Store,
  Building2,
  UtensilsCrossed,
  Gift,
  Truck,
  FileText,
  Trash2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [reports, setReports] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [ovRes, userRes, restRes, ngoRes, repRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminRestaurants(),
        api.getNGOs(),
        api.getAdminReports()
      ]);
      setOverview(ovRes);
      setUsers(userRes || []);
      setRestaurants(restRes || []);
      setNgos(ngoRes || []);
      setReports(repRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user #${userId}?`)) return;
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.user_id !== userId));
      alert('User deleted successfully.');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7e22ce', fontSize: '0.86rem', fontWeight: 700 }}>
          <Shield size={16} /> CENTRAL GOVERNANCE & SYSTEM AUDIT
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
          Administrative Control Center
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Platform-wide oversight across registered food businesses, recipient organizations, machine learning services, and dispatch logistics.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-cols-4" style={{ marginBottom: 28 }}>
        <StatCard
          title="Registered Users"
          value={overview?.total_users || 5}
          unit="accounts"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Restaurant Partners"
          value={overview?.total_restaurants || 2}
          unit="kitchens"
          icon={Store}
          color="emerald"
        />
        <StatCard
          title="NGO Recipient Centers"
          value={overview?.total_ngos || 4}
          unit="shelters"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Surplus Entries"
          value={overview?.total_food_records || 4}
          unit="logged"
          icon={UtensilsCrossed}
          color="amber"
        />
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 12,
        borderBottom: '1px solid #e2e8f0',
        marginBottom: 24,
        paddingBottom: 2
      }}>
        {[
          { id: 'users', label: 'Platform Users', icon: Users },
          { id: 'restaurants', label: 'Restaurant Directory', icon: Store },
          { id: 'ngos', label: 'NGO Roster', icon: Building2 },
          { id: 'reports', label: 'System & ML Health Reports', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '3px solid #7e22ce' : '3px solid transparent',
                color: isActive ? '#7e22ce' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>All System Users</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Affiliation / Entity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td>#{u.user_id}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : (u.role === 'restaurant' ? 'badge-success' : 'badge-info')}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.entity_name}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.user_id)}
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Restaurants */}
      {activeTab === 'restaurants' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Partner Restaurants</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Restaurant Name</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Manager Account</th>
                  <th>Food Records Logged</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.restaurant_id}>
                    <td style={{ fontWeight: 700 }}>{r.restaurant_name}</td>
                    <td>{r.location}</td>
                    <td>{r.contact}</td>
                    <td style={{ color: '#0284c7' }}>{r.user_email || 'Linked Account'}</td>
                    <td>
                      <span className="badge badge-success">{r.records_count} logged entries</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: NGOs */}
      {activeTab === 'ngos' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Verified NGOs & Redistribution Hubs</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>NGO Name</th>
                  <th>Location</th>
                  <th>Contact Phone</th>
                  <th>Dietary Requirement</th>
                  <th>Daily Intake Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ngos.map((n) => (
                  <tr key={n.ngo_id}>
                    <td style={{ fontWeight: 700 }}>{n.ngo_name}</td>
                    <td>{n.location}</td>
                    <td>{n.contact_phone}</td>
                    <td>
                      <span className="badge badge-info">{n.food_requirement}</span>
                    </td>
                    <td><strong>{n.capacity} kg/day</strong></td>
                    <td>
                      <span className="badge badge-success">{n.availability}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: System & ML Reports */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              <Sparkles size={18} color="#7e22ce" /> Machine Learning & Regulatory Framework Audit
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Model Artifact Architecture
                </span>
                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: 4 }}>
                  Scikit-learn RandomForestRegressor + Classifier
                </p>
                <div style={{ fontSize: '0.82rem', color: '#059669', marginTop: 6 }}>
                  ✓ Surplus Regressor R² Score: 0.5324<br />
                  ✓ Mean Absolute Error (MAE): 7.25 kg<br />
                  ✓ Waste Risk Accuracy: 69.67%
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  FSSAI Food Safety Rule Engine
                </span>
                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: 4 }}>
                  Active Compliance Framework
                </p>
                <div style={{ fontSize: '0.82rem', color: '#0284c7', marginTop: 6 }}>
                  ✓ 2h/4h Ambient Thermal Threshold<br />
                  ✓ Danger Zone (5°C–60°C) Verification<br />
                  ✓ Safe for Redistribution Standard
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Haversine Recommendation Engine
                </span>
                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: 4 }}>
                  Multi-Factor Matching Service
                </p>
                <div style={{ fontSize: '0.82rem', color: '#7e22ce', marginTop: 6 }}>
                  ✓ 4 Weighted Pillars (Distance, Capacity, Dietary, Availability)<br />
                  ✓ Dynamic Transit ETA Routing
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              Recent Audit Log of Deliveries
            </h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Delivery ID</th>
                    <th>Pickup Kitchen</th>
                    <th>Destination NGO</th>
                    <th>Distance</th>
                    <th>ETA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports?.recent_deliveries?.map((d) => (
                    <tr key={d.delivery_id}>
                      <td>#{d.delivery_id}</td>
                      <td>{d.pickup_location}</td>
                      <td>{d.destination}</td>
                      <td>{d.distance} km</td>
                      <td>{d.estimated_time}</td>
                      <td><StatusBadge status={d.delivery_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
