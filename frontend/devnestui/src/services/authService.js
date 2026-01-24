// src/services/authService.js
import axios from 'axios';

// Update this to match your .NET backend URL
const API_BASE_URL = 'https://localhost:44320/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const authService = {
    // Register user
    register: async (firstName, lastName, email, password) => {
        const requestData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            password: password
        };

        console.log('Sending registration:', requestData);

        try {
            const response = await api.post('/auth/register', requestData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response || error);
            throw error;
        }
    },

    // Login user
    login: async (email, password, rememberMe = false) => {
        const requestData = {
            email: email.trim().toLowerCase(),
            password: password,
            rememberMe: rememberMe
        };

        console.log('Sending login:', requestData);

        try {
            const response = await api.post('/auth/login', requestData);
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response || error);
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    },

    // Check auth status
    checkAuth: async () => {
        try {
            const response = await api.get('/auth/check');
            return response.data;
        } catch (error) {
            console.error('Check auth error:', error);
            return { authenticated: false };
        }
    },

    // Check if user exists
    checkUserExists: async (email) => {
        try {
            const response = await api.get(`/auth/exists/${email}`);
            return response.data;
        } catch (error) {
            console.error('Check user exists error:', error);
            return { exists: false };
        }
    },

    // Get cached user (for your Header.jsx)
    getCachedUser: () => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    // Cache user (optional helper)
    cacheUser: (userData) => {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    // Clear cached user
    clearCachedUser: () => {
        localStorage.removeItem('currentUser');
    }
};

// ⚠️ IMPORTANT: Export as default
export default authService;