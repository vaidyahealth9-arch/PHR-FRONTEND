import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const INTERNAL_HOSTNAMES = new Set(['phr-backend', 'phr-frontend', 'host.docker.internal']);

const resolveApiBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_URL || '').trim();

  if (!configured) {
    return '';
  }

  try {
    const parsed = new URL(configured, window.location.origin);
    if (INTERNAL_HOSTNAMES.has(parsed.hostname)) {
      return '';
    }
  } catch {
    // Fall through and use the configured value as-is.
  }

  return configured.replace(/\/$/, '');
};

const API_BASE_URL = resolveApiBaseUrl();
const REFRESH_ENDPOINT = '/api/v1/auth/refresh';

let lastAuthFailureRedirectAt = 0;

const redirectToLoginWithoutReload = () => {
  const path = window.location.pathname;
  if (path === '/login' || path === '/signup') {
    return;
  }

  const now = Date.now();
  if (now - lastAuthFailureRedirectAt < 1500) {
    return;
  }

  lastAuthFailureRedirectAt = now;
  window.history.pushState({}, '', '/login');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

let onAuthFailureRedirect: () => void = () => {
  redirectToLoginWithoutReload();
};

export const __setAuthFailureRedirectForTests = (handler: () => void) => {
  onAuthFailureRedirect = handler;
};

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
    const isRefreshRequest = originalRequest?.url?.includes(REFRESH_ENDPOINT);

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
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
        onAuthFailureRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  signup: (data: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    contact_phone: string;
    contact_email?: string;
    gender?: string;
    date_of_birth?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  }) =>
    apiClient.post('/api/v1/auth/signup', {
      ...data,
    }),
  // OTP Authentication Flow
  sendOtp: (phoneNumber: string) =>
    apiClient.post('/api/v1/auth/send-otp', { phone_number: phoneNumber }),
  
  verifyOtp: (phoneNumber: string, otp: string) =>
    apiClient.post('/api/v1/auth/verify-otp', { phone_number: phoneNumber, otp }),

  refresh: (refreshToken: string) =>
    apiClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken }),

  logout: (refreshToken?: string) =>
    apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken }),
  
  // Get current user profile
  me: () => apiClient.get('/api/v1/auth/me'),

  // Update current user profile
  updateMe: (data: {
    first_name?: string | null;
    last_name?: string | null;
    middle_name?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    contact_email?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  }) => apiClient.put('/api/v1/auth/me', data),
};

export const profilesApi = {
  list: () => apiClient.get('/api/v1/profiles'),
  
  get: (id: string) => apiClient.get(`/api/v1/profiles/${id}`),
  
  create: (data: any) => apiClient.post('/api/v1/profiles', data),
  
  update: (id: string, data: any) => apiClient.put(`/api/v1/profiles/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/api/v1/profiles/${id}`),
};

export const recordsApi = {
  
  // Shared query params for records listing
  
  // List medical records with optional filters
  list: (params?: {
    search?: string;
    status?: string;
    record_type?: string;
    source?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    page_size?: number;
    sort_by?: 'date' | 'display_id' | 'status' | 'source' | 'type';
    sort_order?: 'asc' | 'desc';
  }) =>
    apiClient.get('/api/v1/records', { params }),

  // List medical records with optional filters
  upload: (formData: FormData) =>
    apiClient.post('/api/v1/records/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  listByProfile: (
    profileId: string,
    params?: {
      search?: string;
      status?: string;
      record_type?: string;
      source?: string;
      from_date?: string;
      to_date?: string;
      page?: number;
      page_size?: number;
      sort_by?: 'date' | 'display_id' | 'status' | 'source' | 'type';
      sort_order?: 'asc' | 'desc';
    }
  ) =>
    apiClient.get(`/api/v1/records/profile/${profileId}`, {
      params,
    }),
  
  get: (id: string) => apiClient.get(`/api/v1/records/${id}`),
  
  getDetails: (id: number) => apiClient.get(`/api/v1/records/${id}`),
  
  download: (id: number) => apiClient.get(`/api/v1/records/${id}/download`, { responseType: 'blob' }),
  
  update: (id: string, data: any) => apiClient.put(`/api/v1/records/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/api/v1/records/${id}`),
};

export const ocrApi = {
  extract: (recordId: string) =>
    apiClient.post(`/api/v1/ocr/extract/${recordId}`),
  
  get: (recordId: string) => apiClient.get(`/api/v1/ocr/${recordId}`),

  confirm: (
    recordId: string,
    payload: {
      title?: string;
      record_type?: string;
      issued_date?: string;
      source_facility?: string;
      source_doctor?: string;
      confirmed_tags: string[];
    }
  ) => apiClient.post(`/api/v1/ocr/${recordId}/confirm`, payload),
};
 
 export const limsApi = {
  getLinkedReports: (profileId?: string) =>
    apiClient.get('/api/v1/linked/lims/reports', { params: profileId ? { profile_id: profileId } : undefined }),
  downloadLinkedReportPdf: (reportId: number, reportType: string = 'regular', withHeader: boolean = true, profileId?: string) =>
    apiClient.get(`/api/v1/linked/lims/reports/${reportId}/pdf`, {
      params: { report_type: reportType, with_header: withHeader, ...(profileId ? { profile_id: profileId } : {}) },
      responseType: 'blob',
    }),
  getLinkedBills: (profileId?: string) => apiClient.get('/api/v1/linked/lims/bills', { params: profileId ? { profile_id: profileId } : undefined }),
  getAnalyteHistory: (profileId?: string) => apiClient.get('/api/v1/linked/lims/analyte-history', { params: profileId ? { profile_id: profileId } : undefined }),
};
 
 export default apiClient;
