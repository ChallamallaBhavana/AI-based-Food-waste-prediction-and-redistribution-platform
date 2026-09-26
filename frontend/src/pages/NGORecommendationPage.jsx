import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import {
  Building2,
  MapPin,
  CheckCircle2,
  Navigation,
  Sparkles,
  Phone,
  Gift,
  ArrowRight,
  Filter,
  SlidersHorizontal
} from 'lucide-react';

export function NGORecommendationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const initialSurplus = parseFloat(queryParams.get('surplus')) || 30.0;
  const initialFoodName = queryParams.get('food_name') || 'Prepared Surplus Meal';
  const initialFoodId = queryParams.get('food_id') || '';

  const [surplusQty, setSurplusQty] = useState(initialSurplus);
  const [foodName, setFoodName] = useState(initialFoodName);
  const [foodType, setFoodType] = useState('Cooked Meal');
  const [foodId, setFoodId] = useState(initialFoodId);
  const [recommendedNgos, setRecommendedNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Donation Modal state
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donationQuantity, setDonationQuantity] = useState(initialSurplus);
  const [notes, setNotes] = useState('Freshly packed in sanitary insulated containers');
  const [creatingDonation, setCreatingDonation] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [surplusQty, foodType]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.getNGORecommendations({
        surplus_quantity: surplusQty,
        food_name: foodName,
        food_type: foodType,
        food_id: foodId
      });
      setRecommendedNgos(res.recommended_ngos || []);
    } catch (err) {
      console.error('Error fetching NGO recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDonate = (ngo) => {
    setSelectedNgo(ngo);
    setDonationQuantity(surplusQty);
    setIsModalOpen(true);
  };

  const handleConfirmDonation = async () => {
    if (!selectedNgo) return;
    setCreatingDonation(true);
    try {
      // If foodId not set, pick first food record or create donation
      let fId = foodId;
      if (!fId) {
        const foods = await api.getFoodRecords();
        if (foods && foods.length > 0) {
          fId = foods[0].food_id;
        } else {
          // create a quick food record if none exist
          const newF = await api.createFoodEntry({
            food_name: foodName,
            quantity_prepared: surplusQty * 1.5,
            quantity_sold: surplusQty * 0.5,
            surplus_quantity: surplusQty
          });
          fId = newF.food.food_id;
        }
      }

      const res = await api.createDonation({
        food_id: fId,
        ngo_id: selectedNgo.ngo_id,
        donation_quantity: parseFloat(donationQuantity),
        notes: notes
      });

      setIsModalOpen(false);
      alert('Donation successfully created! Delivery dispatch order generated.');
      
      // Navigate to delivery tracking
      if (res.donation?.delivery?.delivery_id) {
        navigate(`/deliveries?id=${res.donation.delivery.delivery_id}`);
      } else {
        navigate('/donations');
      }
    } catch (err) {
      alert('Failed to dispatch donation: ' + err.message);
    } finally {
      setCreatingDonation(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.86rem', fontWeight: 700 }}>
          <Sparkles size={16} /> MODULE 3: ALGORITHMIC NGO MATCHING
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
          Recommended NGO Redistribution Partners
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Our multi-criteria ranking algorithm evaluates geodistance (Haversine formula), intake capacity, dietary compatibility, and real-time NGO availability.
        </p>
      </div>

      {/* Filter / Matching Controls Bar */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: 24, backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <SlidersHorizontal size={18} color="#059669" />
          <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Surplus Matching Parameters</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Surplus Quantity (kg)</label>
            <input
              type="number"
              step="1"
              min="1"
              className="form-control"
              value={surplusQty}
              onChange={(e) => setSurplusQty(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Food Description</label>
            <input
              type="text"
              className="form-control"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Food Category</label>
            <select
              className="form-control"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
            >
              <option value="Cooked Meal">Cooked Meals</option>
              <option value="Bakery">Bakery / Bread</option>
              <option value="Dairy">Dairy / Milk Products</option>
              <option value="Raw Vegetables">Dry Goods / Raw Produce</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {recommendedNgos.map((ngo, index) => {
          const isTopMatch = index === 0;
          return (
            <div
              key={ngo.ngo_id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isTopMatch ? '2px solid #10b981' : '1px solid #e2e8f0',
                position: 'relative'
              }}
            >
              {isTopMatch && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  right: 20,
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: 999,
                  boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
                }}>
                  ★ BEST SUITED PARTNER
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                      {ngo.ngo_name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={14} /> {ngo.location}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: ngo.match_percentage >= 80 ? '#059669' : '#0284c7'
                    }}>
                      {ngo.match_percentage}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Match Score
                    </span>
                  </div>
                </div>

                {/* Match Progress Bar */}
                <div style={{
                  height: 6,
                  backgroundColor: '#e2e8f0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginBottom: 16
                }}>
                  <div style={{
                    height: '100%',
                    width: `${ngo.match_percentage}%`,
                    backgroundColor: ngo.match_percentage >= 80 ? '#10b981' : '#0ea5e9'
                  }} />
                </div>

                {/* Specifications Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 8,
                  marginBottom: 14,
                  fontSize: '0.82rem'
                }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Distance & ETA:</span>
                    <strong>{ngo.distance_km} km (~{ngo.eta_minutes}m)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Intake Capacity:</span>
                    <strong>{ngo.capacity} kg max</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Food Preference:</span>
                    <strong style={{ color: '#059669' }}>{ngo.food_requirement}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Availability:</span>
                    <span className="badge badge-success">{ngo.availability}</span>
                  </div>
                </div>

                {/* Match Justifications */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Algorithm Decision Factors:
                  </span>
                  <ul style={{ paddingLeft: 18, fontSize: '0.8rem', color: '#475569', marginTop: 4, lineHeight: 1.4 }}>
                    {ngo.match_reasons?.map((m, mi) => (
                      <li key={mi}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenDonate(ngo)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: '0.9rem' }}
              >
                <Gift size={16} /> Select NGO & Create Donation
              </button>
            </div>
          );
        })}
      </div>

      {/* Dispatch Donation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Confirm Donation Dispatch to ${selectedNgo?.ngo_name}`}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleConfirmDonation}
              disabled={creatingDonation}
              className="btn btn-primary"
            >
              {creatingDonation ? 'Generating Dispatch Order...' : 'Confirm & Dispatch Food'}
            </button>
          </>
        }
      >
        <div>
          <div style={{
            padding: '14px',
            backgroundColor: '#ecfdf5',
            borderRadius: 8,
            border: '1px solid #a7f3d0',
            marginBottom: 16,
            fontSize: '0.86rem',
            color: '#065f46'
          }}>
            <strong>Selected NGO:</strong> {selectedNgo?.ngo_name}<br />
            <strong>Location:</strong> {selectedNgo?.location} &bull; <strong>Distance:</strong> {selectedNgo?.distance_km} km
          </div>

          <div className="form-group">
            <label className="form-label">Food Item Being Donated</label>
            <input
              type="text"
              className="form-control"
              value={foodName}
              disabled
              style={{ backgroundColor: '#f1f5f9' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Donation Quantity (kg)</label>
            <input
              type="number"
              className="form-control"
              value={donationQuantity}
              onChange={(e) => setDonationQuantity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Packaging / Handover Instructions</label>
            <textarea
              className="form-control"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
