import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE;

const AgentWorkload = ({ onSelectAgent }) => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWorkload = async () => {
        try {
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
        fetchWorkload();
        const interval = setInterval(fetchWorkload, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading && agents.length === 0) {
        return (
            <div className="flex items-center justify-center p-10 text-gray-500 animate-pulse">
                Loading Workload...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
                <span className="font-medium">Error:</span> {error}
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Agent Management</h2>
                <p className="text-gray-500 text-sm">Real-time capacity monitoring</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agents.map((agent) => {
                    const isOverloaded = agent.open_count >= 10;
                    const progressWidth = Math.min((agent.open_count / 10) * 100, 100);

                    return (
                        <div
                            key={agent.id}
                            className={`relative bg-white p-5 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md hover:-translate-y-1 ${isOverloaded ? 'border-red-500' : 'border-emerald-500'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{agent.name}</h4>
                                    <p className="text-sm font-medium text-gray-500">
                                        {agent.open_count} <span className="text-gray-400">/ 10 Active Leads</span>
                                    </p>
                                </div>
                                <span className={`flex h-3 w-3 rounded-full ${isOverloaded ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            </div>

                            <button
                                onClick={() => onSelectAgent(agent)}
                                className="w-full mb-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                            >
                                Manage Leads
                            </button>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ease-out ${isOverloaded ? 'bg-red-500' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: `${progressWidth}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AgentWorkload;