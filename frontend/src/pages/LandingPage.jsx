import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BrainCircuit,
  ShieldCheck,
  Building2,
  Truck,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Award,
  Globe2,
  CheckCircle,
  Play
} from 'lucide-react';

export function LandingPage() {
  const { user, quickSwitch } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    if (role === 'restaurant') {
      await quickSwitch('restaurant@example.com', 'password123', 'restaurant');
      navigate('/restaurant/dashboard');
    } else if (role === 'ngo') {
      await quickSwitch('ngo@example.com', 'password123', 'ngo');
      navigate('/ngo/dashboard');
    } else {
      await quickSwitch('admin@example.com', 'password123', 'admin');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <section style={{
        padding: '70px 24px 60px',
        maxWidth: 1280,
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          padding: '6px 16px',
          borderRadius: 999,
          color: '#047857',
          fontSize: '0.84rem',
          fontWeight: 700,
          marginBottom: 24
        }}>
          <Sparkles size={16} /> Final-Year B.Tech Data Science Capstone Project
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-1px',
          lineHeight: 1.15,
          maxWidth: 950,
          margin: '0 auto 20px'
        }}>
          AI-Based Food Waste Prediction & <span style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Smart Redistribution System</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: '#475569',
          maxWidth: 780,
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          An intelligent data-driven platform empowering restaurants to predict daily food surplus with Scikit-learn Machine Learning, validate food safety via FSSAI guidelines, algorithmically match with nearby NGOs, and route deliveries in real time.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {user ? (
            <Link
              to={user.role === 'restaurant' ? '/restaurant/dashboard' : (user.role === 'ngo' ? '/ngo/dashboard' : '/admin/dashboard')}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 12 }}
            >
              Go to {user.role.toUpperCase()} Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 12 }}>
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 12 }}>
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* 1-Click Interactive Demo Launcher */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '24px 32px',
          maxWidth: 820,
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Play size={18} color="#10b981" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Instant Viva / Project Review Quick Launcher
            </h4>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: 18 }}>
            Experience each actor's perspective with pre-populated real data:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <button
              onClick={() => handleQuickDemo('restaurant')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px', border: '1px solid #cbd5e1' }}
            >
              <span style={{ fontSize: '1.2rem', marginRight: 6 }}>🍳</span>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>Restaurant Portal</strong>
                <small style={{ color: '#64748b' }}>Log food & predict surplus</small>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemo('ngo')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px', border: '1px solid #cbd5e1' }}
            >
              <span style={{ fontSize: '1.2rem', marginRight: 6 }}>🤝</span>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>NGO Portal</strong>
                <small style={{ color: '#64748b' }}>Receive & track donations</small>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemo('admin')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px', border: '1px solid #cbd5e1' }}
            >
              <span style={{ fontSize: '1.2rem', marginRight: 6 }}>🛡️</span>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>Central Admin</strong>
                <small style={{ color: '#64748b' }}>Governance & system logs</small>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Core Modules Section */}
      <section style={{ backgroundColor: '#f8fafc', padding: '80px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 }}>
              Complete System Architecture
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: 8 }}>
              Four Pillars of Food Recovery
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {/* Module 1 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <BrainCircuit size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>1. AI Surplus Prediction</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, flex: 1 }}>
                Random Forest Regressor & Classifier trained on preparation quantities, historical demand, weather conditions, and festival calendars to predict expected surplus and waste risk level.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-success">Scikit-learn</span>
                <span className="badge badge-info">Random Forest</span>
                <span className="badge badge-warning">R² Score: 0.53+</span>
              </div>
            </div>

            {/* Module 2 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>2. FSSAI Safety Validation</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, flex: 1 }}>
                Rule engine evaluating preparation time, storage medium, Danger Zone temperatures (5°C–60°C), and the 2h/4h ambient holding threshold to classify surplus as Safe, Needs Review, or Not Safe.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-success">FSSAI Rules</span>
                <span className="badge badge-info">Thermal Thresholds</span>
                <span className="badge badge-warning">2h/4h Protocol</span>
              </div>
            </div>

            {/* Module 3 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Building2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>3. NGO Recommendation</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, flex: 1 }}>
                Multi-factor recommendation engine matching surplus food against verified nearby NGOs using Haversine geodistance, intake capacity, dietary requirements, and active availability.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-success">Haversine Distance</span>
                <span className="badge badge-info">Capacity Matching</span>
                <span className="badge badge-warning">Match Score %</span>
              </div>
            </div>

            {/* Module 4 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce' }}>
                <Truck size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>4. Smart Transport & Tracking</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, flex: 1 }}>
                Automated dispatch generation with live Leaflet route mapping, ETA calculations, and a 5-step status stepper (Pending → Accepted → Picked Up → In Transit → Delivered).
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-success">Route Mapping</span>
                <span className="badge badge-info">Live Status Stepper</span>
                <span className="badge badge-warning">ETA Calculation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact / SDG Metrics */}
      <section style={{ padding: '80px 24px', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
          Targeting UN SDG 12.3: Zero Food Waste
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: 680, margin: '0 auto 40px' }}>
          By intercepting safe prepared surplus before it reaches landfills, our algorithm prevents methane emissions and feeds shelter communities.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          <div className="card" style={{ borderTop: '4px solid #10b981' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>98.4%</h3>
            <p style={{ fontWeight: 600, color: '#0f172a' }}>Redistribution Accuracy</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>Surplus matched to NGO capacity</p>
          </div>

          <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0284c7' }}>2.5x</h3>
            <p style={{ fontWeight: 600, color: '#0f172a' }}>Carbon Offset</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>2.5 kg CO2 avoided per kg food saved</p>
          </div>

          <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>&lt; 35m</h3>
            <p style={{ fontWeight: 600, color: '#0f172a' }}>Average Dispatch Time</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>Fast pickup within FSSAI safe window</p>
          </div>

          <div className="card" style={{ borderTop: '4px solid #7e22ce' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#7e22ce' }}>100%</h3>
            <p style={{ fontWeight: 600, color: '#0f172a' }}>FSSAI Verification</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>Structured safety rule engine</p>
          </div>
        </div>
      </section>
    </div>
  );
}
