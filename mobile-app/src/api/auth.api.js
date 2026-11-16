import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authAPI = {
  register: async (userData) => {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_BASE}/auth/logout`);
    return response.data;
  },
};

export default authAPI;
