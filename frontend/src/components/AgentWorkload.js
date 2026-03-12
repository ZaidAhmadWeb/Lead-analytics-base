import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE;

const AgentWorkload = ({ onSelectAgent }) => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWorkload = async () => {
        try {
            // Using your required API base structure
            const response = await axios.get(`${API_BASE}/agents/workload`);
            setAgents(response.data);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error("Error fetching workload:", err);
            setError("Failed to load workload data");
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchWorkload();

        // PART 3 REQUIREMENT: "Must update live"
        // Set up an interval to refresh data every 5 seconds
        const interval = setInterval(fetchWorkload, 5000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    if (loading && agents.length === 0) return <div>Loading Workload...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="workload-panel">
            <h2>Agent Management</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {agents.map(agent => (
                    <div key={agent.id} style={cardStyle(agent.open_count)}>
                        <h4>{agent.name}</h4>
                        <p>{agent.open_count} / 10 Active Leads</p>

                        {/* New Button to trigger the detail view */}
                        <button
                            onClick={() => onSelectAgent(agent)}
                            style={buttonStyle}
                        >
                            Manage Leads
                        </button>

                        <div style={progressContainer}>
                            <div style={progressFill(agent.open_count)}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const buttonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
};

// Simple inline styles for the cards
const cardStyle = (count) => ({
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: `5px solid ${count >= 10 ? '#e74c3c' : '#2ecc71'}`
});

const progressContainer = {
    height: '8px',
    backgroundColor: '#eee',
    borderRadius: '4px',
    marginTop: '10px',
    overflow: 'hidden'
};

const progressFill = (count) => ({
    height: '100%',
    width: `${Math.min((count / 10) * 100, 100)}%`,
    backgroundColor: count >= 10 ? '#e74c3c' : '#2ecc71',
    transition: 'width 0.5s ease-in-out'
});

export default AgentWorkload;