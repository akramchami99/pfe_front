import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalFiles: 0, totalStorageUsed: 0 });
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
    fetchStats();
    fetchUsers();
    fetchFiles();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/files', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFiles(res.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFiles(files.filter(file => file._id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
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
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>
      <div className="stats-section">
        <h3>Statistics</h3>
        <p><strong>Total Users:</strong> {stats.totalUsers}</p>
        <p><strong>Total Files:</strong> {stats.totalFiles}</p>
        <p><strong>Total Storage Used:</strong> {stats.totalStorageUsed} MB</p>
      </div>
      <div className="users-section">
        <h3>Users</h3>
        <ul>
          {users.map(user => (
            <li key={user._id}>
              {user.name} - {user.email} {user.isAdmin ? '(Admin)' : ''}
              <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="files-section">
        <h3>Files</h3>
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
        <ul>
          {filteredFiles.map(file => (
            <li key={file._id}>
              {file.fileName} - {file.fileSize} bytes
              <button onClick={() => handleDeleteFile(file._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
