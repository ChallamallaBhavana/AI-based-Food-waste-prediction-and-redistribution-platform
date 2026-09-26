import React from 'react';

export function StatCard({ title, value, unit = '', icon: Icon, change, trend = 'up', color = 'emerald' }) {
  const colorMap = {
    emerald: { bg: '#ecfdf5', text: '#059669' },
    blue: { bg: '#e0f2fe', text: '#0284c7' },
    amber: { bg: '#fef3c7', text: '#d97706' },
    purple: { bg: '#f3e8ff', text: '#7e22ce' },
    rose: { bg: '#ffe4e6', text: '#e11d48' }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="stat-card">
      <div>
        <p style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600, marginBottom: 6 }}>{title}</p>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          {value} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>{unit}</span>
        </h3>
        {change && (
          <p style={{ fontSize: '0.78rem', color: trend === 'up' ? '#059669' : '#dc2626', marginTop: 4, fontWeight: 600 }}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </p>
        )}
      </div>
      {Icon && (
        <div className="stat-icon-wrapper" style={{ backgroundColor: scheme.bg, color: scheme.text }}>
          <Icon size={26} />
        </div>
      )}
    </div>
  );
}
