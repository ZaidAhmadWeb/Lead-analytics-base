import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = process.env.REACT_APP_API_BASE;

function CsvUpload({ onSuccess }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await axios.post(`${API_BASE}/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'CSV Uploaded successfully!', {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      onSuccess();
    } catch (error) {
      toast.error('Upload failed. Please check the file format and try again.', {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-md">
      <ToastContainer />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">Upload Lead Data</h3>
          <p className="text-sm text-gray-500">Import new contacts via CSV file</p>
        </div>

        <div className="flex items-center gap-4">
          {uploading && (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-blue-600">Uploading...</span>
            </div>
          )}

          <label className={`relative flex items-center px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm ${uploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer active:scale-95'
            }`}>
            <span>{uploading ? 'Processing File' : 'Choose CSV'}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".csv"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default CsvUpload;