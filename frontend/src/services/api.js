const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('food_waste_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),

  // Food
  createFoodEntry: (data) => request('/food/entry', { method: 'POST', body: JSON.stringify(data) }),
  getFoodRecords: () => request('/food/records'),
  getFoodRecord: (id) => request(`/food/record/${id}`),
  deleteFoodRecord: (id) => request(`/food/record/${id}`, { method: 'DELETE' }),

  // Prediction
  calculatePrediction: (data) => request('/predict/calculate', { method: 'POST', body: JSON.stringify(data) }),
  getPredictionHistory: () => request('/predict/history'),

  // Safety
  validateSafety: (data) => request('/safety/validate', { method: 'POST', body: JSON.stringify(data) }),
  getSafetyGuidelines: () => request('/safety/rules'),

  // NGOs & Recommendations
  getNGOs: () => request('/ngos'),
  getNGORecommendations: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ngos/recommendations?${query}`);
  },
  updateNGO: (id, data) => request(`/ngos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Donations
  createDonation: (data) => request('/donations/create', { method: 'POST', body: JSON.stringify(data) }),
  getDonations: () => request('/donations'),
  getDonation: (id) => request(`/donations/${id}`),
  updateDonationStatus: (id, status) => request(`/donations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Deliveries
  getDeliveries: () => request('/deliveries'),
  getDelivery: (id) => request(`/deliveries/${id}`),
  advanceDelivery: (id) => request(`/deliveries/${id}/advance`, { method: 'PUT' }),
  updateDeliveryStatus: (id, status) => request(`/deliveries/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Analytics
  getAnalyticsSummary: () => request('/analytics/summary'),
  getChartData: () => request('/analytics/charts'),

  // Admin
  getAdminOverview: () => request('/admin/overview'),
  getAdminUsers: () => request('/admin/users'),
  getAdminRestaurants: () => request('/admin/restaurants'),
  getAdminReports: () => request('/admin/reports'),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' })
};
