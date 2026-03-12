import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatsCards from '../components/StatsCards';
import SourceChart from '../components/SourceChart';
import TopAgents from '../components/TopAgents';
import CsvUpload from '../components/CsvUpload';

const API_BASE = process.env.REACT_APP_API_BASE;

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [sourceData, setSourceData] = useState(null);
  const [topAgents, setTopAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);

    axios.get(`${API_BASE}/analytics`).then(res => {
      setAnalytics(res.data);
    });

    axios.get(`${API_BASE}/analytics/leads-by-source`).then(res => {
      setSourceData(res.data);
    });

    axios.get(`${API_BASE}/analytics/top-agents`).then(res => {
      setTopAgents(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSuccess = () => {
    fetchData();
  };
  console.log("base url: ", process.env.REACT_APP_API_BASE)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Lead Analytics Dashboard</h1>

      <CsvUpload onSuccess={handleUploadSuccess} />

      {analytics && <StatsCards analytics={analytics} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {sourceData && <SourceChart data={sourceData} />}
        <TopAgents agents={topAgents} />
      </div>
    </div>
  );
}

export default Dashboard;
