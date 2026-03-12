import React from 'react';
import { useNavigate } from 'react-router-dom';
import AgentWorkload from '../components/AgentWorkload';

function AgentManagement() {
    const navigate = useNavigate();

    const handleSelectAgent = (agent) => {
        // Navigate to the dynamic URL using the agent's ID
        navigate(`/manage/${agent.id}`);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#333' }}>Lead Assignment Management</h1>
            <hr />
            <AgentWorkload onSelectAgent={handleSelectAgent} />
        </div>
    );
}

export default AgentManagement;