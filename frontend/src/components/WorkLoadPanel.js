import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

export default function WorkloadPanel() {
  const [workload, setWorkload] = useState([]);

  const fetchWorkload = () => {
    axios.get(`${API_BASE}/agents/workload`).then(res => {
      setWorkload(res.data); // Should return [{name, open_count}] [cite: 33]
    });
  };

  useEffect(() => {
    fetchWorkload();
    const interval = setInterval(fetchWorkload, 5000); // "Must update live" [cite: 45]
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="workload-card">
      <h3>Agent Workload</h3>
      <ul>
        {workload.map(agent => (
          <li key={agent.id}>
            {agent.name}: <strong>{agent.open_count} / 10</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}