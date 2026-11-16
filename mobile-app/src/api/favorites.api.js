import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const favoritesAPI = {
  addFavorite: async (userId, spotId) => {
    const response = await axios.post(`${API_BASE}/users/${userId}/favorites`, { spotId });
    return response.data;
  },

  removeFavorite: async (userId, spotId) => {
    const response = await axios.delete(`${API_BASE}/users/${userId}/favorites/${spotId}`);
    return response.data;
  },

  getFavorites: async (userId) => {
    const response = await axios.get(`${API_BASE}/users/${userId}/favorites`);
    return response.data;
  },
};

export default favoritesAPI;
