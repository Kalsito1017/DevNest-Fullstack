import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'https://localhost:44320/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true, // ✅ CRITICAL: This sends cookies with requests
});

// Request interceptor - just for logging
api.interceptors.request.use(
    (config) => {
        console.log(`➡️ API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);


// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response ${response.status}: ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Auto-redirect to login on 401
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            console.log('🔄 Redirecting to login due to 401');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;