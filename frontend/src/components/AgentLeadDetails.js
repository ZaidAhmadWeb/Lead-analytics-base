import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_BASE;

const AgentLeadDetail = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
    const [agentName, setAgentName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Leads
                const leadsRes = await axios.get(`${API_BASE}/agents/${agentId}/leads`);
                setLeads(leadsRes.data);

                // Try to get Agent Name from the first lead if available, 
                // or via a separate call
                if (leadsRes.data.length > 0 && leadsRes.data[0].agent_name) {
                    setAgentName(leadsRes.data[0].agent_name);
                } else {
                    try {
                        const agentRes = await axios.get(`${API_BASE}/agents/${agentId}`);
                        setAgentName(agentRes.data.name);
                    } catch {
                        setAgentName(`Agent #${agentId}`);
                    }
                }
            } catch (err) {
                toast.error("Failed to load leads.");
            } finally {
                setLoading(false);
            }
        };

        if (agentId) fetchData();
    }, [agentId, leads.length]);

    const updateStatus = async (leadId, newStatus) => {
        try {
            const statusValue = newStatus === 'Close' ? 'Converted' : newStatus;
            await axios.patch(`${API_BASE}/leads/${leadId}/status`, { status: statusValue });

            toast.success(`Lead marked as ${statusValue}`);

            // Option A: Remove from list (Current behavior)
            setLeads(prev => prev.filter(l => l.id !== leadId));

            // Option B: If you want them to stay but change color, use:
            /*
            setLeads(prev => prev.map(l => 
                l.id === leadId ? { ...l, status: statusValue } : l
            ));
            */
        } catch (err) {
            toast.error("Failed to update status.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/manage')} className="text-blue-600 font-medium">
                    ← Back to Management
                </button>
                <h2 className="text-xl font-bold">Leads for {agentName}</h2>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4">Source</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => {
                            // Define if the lead is "Active" or already "Finished"
                            const isFinished = lead.status === 'Converted' || lead.status === 'Rejected';

                            return (
                                <tr key={lead.id} className="border-b">
                                    <td className="p-4">{lead.source}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isFinished ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {!isFinished ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => updateStatus(lead.id, 'Rejected')}
                                                    className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(lead.id, 'Close')}
                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentLeadDetail;