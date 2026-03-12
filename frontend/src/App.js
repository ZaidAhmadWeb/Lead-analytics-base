import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Add this
import 'react-toastify/dist/ReactToastify.css'; // Add this
import Dashboard from './pages/Dashboard';
import AgentManagement from './pages/AgentManagment';
import AgentLeadDetail from './components/AgentLeadDetails';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <nav style={{ padding: '20px', backgroundColor: '#333', color: '#fff', display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
          <Link to="/manage" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Agent Management</Link>
        </nav>

        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* The main management list */}
            <Route path="/manage" element={<AgentManagement />} />
            {/* The specific details for one agent */}
            <Route path="/manage/:agentId" element={<AgentLeadDetail />} />
          </Routes>
        </div>

        {/* This stays here to render all toasts */}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;