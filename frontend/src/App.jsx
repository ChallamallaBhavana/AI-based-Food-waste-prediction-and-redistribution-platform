import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { FoodEntryPage } from './pages/FoodEntryPage';
import { FoodSafetyPage } from './pages/FoodSafetyPage';
import { NGODashboard } from './pages/NGODashboard';
import { NGORecommendationPage } from './pages/NGORecommendationPage';
import { DonationPage } from './pages/DonationPage';
import { DeliveryTrackingPage } from './pages/DeliveryTrackingPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function AppLayout() {
  const location = useLocation();
  const isAuthOrLanding = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="app-container">
      {!isAuthOrLanding && <Sidebar />}
      <div className="main-content">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Restaurant & Food Routes */}
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
          <Route path="/food-entry" element={<FoodEntryPage />} />
          <Route path="/food-safety" element={<FoodSafetyPage />} />
          
          {/* NGO & Redistribution Routes */}
          <Route path="/ngo/dashboard" element={<NGODashboard />} />
          <Route path="/ngo-recommendations" element={<NGORecommendationPage />} />
          <Route path="/donations" element={<DonationPage />} />
          
          {/* Logistics & Tracking */}
          <Route path="/deliveries" element={<DeliveryTrackingPage />} />
          
          {/* Analytics & Governance */}
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
