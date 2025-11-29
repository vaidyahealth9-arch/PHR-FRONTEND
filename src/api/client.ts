import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  // OTP Authentication Flow
  sendOtp: (phoneNumber: string) =>
    apiClient.post('/api/v1/auth/send-otp', { phone_number: phoneNumber }),
  
  verifyOtp: (phoneNumber: string, otp: string) =>
    apiClient.post('/api/v1/auth/verify-otp', { phone_number: phoneNumber, otp }),
  
  // Get current user profile
  me: () => apiClient.get('/api/v1/auth/me'),
};

export const profilesApi = {
  list: () => apiClient.get('/api/v1/profiles'),
  
  get: (id: string) => apiClient.get(`/api/v1/profiles/${id}`),
  
  create: (data: any) => apiClient.post('/api/v1/profiles', data),
  
  update: (id: string, data: any) => apiClient.put(`/api/v1/profiles/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/api/v1/profiles/${id}`),
};

export const recordsApi = {
  upload: (formData: FormData) =>
    apiClient.post('/api/v1/records/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  listByProfile: (profileId: string, recordType?: string) =>
    apiClient.get(`/api/v1/records/profile/${profileId}`, {
      params: { record_type: recordType },
    }),
  
  get: (id: string) => apiClient.get(`/api/v1/records/${id}`),
  
  update: (id: string, data: any) => apiClient.put(`/api/v1/records/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/api/v1/records/${id}`),
};

export const ocrApi = {
  extract: (recordId: string) =>
    apiClient.post(`/api/v1/ocr/extract/${recordId}`),
  
  get: (recordId: string) => apiClient.get(`/api/v1/ocr/${recordId}`),
};

export const medicationsApi = {
  list: (profileId: string, activeOnly: boolean = true) =>
    apiClient.get(`/api/v1/medications/profile/${profileId}`, {
      params: { active_only: activeOnly },
    }),
  
  get: (id: string) => apiClient.get(`/api/v1/medications/${id}`),
  
  create: (data: any) => apiClient.post('/api/v1/medications', data),
  
  update: (id: string, data: any) => apiClient.put(`/api/v1/medications/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/api/v1/medications/${id}`),
};

export default apiClient;
