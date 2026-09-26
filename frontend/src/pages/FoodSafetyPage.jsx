import React, { useState } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Thermometer,
  Clock,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

export function FoodSafetyPage() {
  const [formData, setFormData] = useState({
    food_name: 'Paneer Butter Masala',
    food_type: 'Cooked Meal',
    preparation_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString().substring(0, 16),
    current_time: new Date().toISOString().substring(0, 16),
    storage_condition: 'Room Temperature',
    expiry_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString().substring(0, 16),
    temperature: 24.5
  });

  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    setValidating(true);
    try {
      const res = await api.validateSafety(formData);
      setValidationResult(res);
    } catch (err) {
      alert('Validation failed: ' + err.message);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.86rem', fontWeight: 700 }}>
          <ShieldCheck size={16} /> MODULE 2: FOOD SAFETY COMPLIANCE
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
          FSSAI-Aligned Food Safety Validation Engine
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Evaluate surplus food hygiene, danger-zone temperatures, and shelf-life against standardized food safety benchmarks before approving donation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Safety Assessment Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 20 }}>
            <Thermometer size={20} color="#059669" /> Food Parameters & Storage Audit
          </h3>

          <form onSubmit={handleValidate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Food Name *</label>
                <input
                  type="text"
                  name="food_name"
                  required
                  className="form-control"
                  value={formData.food_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Mixed Veg Curry"
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
                  <option value="Cooked Meal">Cooked Meal (Perishable)</option>
                  <option value="Bakery">Bakery Goods</option>
                  <option value="Dairy">Dairy & Desserts</option>
                  <option value="Meat/Gravy">Meat / Poultry / Gravy</option>
                  <option value="Raw Vegetables">Raw Whole Vegetables</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Food Preparation Time</label>
                <input
                  type="datetime-local"
                  name="preparation_time"
                  required
                  className="form-control"
                  value={formData.preparation_time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Verification / Dispatch Time</label>
                <input
                  type="datetime-local"
                  name="current_time"
                  required
                  className="form-control"
                  value={formData.current_time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Current Storage Condition</label>
                <select
                  name="storage_condition"
                  className="form-control"
                  value={formData.storage_condition}
                  onChange={handleInputChange}
                >
                  <option value="Room Temperature">Room Temperature (Ambient)</option>
                  <option value="Hot Holding">Hot Holding (≥ 60°C)</option>
                  <option value="Refrigerated">Refrigerated (≤ 5°C)</option>
                  <option value="Deep Frozen">Deep Frozen (≤ -18°C)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Measured Temperature (°C)</label>
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

            <div className="form-group">
              <label className="form-label">Declared Expiry / Use-By Threshold</label>
              <input
                type="datetime-local"
                name="expiry_time"
                className="form-control"
                value={formData.expiry_time}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              disabled={validating}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.96rem', marginTop: 10 }}
            >
              {validating ? 'Evaluating Hygiene Parameters...' : 'Verify Food Safety with FSSAI Rules'}
            </button>
          </form>
        </div>

        {/* Validation Result Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{
            background: validationResult?.safety_status === 'NOT SAFE FOR REDISTRIBUTION' ? '#fef2f2' : (validationResult?.safety_status === 'NEEDS REVIEW' ? '#fffbeb' : '#f0fdf4'),
            border: `2px solid ${validationResult?.safety_status === 'NOT SAFE FOR REDISTRIBUTION' ? '#f87171' : (validationResult?.safety_status === 'NEEDS REVIEW' ? '#fcd34d' : '#86efac')}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <ShieldCheck size={24} color={validationResult?.safety_status === 'NOT SAFE FOR REDISTRIBUTION' ? '#dc2626' : (validationResult?.safety_status === 'NEEDS REVIEW' ? '#d97706' : '#059669')} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Safety Evaluation Verdict</h3>
            </div>

            {validationResult ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <StatusBadge status={validationResult.safety_status} />
                  <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: 10 }}>
                    Elapsed: {validationResult.elapsed_hours} hours
                  </span>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                    Audited Safety Reasons & Guidelines:
                  </h4>
                  <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                    {validationResult.reasons_list?.map((r, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  borderRadius: 8,
                  fontSize: '0.76rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8
                }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{validationResult.fssai_disclaimer}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: 10 }}>
                  Fill the food storage parameters on the left and click <strong>"Verify Food Safety"</strong>.
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  The engine will check temperature danger zones, elapsed ambient hours, and expiration criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FSSAI Reference Standard Card */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>
          <Info size={20} color="#0284c7" /> FSSAI Food Donation Safety Guidelines (Reference Framework)
        </h3>
        <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: 20 }}>
          The system implements regulatory best-practices formulated in the Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#0f172a', fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>
              1. The 2-Hour / 4-Hour Rule
            </strong>
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              Cooked food held at ambient room temperature must be consumed or chilled within 2 hours. Between 2 to 4 hours, it must be consumed immediately and cannot be re-chilled. Beyond 4 hours, food is unsafe for donation.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#0f172a', fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>
              2. Temperature Danger Zone (5°C – 60°C)
            </strong>
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              Bacteria multiply rapidly between 5°C and 60°C. Hot cooked meals must be kept hot at &ge; 60°C. Chilled donations must be maintained at &le; 5°C throughout transportation.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#0f172a', fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>
              3. Maximum Permissible Holding Window
            </strong>
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              Refrigerated cooked dishes should be redistributed within 24 to 36 hours. Bakery items without dairy or cream fillings may be stored at dry room temperature up to 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
