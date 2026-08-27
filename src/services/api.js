import axios from 'axios';

// --- Axios Instance Setup ---
// Configure the base URL for the backend server.
// In the future, you will replace 'http://localhost:5000/api' with your actual server URL.
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attaches the JWT auth token if it exists in localStorage.
// This is crucial for securing admin/user dashboard routes later.
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

// --- API Service Calls (Placeholders) ---
// These are currently mocked to keep the frontend running smoothly without the backend.
// When you build the backend, uncomment the real Axios calls.

export const authAPI = {
  // Mock login: will later be API.post('/auth/login', credentials)
  login: async (email, password) => {
    console.log(`[API MOCK] Logging in user: ${email}`);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simulate backend response
    if (email === 'admin@sai.com') {
      return { data: { token: 'mock-jwt-admin-token', user: { name: 'Admin Owner', email, role: 'admin' } } };
    }
    return { data: { token: 'mock-jwt-customer-token', user: { name: 'Sai Kumar', email, role: 'customer' } } };
  },

  // Mock register: will later be API.post('/auth/signup', userData)
  signup: async (userData) => {
    console.log('[API MOCK] Signing up user:', userData);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: { success: true, message: 'User registered successfully' } };
  }
};

export const productsAPI = {
  // Mock fetch: will later be API.get('/products')
  getAll: async () => {
    console.log('[API MOCK] Fetching medicines list');
    // return API.get('/products');
  },

  // Mock create: will later be API.post('/products', productData)
  create: async (productData) => {
    console.log('[API MOCK] Creating new medicine:', productData);
    // return API.post('/products', productData);
  },

  // Mock update: will later be API.put(`/products/${id}`, productData)
  update: async (id, productData) => {
    console.log(`[API MOCK] Updating medicine ${id}:`, productData);
    // return API.put(`/products/${id}`, productData);
  },

  // Mock delete: will later be API.delete(`/products/${id}`)
  delete: async (id) => {
    console.log(`[API MOCK] Deleting medicine ${id}`);
    // return API.delete(`/products/${id}`);
  }
};

export const ordersAPI = {
  // Mock create order: will later be API.post('/orders', orderData)
  create: async (orderData) => {
    console.log('[API MOCK] Creating purchase order:', orderData);
    // return API.post('/orders', orderData);
  },

  // Mock fetch orders: will later be API.get('/orders')
  getAll: async () => {
    console.log('[API MOCK] Fetching orders list');
    // return API.get('/orders');
  }
};

export default API;
