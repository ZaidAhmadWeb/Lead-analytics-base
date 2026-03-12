import React from 'react';

function TopAgents({ agents }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-md">
      <h3 className="mb-4 text-gray-800 text-lg font-semibold">Top Performing Agents</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left px-2 py-2">Agent</th>
            <th className="text-right px-2 py-2">Leads</th>
            <th className="text-right px-2 py-2">Converted</th>
            <th className="text-right px-2 py-2">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {agents && agents.length > 0 ? (
            agents.map((agent, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-2 py-2">{agent.agent_name}</td>
                <td className="text-right px-2 py-2">{agent.total_leads}</td>
                <td className="text-right px-2 py-2">{agent.converted}</td>
                <td className="text-right px-2 py-2">
                  ${Number(agent.revenue).toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-gray-500 text-center py-4">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TopAgents;