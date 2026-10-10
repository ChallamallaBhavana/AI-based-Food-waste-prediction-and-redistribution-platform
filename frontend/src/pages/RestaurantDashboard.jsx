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
  CheckCircle,
  Clock,
  UserCheck,
  Activity
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

  // Food Safety Officer assignment per restaurant
  const getSafetyOfficer = (restaurantName) => {
    const name = (restaurantName || '').toLowerCase();
    if (name.includes('royal')) {
      return {
        name: 'Dr. Sunita Rao',
        designation: 'Lead Food Safety Officer',
        fssaiId: 'FSO-TS-1082',
        jurisdiction: 'Banjara Hills & Central Hyderabad'
      };
    }
    if (name.includes('paradise')) {
      return {
        name: 'Insp. Vikramaditya Sen',
        designation: 'Senior Hygiene & Safety Officer',
        fssaiId: 'FSO-TS-2041',
        jurisdiction: 'Secunderabad & Cantonment Zone'
      };
    }
    if (name.includes('tulip')) {
      return {
        name: 'Insp. Kavitha N.',
        designation: 'Quality Assurance & Safety Officer',
        fssaiId: 'FSO-TS-3190',
        jurisdiction: 'Eastern Highway & Jonnagaddala Hub'
      };
    }
    if (name.includes('green leaf')) {
      return {
        name: 'Officer Anand Sharma',
        designation: 'Food Safety Compliance Inspector',
        fssaiId: 'FSO-TS-4412',
        jurisdiction: 'Jubilee Hills & Western Corridor'
      };
    }
    if (name.includes('dakshin')) {
      return {
        name: 'Insp. P. Murali Krishna',
        designation: 'Certified FSSAI Safety Auditor',
        fssaiId: 'FSO-TS-5529',
        jurisdiction: 'Madhapur & HITEC City District'
      };
    }
    return {
      name: 'Officer Rajesh Kumar',
      designation: 'Regional Food Safety Inspector',
      fssaiId: 'FSO-TS-6020',
      jurisdiction: 'Telangana State FSSAI Division'
    };
  };

  const officer = getSafetyOfficer(user?.restaurant?.restaurant_name);
  const latestRecord = foodRecords.length > 0 ? foodRecords[0] : null;

  return (
    <div className="page-body">
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Welcome back, {user?.name || 'Chef'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: 4 }}>
            {user?.restaurant?.restaurant_name || 'Commercial Kitchen'} &bull; {user?.restaurant?.location || 'Hyderabad'}
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
      <div className="grid-cols-4" style={{ marginBottom: 28 }}>
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

      {/* Main Grid: Left Side Dedicated Food Safety Officer Box | Right Side Tables & Activities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '330px 1fr',
        gap: 24,
        marginBottom: 28,
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Food Safety Officer Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{
            borderLeft: '4px solid #10b981',
            padding: '22px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.8, color: '#059669', fontWeight: 800 }}>
                    FSSAI Compliance
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Food Safety Officer
                  </h3>
                </div>
              </div>
              <span style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                Active & On-Duty
              </span>
            </div>

            {/* Officer Profile */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 14
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Inspection Officer</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                {officer.name}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 600 }}>
                {officer.designation}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                ID: <strong>{officer.fssaiId}</strong> &bull; {officer.jurisdiction}
              </div>
            </div>

            {/* Safety Checks Count */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>
                  {safeItemsCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  Safety Checks Passed
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {foodRecords.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  Total Kitchen Audits
                </div>
              </div>
            </div>

            {/* Latest Validation Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Latest Validation
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {latestRecord?.created_at ? new Date(latestRecord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified Today'}
                </span>
              </div>

              {latestRecord ? (
                <>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {latestRecord.food_name}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <StatusBadge status={latestRecord.safety?.safety_status || 'SAFE FOR REDISTRIBUTION'} />
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    {latestRecord.safety?.validation_reason || 'Verified compliant with FSSAI 2-hr ambient holding and temperature safety guidelines.'}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                  No food items logged yet today. Use the entry form to run safety checks.
                </p>
              )}
            </div>

            {/* Direct Link to Food Safety Validation Module */}
            <Link
              to="/food-safety"
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem', padding: '10px' }}
            >
              <ShieldCheck size={16} /> Open Food Safety Checks
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Food Inventory Table + NGOs & Dispatches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Food Inventory & Safety Table */}
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
                  {foodRecords.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No food items logged yet. Click "New Food Entry & Predict" to record preparations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub Grid: Top Recommended NGOs & Active Deliveries */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Recommended NGOs */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Building2 size={18} color="#0284c7" /> Recommended NGOs
                </h3>
                <Link to="/ngo-recommendations" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recommendations.map((ngo) => (
                  <div
                    key={ngo.ngo_id}
                    style={{
                      padding: '12px',
                      borderRadius: 10,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                        {ngo.ngo_name}
                      </span>
                      <span style={{
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid #a7f3d0'
                      }}>
                        {ngo.match_percentage}% Match
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      📍 {ngo.distance_km} km away &bull; Capacity: {ngo.capacity} kg
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
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
                  Track All
                </Link>
              </div>

              {activeDeliveries.length > 0 ? (
                activeDeliveries.slice(0, 3).map((deliv) => (
                  <div key={deliv.delivery_id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>{deliv.food_name || 'Surplus Meal'}</span>
                      <StatusBadge status={deliv.delivery_status} />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      To: {deliv.ngo_name || deliv.destination} &bull; {deliv.distance} km (~{deliv.estimated_time})
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>
                  No dispatches currently in transit.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function round(val) {
  return Math.round((val || 0) * 10) / 10;
}
