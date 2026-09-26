import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  HeartHandshake,
  Gift,
  Truck,
  CheckCircle,
  Clock,
  Building2,
  Phone,
  MapPin,
  Sparkles,
  Edit
} from 'lucide-react';

export function NGODashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [capacity, setCapacity] = useState(user?.ngo?.capacity || 150);
  const [availability, setAvailability] = useState(user?.ngo?.availability || 'Available');
  const [foodReq, setFoodReq] = useState(user?.ngo?.food_requirement || 'All Cooked Meals');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dons, dels] = await Promise.all([
        api.getDonations(),
        api.getDeliveries()
      ]);
      setDonations(dons || []);
      setDeliveries(dels || []);
    } catch (err) {
      console.error('NGO dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user?.ngo?.ngo_id) return;
    try {
      await api.updateNGO(user.ngo.ngo_id, {
        capacity: parseFloat(capacity),
        availability,
        food_requirement: foodReq
      });
      setIsEditModalOpen(false);
      alert('NGO capacity and preferences updated!');
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleAcceptDonation = async (donationId) => {
    try {
      await api.updateDonationStatus(donationId, 'Accepted');
      alert('Donation accepted! Pickup and delivery order confirmed.');
      loadData();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const pendingDonations = donations.filter(d => d.status === 'Pending');
  const activeDeliveries = deliveries.filter(d => d.delivery_status !== 'Delivered');
  const completedDonations = donations.filter(d => d.status === 'Delivered');
  const totalFoodReceived = completedDonations.reduce((acc, d) => acc + (d.donation_quantity || 0), 0);

  return (
    <div className="page-body">
      {/* Top Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284c7', fontSize: '0.86rem', fontWeight: 700 }}>
            <Sparkles size={16} /> NGO FOOD RECIPIENT REPOSITORY
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            {user?.ngo?.ngo_name || 'Annapurna Seva Trust'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Managed by {user?.name || 'Administrator'} &bull; 📍 {user?.ngo?.location || 'Hyderabad'}
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="btn btn-secondary"
          style={{ padding: '9px 16px' }}
        >
          <Edit size={16} /> Update Intake Capacity
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-4">
        <StatCard
          title="Total Food Received"
          value={round(totalFoodReceived)}
          unit="kg"
          icon={Gift}
          color="emerald"
          change="Distribute to community"
        />
        <StatCard
          title="Daily Intake Capacity"
          value={capacity}
          unit="kg/day"
          icon={Building2}
          color="blue"
          change={`Requirement: ${foodReq}`}
        />
        <StatCard
          title="Incoming In-Transit"
          value={activeDeliveries.length}
          unit="deliveries"
          icon={Truck}
          color="amber"
          change="Vehicles on route"
        />
        <StatCard
          title="Pending Confirmations"
          value={pendingDonations.length}
          unit="offers"
          icon={Clock}
          color="purple"
          change="Awaiting acceptance"
        />
      </div>

      {/* Main Grid: Incoming Offers & Delivery Tracking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Incoming Food Donations Queue */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Gift size={20} color="#10b981" /> Available Surplus Donations
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Surplus food dispatches assigned to your NGO
              </p>
            </div>
            <span className="badge badge-info">{donations.length} total</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Source Restaurant</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((don) => (
                  <tr key={don.donation_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{don.food_name || 'Cooked Meal'}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {don.donation_date ? new Date(don.donation_date).toLocaleTimeString() : 'Today'}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#059669' }}>{don.donation_quantity} kg</strong>
                    </td>
                    <td>{don.restaurant_name || 'Partner Kitchen'}</td>
                    <td>
                      <StatusBadge status={don.status} />
                    </td>
                    <td>
                      {don.status === 'Pending' ? (
                        <button
                          onClick={() => handleAcceptDonation(don.donation_id)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          Accept
                        </button>
                      ) : don.delivery_id ? (
                        <button
                          onClick={() => navigate(`/deliveries?id=${don.delivery_id}`)}
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        >
                          Track Delivery
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Confirmed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Active Transport Monitor */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Truck size={18} color="#0284c7" /> Live Fleet Deliveries
            </h3>
            <Link to="/deliveries" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Live Map
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeDeliveries.length > 0 ? (
              activeDeliveries.map((deliv) => (
                <div
                  key={deliv.delivery_id}
                  style={{
                    padding: '14px',
                    borderRadius: 10,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                      {deliv.food_name || 'Hot Meal Dispatch'}
                    </strong>
                    <StatusBadge status={deliv.delivery_status} />
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    From: {deliv.pickup_location}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                    <span>Distance: {deliv.distance} km</span>
                    <span style={{ color: '#059669' }}>ETA: {deliv.estimated_time}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/deliveries?id=${deliv.delivery_id}`)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.76rem', width: '100%', marginTop: 4 }}
                  >
                    Open Live Delivery Map
                  </button>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0', fontSize: '0.88rem' }}>
                All deliveries completed. No trucks currently on road.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Capacity Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update NGO Capacity & Food Preferences"
        footer={
          <>
            <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleUpdateProfile} className="btn btn-primary">
              Save Changes
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Intake Capacity (kg/day)</label>
            <input
              type="number"
              className="form-control"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Availability Status</label>
            <select
              className="form-control"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="Available">Available (Accepting Surplus)</option>
              <option value="Busy">Busy / Near Full Capacity</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Food Requirement Dietary Type</label>
            <select
              className="form-control"
              value={foodReq}
              onChange={(e) => setFoodReq(e.target.value)}
            >
              <option value="All Cooked Meals">All Cooked Meals</option>
              <option value="Vegetarian Only">Vegetarian Only</option>
              <option value="Cooked Meals & Bakery">Cooked Meals & Bakery</option>
              <option value="Dry Rations Only">Dry Rations Only</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function round(val) {
  return Math.round((val || 0) * 10) / 10;
}
