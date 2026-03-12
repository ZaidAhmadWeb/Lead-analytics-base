import React from 'react';

function TopAgents({ agents }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Top Performing Agents</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Agent</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Leads</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Converted</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {(agents) ? agents.map((agent, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{agent.agent_name}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{agent.total_leads}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{agent.converted}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>
                ${Number(agent.revenue).toFixed(2)}
              </td>
            </tr>
          )) : (
            <div>
              <p style={{ textAlign: 'start', padding: '20px', color: '#777', width: '100%' }}>No data available</p>
            </div>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TopAgents;
