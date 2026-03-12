import React from 'react';

function StatsCards({ analytics }) {
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
      <div style={cardStyle}>
        <h3 style={{ color: '#666', margin: '0 0 10px 0' }}>Total Leads</h3>
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196F3', margin: 0 }}>
          {analytics.total_leads}
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: '#666', margin: '0 0 10px 0' }}>Revenue</h3>
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#4CAF50', margin: 0 }}>
          ${Number(analytics.total_revenue).toFixed(2)}
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: '#666', margin: '0 0 10px 0' }}>Conversion Rate</h3>
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#FF9800', margin: 0 }}>
          {analytics.conversion_rate}%
        </p>
      </div>
    </div>
  );
}

export default StatsCards;
