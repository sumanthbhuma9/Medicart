import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attaches the JWT auth token if it exists in localStorage.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Service Calls ---

export const authAPI = {
  login: async (email, password) => {
    return API.post('/auth/login', { email, password });
  },

  signup: async (userData) => {
    return API.post('/auth/signup', userData);
  },

  getMe: async () => {
    return API.get('/auth/me');
  }
};

export const productsAPI = {
  getAll: async () => {
    return API.get('/products');
  },

  getById: async (id) => {
    return API.get(`/products/${id}`);
  },

  create: async (productData) => {
    return API.post('/products', productData);
  },

  update: async (id, productData) => {
    return API.put(`/products/${id}`, productData);
  },

  delete: async (id) => {
    return API.delete(`/products/${id}`);
  }
};

export const ordersAPI = {
  create: async (orderData) => {
    return API.post('/orders', orderData);
  },

  getAll: async () => {
    return API.get('/orders');
  },

  updateStatus: async (id, status) => {
    return API.put(`/orders/${id}/status`, { status });
  }
};

export const usersAPI = {
  getAll: async () => {
    return API.get('/users');
  },

  create: async (userData) => {
    return API.post('/users', userData);
  },

  delete: async (email) => {
    return API.delete(`/users/${encodeURIComponent(email)}`);
  }
};

export const aiAPI = {
  analyzeSymptoms: async (symptoms) => {
    return API.post('/ai/analyze-symptoms', { symptoms });
  }
};

export default API;
