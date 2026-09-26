import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { RouteMap } from '../components/RouteMap';
import { StatusBadge } from '../components/StatusBadge';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const TIMELINE_STEPS = ['Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'];

export function DeliveryTrackingPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetDeliveryId = queryParams.get('id');

  const [deliveries, setDeliveries] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const res = await api.getDeliveries();
      setDeliveries(res || []);

      if (res && res.length > 0) {
        let match = null;
        if (targetDeliveryId) {
          match = res.find(d => String(d.delivery_id) === String(targetDeliveryId));
        }
        selectDelivery(match ? match.delivery_id : res[0].delivery_id);
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectDelivery = async (id) => {
    try {
      const delivDetail = await api.getDelivery(id);
      setActiveDelivery(delivDetail);
    } catch (err) {
      console.error('Error loading delivery detail:', err);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!activeDelivery) return;
    setAdvancing(true);
    try {
      const res = await api.advanceDelivery(activeDelivery.delivery_id);
      // Reload details
      await selectDelivery(activeDelivery.delivery_id);
      // Update list
      loadDeliveries();
    } catch (err) {
      alert('Failed to advance delivery: ' + err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const currentStepIndex = activeDelivery ? TIMELINE_STEPS.indexOf(activeDelivery.delivery_status) : 0;
  const isDelivered = activeDelivery?.delivery_status === 'Delivered';

  return (
    <div className="page-body">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.86rem', fontWeight: 700 }}>
          <Truck size={16} /> MODULE 4: SMART TRANSPORTATION & DISPATCH
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
          Live Delivery Route Tracking
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Real-time GPS coordinate telemetry, dynamic route estimation, and milestone timeline progression.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24 }}>
        {/* Left Column: Delivery Map & Timeline Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {activeDelivery && (
            <div className="card">
              {/* Stepper Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    Dispatch #{activeDelivery.delivery_id}: {activeDelivery.food_name || 'Surplus Meal Package'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Destination: <strong>{activeDelivery.ngo_name || activeDelivery.destination}</strong>
                  </p>
                </div>
                <StatusBadge status={activeDelivery.delivery_status} />
              </div>

              {/* 5-Step Timeline Visualizer */}
              <div className="timeline-stepper">
                <div className="timeline-line">
                  <div
                    className="timeline-line-fill"
                    style={{
                      width: `${(Math.max(0, currentStepIndex) / (TIMELINE_STEPS.length - 1)) * 100}%`
                    }}
                  />
                </div>

                {TIMELINE_STEPS.map((step, idx) => {
                  const isPast = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const stateClass = isPast || (isCurrent && isDelivered) ? 'completed' : (isCurrent ? 'current' : '');

                  return (
                    <div key={step} className={`timeline-step ${stateClass}`}>
                      <div className="step-node">
                        {isPast || (isCurrent && isDelivered) ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '0.76rem',
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? '#059669' : '#64748b',
                        whiteSpace: 'nowrap'
                      }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Advance Status Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                backgroundColor: '#f8fafc',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                marginTop: 10
              }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Current Phase:</span>
                  <strong style={{ fontSize: '0.94rem', color: '#0f172a', marginLeft: 6 }}>
                    {activeDelivery.delivery_status}
                  </strong>
                </div>

                {!isDelivered ? (
                  <button
                    onClick={handleAdvanceStatus}
                    disabled={advancing}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.86rem' }}
                  >
                    {advancing ? 'Updating Fleet...' : 'Simulate Next Milestone'} <ArrowRight size={16} />
                  </button>
                ) : (
                  <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={18} /> Successfully Delivered to NGO
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Interactive Map */}
          <div className="card" style={{ padding: 16 }}>
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              <Navigation size={18} color="#059669" /> Live Route Preview
            </h3>
            {activeDelivery ? (
              <RouteMap
                pickup={activeDelivery.pickup_coords}
                destination={activeDelivery.dest_coords}
                waypoints={activeDelivery.waypoints}
                distance={activeDelivery.distance}
                estimatedTime={activeDelivery.estimated_time}
              />
            ) : (
              <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, color: '#94a3b8' }}>
                Select a delivery from the right to view its live path
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deliveries List Selector & Route Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Telemetry Summary Card */}
          {activeDelivery && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 14 }}>
                <Clock size={18} color="#0284c7" /> Dispatch Metadata
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.86rem' }}>
                <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Pickup Location (Kitchen)
                  </span>
                  <p style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                    📍 {activeDelivery.pickup_location}
                  </p>
                </div>

                <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Drop-off Destination (NGO)
                  </span>
                  <p style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                    🏢 {activeDelivery.destination}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: '10px 14px', backgroundColor: '#ecfdf5', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>Total Distance</span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46' }}>
                      {activeDelivery.distance} km
                    </h4>
                  </div>

                  <div style={{ padding: '10px 14px', backgroundColor: '#e0f2fe', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.74rem', color: '#075985', fontWeight: 700 }}>Estimated Transit</span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0369a1' }}>
                      {activeDelivery.estimated_time}
                    </h4>
                  </div>
                </div>

                {activeDelivery.route && (
                  <p style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
                    Route: {activeDelivery.route}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* All Deliveries List */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              Active Logistics Deliveries
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deliveries.map((del) => (
                <div
                  key={del.delivery_id}
                  onClick={() => selectDelivery(del.delivery_id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: activeDelivery?.delivery_id === del.delivery_id ? '2px solid #10b981' : '1px solid #e2e8f0',
                    backgroundColor: activeDelivery?.delivery_id === del.delivery_id ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                      #{del.delivery_id} &bull; {del.food_name || 'Meal Package'}
                    </strong>
                    <StatusBadge status={del.delivery_status} />
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    To: {del.ngo_name || del.destination} ({del.distance} km)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
