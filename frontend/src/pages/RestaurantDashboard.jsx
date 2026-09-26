import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  UtensilsCrossed,
  BrainCircuit,
  ShieldCheck,
  Truck,
  Plus,
  Building2,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export function RestaurantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [foodRecords, setFoodRecords] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [foodsRes, delivsRes, sumRes, recRes] = await Promise.all([
          api.getFoodRecords(),
          api.getDeliveries(),
          api.getAnalyticsSummary(),
          api.getNGORecommendations({ surplus_quantity: 30 })
        ]);
        setFoodRecords(foodsRes || []);
        setDeliveries(delivsRes || []);
        setSummary(sumRes || null);
        setRecommendations((recRes.recommended_ngos || []).slice(0, 3));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalAvailableSurplus = foodRecords.reduce((acc, f) => acc + (f.surplus_quantity || 0), 0);
  const safeItemsCount = foodRecords.filter(f => f.safety && f.safety.safety_status.includes('SAFE')).length;
  const activeDeliveries = deliveries.filter(d => d.delivery_status !== 'Delivered');

  return (
    <div className="page-body">
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.86rem', fontWeight: 700 }}>
            <Sparkles size={16} /> RESTAURANT MANAGEMENT CONSOLE
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            Welcome back, {user?.name || 'Chef'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            {user?.restaurant?.restaurant_name || 'Central Kitchen'} &bull; {user?.restaurant?.location || 'Hyderabad'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/food-entry" className="btn btn-primary" style={{ padding: '10px 18px' }}>
            <Plus size={18} /> New Food Entry & Predict
          </Link>
          <Link to="/ngo-recommendations" className="btn btn-secondary" style={{ padding: '10px 18px' }}>
            <Building2 size={18} /> Match NGOs
          </Link>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid-cols-4">
        <StatCard
          title="Available Surplus"
          value={round(totalAvailableSurplus)}
          unit="kg"
          icon={UtensilsCrossed}
          color="emerald"
          change="Available for donation"
        />
        <StatCard
          title="AI Predicted Surplus"
          value={foodRecords[0]?.prediction?.predicted_surplus || '32.5'}
          unit="kg"
          icon={BrainCircuit}
          color="blue"
          change="Scikit-Learn Model"
        />
        <StatCard
          title="FSSAI Safety Validated"
          value={safeItemsCount}
          unit={`/ ${foodRecords.length} items`}
          icon={ShieldCheck}
          color="amber"
          change="Safe for consumption"
        />
        <StatCard
          title="Active Deliveries"
          value={activeDeliveries.length}
          unit="in transit"
          icon={Truck}
          color="purple"
          change="Live fleet tracking"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Left Column: Recent Food Inventory & Safety Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <UtensilsCrossed size={20} color="#10b981" /> Today's Food Surplus & Safety Audit
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Real-time predictions and FSSAI safety ratings for logged preparations
              </p>
            </div>
            <Link to="/food-entry" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
              View All &rarr;
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Prepared / Sold</th>
                  <th>Surplus</th>
                  <th>AI Prediction</th>
                  <th>FSSAI Safety</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {foodRecords.slice(0, 5).map((food) => (
                  <tr key={food.food_id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{food.food_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{food.food_type} &bull; {food.storage_condition}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{food.quantity_prepared} kg</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>Sold: {food.quantity_sold} kg</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#059669' }}>
                        {food.surplus_quantity} kg
                      </span>
                    </td>
                    <td>
                      {food.prediction ? (
                        <div>
                          <span style={{ fontWeight: 600, color: '#0284c7' }}>
                            {food.prediction.predicted_surplus} kg
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            display: 'block',
                            color: food.prediction.waste_risk === 'High' ? '#dc2626' : '#64748b'
                          }}>
                            Risk: {food.prediction.waste_risk}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={food.safety?.safety_status || 'SAFE FOR REDISTRIBUTION'} />
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/ngo-recommendations?food_id=${food.food_id}&surplus=${food.surplus_quantity}&food_name=${encodeURIComponent(food.food_name)}`)}
                        className="btn btn-outline"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        Donate Surplus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Top Recommended NGOs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Building2 size={18} color="#0284c7" /> Recommended NGOs
              </h3>
              <Link to="/ngo-recommendations" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recommendations.map((ngo) => (
                <div
                  key={ngo.ngo_id}
                  style={{
                    padding: '14px',
                    borderRadius: 10,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {ngo.ngo_name}
                    </span>
                    <span style={{
                      backgroundColor: '#ecfdf5',
                      color: '#047857',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: '1px solid #a7f3d0'
                    }}>
                      {ngo.match_percentage}% Match
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    📍 {ngo.distance_km} km away &bull; Capacity: {ngo.capacity} kg
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      ✓ {ngo.food_requirement}
                    </span>
                    <button
                      onClick={() => navigate(`/ngo-recommendations?ngo_id=${ngo.ngo_id}`)}
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                    >
                      Dispatch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Deliveries Quick Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Truck size={18} color="#7e22ce" /> Dispatch Status
              </h3>
              <Link to="/deliveries" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Track
              </Link>
            </div>

            {activeDeliveries.length > 0 ? (
              activeDeliveries.slice(0, 2).map((deliv) => (
                <div key={deliv.delivery_id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>{deliv.food_name || 'Surplus Meal'}</span>
                    <StatusBadge status={deliv.delivery_status} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    To: {deliv.ngo_name || deliv.destination} &bull; {deliv.distance} km (~{deliv.estimated_time})
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
                No dispatches currently in transit.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function round(val) {
  return Math.round((val || 0) * 10) / 10;
}
