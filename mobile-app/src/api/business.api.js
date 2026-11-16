import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const businessAPI = {
  getAllBusinesses: async () => {
    const response = await axios.get(`${API_BASE}/businesses`);
    return response.data;
  },

  getBusinessById: async (id) => {
    const response = await axios.get(`${API_BASE}/businesses/${id}`);
    return response.data;
  },

  createBusiness: async (businessData) => {
    const response = await axios.post(`${API_BASE}/businesses`, businessData);
    return response.data;
  },

  updateBusiness: async (id, businessData) => {
    const response = await axios.put(`${API_BASE}/businesses/${id}`, businessData);
    return response.data;
  },
};

export default businessAPI;
