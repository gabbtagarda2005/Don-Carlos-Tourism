import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const touristSpotsAPI = {
  getAllSpots: async () => {
    const response = await axios.get(`${API_BASE}/tourist-spots`);
    return response.data;
  },

  getSpotById: async (id) => {
    const response = await axios.get(`${API_BASE}/tourist-spots/${id}`);
    return response.data;
  },

  createSpot: async (spotData) => {
    const response = await axios.post(`${API_BASE}/tourist-spots`, spotData);
    return response.data;
  },

  updateSpot: async (id, spotData) => {
    const response = await axios.put(`${API_BASE}/tourist-spots/${id}`, spotData);
    return response.data;
  },

  deleteSpot: async (id) => {
    const response = await axios.delete(`${API_BASE}/tourist-spots/${id}`);
    return response.data;
  },
};

export default touristSpotsAPI;
