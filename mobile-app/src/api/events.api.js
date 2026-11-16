import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const eventsAPI = {
  getAllEvents: async () => {
    const response = await axios.get(`${API_BASE}/events`);
    return response.data;
  },

  getEventById: async (id) => {
    const response = await axios.get(`${API_BASE}/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await axios.post(`${API_BASE}/events`, eventData);
    return response.data;
  },
};

export default eventsAPI;
