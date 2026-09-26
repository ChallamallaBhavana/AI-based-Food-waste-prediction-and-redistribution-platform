import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingDown,
  Gift,
  Building2,
  Truck,
  Globe2,
  Calendar,
  Sparkles,
  PieChart
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, chartRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getChartData()
        ]);
        setSummary(sumRes);
        setChartData(chartRes);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !chartData) {
    return <div className="page-body" style={{ textAlign: 'center', padding: '100px 0' }}>Loading Analytics & Insights...</div>;
  }

  // 1. Daily Trend Data (Past 14 days)
  const dailyLineData = {
    labels: chartData.daily_trend.labels,
    datasets: [
      {
        label: 'Surplus Generated (kg)',
        data: chartData.daily_trend.surplus,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        tension: 0.35,
        fill: true
      },
      {
        label: 'Successfully Redistributed (kg)',
        data: chartData.daily_trend.redistributed,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.35,
        fill: true
      },
      {
        label: 'Net Waste (kg)',
        data: chartData.daily_trend.waste,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.35
      }
    ]
  };

  // 2. Monthly Trend Data (6 Months)
  const monthlyBarData = {
    labels: chartData.monthly_trend.labels,
    datasets: [
      {
        label: 'Total Surplus (kg)',
        data: chartData.monthly_trend.surplus,
        backgroundColor: '#93c5fd',
        borderRadius: 6
      },
      {
        label: 'Redistributed (kg)',
        data: chartData.monthly_trend.redistributed,
        backgroundColor: '#10b981',
        borderRadius: 6
      }
    ]
  };

  // 3. Category Doughnut Data
  const categoryDoughnutData = {
    labels: chartData.category_distribution.map(c => c.name),
    datasets: [
      {
        data: chartData.category_distribution.map(c => c.value),
        backgroundColor: ['#10b981', '#0284c7', '#f59e0b', '#8b5cf6', '#ec4899'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // 4. Festival Impact Data
  const festivalData = {
    labels: chartData.festival_impact.categories,
    datasets: [
      {
        label: 'Average Surplus Surge (kg)',
        data: chartData.festival_impact.avg_surplus_kg,
        backgroundColor: ['#6ee7b7', '#fcd34d', '#93c5fd', '#f472b6'],
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.86rem', fontWeight: 700 }}>
          <BarChart3 size={16} /> COMPREHENSIVE IMPACT & OPERATIONAL METRICS
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
          Food Waste Analytics & Trend Intelligence
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Historical trends, predictive pattern visualization, and environmental carbon reduction metrics.
        </p>
      </div>

      {/* 6 Key Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard
          title="Total Surplus Recorded"
          value={summary?.total_surplus_kg || 110.0}
          unit="kg"
          icon={TrendingDown}
          color="blue"
        />
        <StatCard
          title="Food Redistributed"
          value={summary?.total_redistributed_kg || 52.0}
          unit="kg"
          icon={Gift}
          color="emerald"
        />
        <StatCard
          title="Redistribution Success"
          value={`${summary?.redistribution_rate_pct || 76.5}%`}
          unit=""
          icon={Sparkles}
          color="amber"
        />
        <StatCard
          title="Active NGOs Engaged"
          value={summary?.number_of_ngos || 4}
          unit="partners"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Completed Deliveries"
          value={summary?.deliveries_completed || 2}
          unit="dispatches"
          icon={Truck}
          color="blue"
        />
        <StatCard
          title="CO2 Emissions Prevented"
          value={summary?.impact_metrics?.co2_saved_kg || 130.0}
          unit="kg CO2e"
          icon={Globe2}
          color="emerald"
        />
      </div>

      {/* Main Charts: 14-day Daily Trend & Monthly Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 28 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 size={18} color="#059669" /> Daily Surplus, Redistribution & Waste (14 Days)
            </h3>
          </div>
          <div style={{ height: 320 }}>
            <Line
              data={dailyLineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
              }}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} color="#0284c7" /> 6-Month Surplus vs Saved Trend
            </h3>
          </div>
          <div style={{ height: 320 }}>
            <Bar
              data={monthlyBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Lower Row: Category Distribution & Festival Surge Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PieChart size={18} color="#f59e0b" /> Food Category Breakdown
            </h3>
          </div>
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={categoryDoughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
              }}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={18} color="#7e22ce" /> Festival & Event Surplus Impact
            </h3>
          </div>
          <div style={{ height: 280 }}>
            <Bar
              data={festivalData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
