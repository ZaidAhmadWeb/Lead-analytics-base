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
            <AgentWorkload onSelectAgent={handleSelectAgent} />
        </div>
    );
}

export default AgentManagement;