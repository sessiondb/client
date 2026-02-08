import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('sdb_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401s
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login if needed
            // We'll handle the redirect in the AuthContext to avoid circular deps
            localStorage.removeItem('sdb_token');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
