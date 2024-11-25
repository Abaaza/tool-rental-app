import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:8000'; // For Android emulator
// const BASE_URL = 'http://localhost:8000'; // For iOS simulator

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
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
  addTool: async (toolData: {
    nfcId: string;
    name: string;
    image: string;
    price: number;
  }) => {
    try {
      const response = await api.post('/products/add', toolData);
      return response.data;
    } catch (error: unknown) {
      console.error('Add Tool Error:', error);
      throw error;
    }
  },

  scanTool: async (nfcId: string) => {
    try {
      const response = await api.get(`/products/scan/${nfcId}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Scan Tool Error:', error);
      throw error;
    }
  },
};

export const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Get Users Error:', error);
      throw error;
    }
  },

  addUser: async (userData: {
    name: string;
    companyName: string;
    role: 'admin' | 'customer';
  }) => {
    try {
      const response = await api.post('/users/add', userData);
      return response.data;
    } catch (error) {
      console.error('Add User Error:', error);
      throw error;
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
};



export default api;