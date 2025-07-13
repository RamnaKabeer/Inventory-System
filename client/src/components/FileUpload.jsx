import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [table, setTable] = useState('products');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !table) {
      setMessage('❗ Please select a file and table');
      return;
    }

    const formData = new FormData();
    formData.append('excel', file);
    formData.append('table', table);

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:3002/import-excel', formData);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">📊 Excel Import Panel</h1>
        <p className="text-sm text-gray-500 text-center">Upload Excel file to import data into the selected table.</p>

        {/* Table Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Table</label>
          <select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="products">🛒 Products</option>
            <option value="customers">👥 Customers</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Excel File</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Uploading...' : 'Upload & Validate'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`text-center text-sm font-medium px-4 py-2 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
