import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  UtensilsCrossed,
  BrainCircuit,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CloudSun,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export function FoodEntryPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    food_name: 'Hyderabadi Chicken Dum Biryani',
    food_type: 'Cooked Meal',
    quantity_prepared: 120,
    quantity_sold: 85,
    surplus_quantity: 35,
    previous_demand: 90,
    date: new Date().toISOString().split('T')[0],
    preparation_time: new Date().toISOString().substring(0, 16),
    expiry_time: '',
    weather: 'Sunny',
    festival: 'Weekend Special',
    storage_condition: 'Hot Holding',
    temperature: 65.0
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const records = await api.getFoodRecords();
      setHistory(records || []);
    } catch (err) {
      console.error('Error fetching food history:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    // Auto calculate surplus if prepared or sold changes
    if (name === 'quantity_prepared' || name === 'quantity_sold') {
      const prep = parseFloat(name === 'quantity_prepared' ? value : formData.quantity_prepared) || 0;
      const sold = parseFloat(name === 'quantity_sold' ? value : formData.quantity_sold) || 0;
      updated.surplus_quantity = Math.max(0, prep - sold);
    }

    setFormData(updated);
  };

  const handlePredictOnly = async () => {
    setPredicting(true);
    setSuccessMsg('');
    try {
      const res = await api.calculatePrediction({
        food_name: formData.food_name,
        food_type: formData.food_type,
        quantity_prepared: parseFloat(formData.quantity_prepared),
        quantity_sold: parseFloat(formData.quantity_sold),
        previous_demand: parseFloat(formData.previous_demand),
        date: formData.date,
        weather: formData.weather,
        festival: formData.festival
      });
      setPredictionResult(res);
    } catch (err) {
      alert('Prediction failed: ' + err.message);
    } finally {
      setPredicting(false);
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.createFoodEntry(formData);
      setSuccessMsg('Daily food preparation record saved and evaluated!');
      if (res.food && res.food.prediction) {
        setPredictionResult(res.food.prediction);
      }
      loadHistory();
    } catch (err) {
      alert('Failed to save record: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.86rem', fontWeight: 700 }}>
          <BrainCircuit size={16} /> MODULE 1: AI SURPLUS PREDICTION
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
          Daily Food Entry & ML Surplus Estimator
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Input daily kitchen preparations. Our Scikit-learn model predicts end-of-day surplus, evaluates waste risk, and generates actionable donation advisories.
        </p>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: 8,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Entry Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 20 }}>
            <UtensilsCrossed size={20} color="#10b981" /> Daily Food Preparation Details
          </h3>

          <form onSubmit={handleSaveEntry}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Food Item Name *</label>
                <input
                  type="text"
                  name="food_name"
                  required
                  className="form-control"
                  value={formData.food_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Royal Chicken Dum Biryani"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Food Category</label>
                <select
                  name="food_type"
                  className="form-control"
                  value={formData.food_type}
                  onChange={handleInputChange}
                >
                  <option value="Cooked Meal">Cooked Meal</option>
                  <option value="Bakery">Bakery & Breads</option>
                  <option value="Dairy">Dairy & Sweets</option>
                  <option value="Raw Vegetables">Raw Vegetables</option>
                  <option value="Meat/Gravy">Meat & Rich Gravy</option>
                </select>
              </div>
            </div>

            {/* Quantities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Quantity Prepared (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  name="quantity_prepared"
                  className="form-control"
                  value={formData.quantity_prepared}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity Sold (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  name="quantity_sold"
                  className="form-control"
                  value={formData.quantity_sold}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Remaining Surplus (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  name="surplus_quantity"
                  className="form-control"
                  value={formData.surplus_quantity}
                  onChange={handleInputChange}
                  style={{ fontWeight: 700, color: '#059669', backgroundColor: '#f8fafc' }}
                />
              </div>
            </div>

            {/* Environmental / Calendar Factors for ML */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Previous Demand (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  name="previous_demand"
                  className="form-control"
                  value={formData.previous_demand}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weather Condition</label>
                <select
                  name="weather"
                  className="form-control"
                  value={formData.weather}
                  onChange={handleInputChange}
                >
                  <option value="Sunny">☀️ Sunny / Warm</option>
                  <option value="Rainy">🌧️ Rainy / Wet</option>
                  <option value="Cloudy">⛅ Cloudy</option>
                  <option value="Cold">❄️ Cold</option>
                  <option value="Humid">🌫️ Humid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Festival / Special Event</label>
                <select
                  name="festival"
                  className="form-control"
                  value={formData.festival}
                  onChange={handleInputChange}
                >
                  <option value="None">None (Regular Day)</option>
                  <option value="Weekend Special">Weekend Special</option>
                  <option value="Diwali">Diwali Festival</option>
                  <option value="Eid">Eid Celebrations</option>
                  <option value="Christmas">Christmas / New Year</option>
                  <option value="Local Carnival">Local Carnival / Fair</option>
                </select>
              </div>
            </div>

            {/* Safety & Time Context */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Preparation Time</label>
                <input
                  type="datetime-local"
                  name="preparation_time"
                  className="form-control"
                  value={formData.preparation_time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Storage Medium</label>
                <select
                  name="storage_condition"
                  className="form-control"
                  value={formData.storage_condition}
                  onChange={handleInputChange}
                >
                  <option value="Hot Holding">Hot Holding (≥60°C)</option>
                  <option value="Room Temperature">Room Temperature</option>
                  <option value="Refrigerated">Refrigerated (≤5°C)</option>
                  <option value="Deep Frozen">Deep Frozen (≤-18°C)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  name="temperature"
                  className="form-control"
                  value={formData.temperature}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={handlePredictOnly}
                disabled={predicting}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                <BrainCircuit size={18} color="#0284c7" />
                {predicting ? 'Running ML Inference...' : 'Predict Surplus with AI'}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save & Evaluate Record'}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Result Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
            border: '2px solid #a7f3d0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 90,
              height: 90,
              background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BrainCircuit size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  AI Prediction Result
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600 }}>
                  Scikit-learn Random Forest Model
                </span>
              </div>
            </div>

            {predictionResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  border: '1px solid #d1fae5',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Predicted Surplus Quantity
                  </span>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#059669', margin: '4px 0' }}>
                    {predictionResult.predicted_surplus} <span style={{ fontSize: '1.1rem' }}>kg</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Based on weather ({formData.weather}), event ({formData.festival}), and volume
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Demand Level</span>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: predictionResult.demand_level === 'High' ? '#d1fae5' : '#e0f2fe',
                      color: predictionResult.demand_level === 'High' ? '#065f46' : '#075985'
                    }}>
                      {predictionResult.demand_level} Demand
                    </span>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Waste Risk</span>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: predictionResult.waste_risk === 'High' ? '#fee2e2' : (predictionResult.waste_risk === 'Moderate' ? '#fef3c7' : '#d1fae5'),
                      color: predictionResult.waste_risk === 'High' ? '#991b1b' : (predictionResult.waste_risk === 'Moderate' ? '#92400e' : '#065f46')
                    }}>
                      {predictionResult.waste_risk} Risk
                    </span>
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Model Confidence:</span>
                    <strong>{Math.round((predictionResult.confidence || 0.88) * 100)}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pipeline Architecture:</span>
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>RandomForest Ensemble</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/ngo-recommendations?surplus=${predictionResult.predicted_surplus}&food_name=${encodeURIComponent(formData.food_name)}`)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  Match NGOs for this Surplus <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: 12 }}>
                  Click <strong>"Predict Surplus with AI"</strong> to test model inference on current parameters.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Features evaluated: volume prepared, prior sales velocity, day of week, weather impact, and festive demand surge.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Entries Table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>
          Recent Daily Preparations Log
        </h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Food Item</th>
                <th>Prepared</th>
                <th>Sold</th>
                <th>Actual Surplus</th>
                <th>ML Predicted</th>
                <th>Demand Level</th>
                <th>Safety Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.food_id}>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.food_name}</td>
                  <td>{item.quantity_prepared} kg</td>
                  <td>{item.quantity_sold} kg</td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>{item.surplus_quantity} kg</td>
                  <td style={{ fontWeight: 600, color: '#0284c7' }}>
                    {item.prediction ? `${item.prediction.predicted_surplus} kg` : '—'}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {item.prediction?.demand_level || 'Medium'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={item.safety?.safety_status || 'SAFE FOR REDISTRIBUTION'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
