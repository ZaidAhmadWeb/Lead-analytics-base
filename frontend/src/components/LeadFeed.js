import React from 'react';
import axios from 'axios';

export default function LeadFeed({ leads, onUpdate }) {
  const handleStatusChange = (leadId, newStatus) => {
    axios.patch(`${API_BASE}/leads/${leadId}/status`, { status: newStatus })
      .then(res => {
        onUpdate(); // Refresh the list immediately [cite: 50]
      })
      .catch(err => alert("Update failed: " + err.message)); // UX: Error handling [cite: 21]
  };

  return (
    <table>
      <thead>
        <tr><th>Source</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {leads.map(lead => (
          <tr key={lead.id}>
            <td>{lead.source}</td>
            <td>{lead.status}</td>
            <td>
              <button onClick={() => handleStatusChange(lead.id, 'Accepted')}>Accept</button>
              <button onClick={() => handleStatusChange(lead.id, 'Rejected')}>Reject</button>
              <button onClick={() => handleStatusChange(lead.id, 'Closed')}>Close</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}