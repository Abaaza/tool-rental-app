import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:8000'; // For Android emulator
// const BASE_URL = 'http://localhost:8000'; // For iOS simulator

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface User {
  _id: string;
  name: string;
  companyName: string;
  role: 'admin' | 'customer';
}

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      endpoint: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Add type for axios error
type ApiError = {
  response?: {
    data?: any;
  };
  message?: string;
};

export const toolService = {
  getAllTools: async () => {
    try {
      const response = await api.get('/products');
      console.log('Tools fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get Tools Error:', error);
      return []; // Return empty array instead of throwing
    }
  },

  addTool: async (toolData: any) => {
    try {
      const response = await api.post('/products/add', toolData);
      return response.data;
    } catch (error) {
      console.error('Add Tool Error:', error);
      throw error;
    }
  },

  scanTool: async (nfcId: string) => {
    try {
      const response = await api.get(`/products/scan/${nfcId}`);
      return response.data;
    } catch (error) {
      console.error('Scan Tool Error:', error);
      throw error;
    }
  },
};

export const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      console.log('Users fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get Users Error:', {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status
      });
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timed out. Please try again.');
      }
      throw new Error(error.response?.data?.error || 'Failed to get users');
    }
  },

  addUser: async (userData: {
    name: string;
    companyName: string;
    role: 'admin' | 'customer';
  }) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await api.post('/users/add', userData);
      console.log('User created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Add User Error:', {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status
      });
      
      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timed out. Please try again.');
      }
      if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      if (error.response.status === 400) {
        throw new Error(error.response.data.error || 'Invalid user data');
      }
      
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
  },
};

export const orderService = {
  createOrder: async (orderData: {
    nfcId: string;
    toolName: string;
    customerId: string;
    userId: string;
    timeDuration: number;
    orderId: string;
  }) => {
    try {
      const response = await api.post('/orders/create', orderData);
      return response.data;
    } catch (error) {
      console.error('Create Order Error:', error);
      throw error;
    }
  },

  getAllOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Get orders error:', apiError.response?.data || apiError.message);
      throw error;
    }
  },

  returnOrder: async (orderId: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/return`);
      return response.data;
    } catch (error) {
      console.error('Return Order Error:', error);
      throw error;
    }
  },

  getOrderStatus: async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      console.error('Get Order Status Error:', error);
      throw error;
    }
  }
};

export default api;