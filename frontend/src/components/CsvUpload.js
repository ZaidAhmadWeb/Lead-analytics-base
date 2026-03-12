import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE;

function CsvUpload({ onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE}/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message);
      onSuccess();
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    }

    setUploading(false);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Upload Lead Data (CSV)</h3>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        style={{ marginRight: '10px' }}
      />
      {uploading && <span style={{ color: '#666' }}>Uploading...</span>}
      {message && (
        <p style={{ marginTop: '10px', color: message.includes('failed') ? 'red' : 'green' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default CsvUpload;
