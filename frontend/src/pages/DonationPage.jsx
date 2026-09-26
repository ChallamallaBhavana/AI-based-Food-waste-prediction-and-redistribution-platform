import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  Gift,
  Truck,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';

export function DonationPage() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const res = await api.getDonations();
      setDonations(res || []);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter((d) => {
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
    const foodMatch = (d.food_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const ngoMatch = (d.ngo_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const restMatch = (d.restaurant_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && (foodMatch || ngoMatch || restMatch);
  });

  const totalKg = donations.reduce((sum, d) => sum + (d.donation_quantity || 0), 0);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.86rem', fontWeight: 700 }}>
            <Gift size={16} /> REDISTRIBUTION ARCHIVE
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            Food Donations & Allocations
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Comprehensive records of surplus food matched and transferred from restaurants to recipient NGOs.
          </p>
        </div>

        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          padding: '10px 18px',
          borderRadius: 12,
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Food Redistributed
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46' }}>
            {Math.round(totalKg * 10) / 10} kg
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by food item, restaurant, or NGO..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#475569' }}>Status:</span>
          {['All', 'Pending', 'In Transit', 'Delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={filterStatus === s ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Donations Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Food Item</th>
                <th>Quantity</th>
                <th>Provider Restaurant</th>
                <th>Recipient NGO</th>
                <th>Donation Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length > 0 ? (
                filteredDonations.map((don) => (
                  <tr key={don.donation_id}>
                    <td>
                      <strong style={{ color: '#0284c7' }}>#{don.donation_id}</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{don.food_name || 'Cooked Meals'}</strong>
                      {don.notes && (
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{don.notes}</div>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#059669', fontSize: '1rem' }}>
                        {don.donation_quantity} kg
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{don.restaurant_name || 'Partner Kitchen'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{don.ngo_name}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {don.donation_date ? new Date(don.donation_date).toLocaleDateString() : 'Today'}
                    </td>
                    <td>
                      <StatusBadge status={don.status} />
                    </td>
                    <td>
                      {don.delivery_id ? (
                        <button
                          onClick={() => navigate(`/deliveries?id=${don.delivery_id}`)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          <Truck size={14} /> Live Route
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No donations matched the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
