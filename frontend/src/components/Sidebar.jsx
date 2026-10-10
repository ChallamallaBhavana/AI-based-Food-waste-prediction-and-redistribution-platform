import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShieldCheck,
  Building2,
  Gift,
  Truck,
  BarChart3,
  Users,
  Settings,
  Home
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const role = user ? user.role : 'guest';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <UtensilsCrossed size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>Food<span style={{ color: '#10b981' }}>Rescue</span></h2>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Food Waste Management</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-title">Main Menu</span>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={18} /> Home / Overview
        </NavLink>

        {role === 'restaurant' && (
          <>
            <span className="nav-section-title">Restaurant Portal</span>
            <NavLink to="/restaurant/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Restaurant Dashboard
            </NavLink>
            <NavLink to="/food-entry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UtensilsCrossed size={18} /> Daily Food Entry & ML
            </NavLink>
            <NavLink to="/food-safety" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} /> FSSAI Food Safety Check
            </NavLink>
            <NavLink to="/ngo-recommendations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Building2 size={18} /> NGO Recommendations
            </NavLink>
            <NavLink to="/donations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Gift size={18} /> Donations
            </NavLink>
            <NavLink to="/deliveries" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Truck size={18} /> Delivery Tracking
            </NavLink>
          </>
        )}

        {role === 'ngo' && (
          <>
            <span className="nav-section-title">NGO Recipient Portal</span>
            <NavLink to="/ngo/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> NGO Dashboard
            </NavLink>
            <NavLink to="/donations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Gift size={18} /> Food Donations Inbox
            </NavLink>
            <NavLink to="/deliveries" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Truck size={18} /> Incoming Deliveries
            </NavLink>
            <NavLink to="/food-safety" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} /> Safety Compliance
            </NavLink>
          </>
        )}

        {role === 'admin' && (
          <>
            <span className="nav-section-title">Administration</span>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Admin Dashboard
            </NavLink>
            <NavLink to="/food-entry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UtensilsCrossed size={18} /> Food Records
            </NavLink>
            <NavLink to="/ngo-recommendations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Building2 size={18} /> NGO Management
            </NavLink>
            <NavLink to="/donations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Gift size={18} /> All Donations
            </NavLink>
            <NavLink to="/deliveries" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Truck size={18} /> Fleet Deliveries
            </NavLink>
          </>
        )}

        <span className="nav-section-title">Analytics & Insights</span>
        <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} /> Analytics Dashboard
        </NavLink>
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
