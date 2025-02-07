import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalFiles: 0, storageUsed: 0 });
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const navigate = useNavigate();

  const userId = localStorage.getItem('user'); // Directly retrieving user ID from localStorage

  useEffect(() => {
    fetchStats();
    fetchFiles();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/files');
      setFiles(res.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return alert('Please select a file');
    if (!userId) return alert('User ID not found');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', userId);
    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFiles([...files, res.data]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/files/${fileId}/download`);
      if (res.data.downloadUrl) {
        const response = await fetch(res.data.downloadUrl);
        const link = document.createElement('a');
        link.href = response.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`);
      setFiles(files.filter(file => file._id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = localStorage.getItem('user');
      if (!userId) {
        alert('User ID not found.');
        return;
      }
      await axios.delete(`http://localhost:5000/api/delete-account/${userId}`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const filteredFiles = files
    .filter(file => file.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(file => (fileTypeFilter ? file.fileName.endsWith(fileTypeFilter) : true))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.uploadDate) - new Date(a.uploadDate);
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      return 0;
    });

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="stats-section">
        <h3>Statistics</h3>
        <p><strong>Total Files:</strong> {stats.totalFiles}</p>
        <p><strong>Storage Used:</strong> {stats.storageUsed} MB / 20 GB</p>
      </div>
      <h3>Manage Your Files</h3>
      <div className="file-management-section">
        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Upload File</button>
        </div>
        <div className='filters'>
          <input
            type="text"
            placeholder="Search files by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
          </select>
          <select onChange={(e) => setFileTypeFilter(e.target.value)}>
            <option value="">All Formats</option>
            <option value=".pdf">PDF</option>
            <option value=".jpg">JPG</option>
            <option value=".png">PNG</option>
          </select>
        </div>
        <ul>
          {filteredFiles.length > 0 ? (
            filteredFiles.map(file => (
              <li key={file._id}>
                <span>{file.fileName}</span>
                <button onClick={() => handleDownloadFile(file._id, file.fileName)}>Download</button>
                <button className="delete-btn" onClick={() => handleDeleteFile(file._id)}>Delete</button>
              </li>
            ))
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </ul>
      </div>
      <div className="account-settings">
        <h3>Account Settings</h3>
        <button className="delete-account-btn" onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
};

export default Dashboard;