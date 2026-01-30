import axios from 'axios';
import { API_CONFIG } from './api';

// Create axios instance with correct URL
const apiClient = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Simple auth service for development
const authService = {
    checkAuth: async () => {
        console.log('🔐 Development auth check');
        
        // Always return authenticated in development
        return {
            isAuthenticated: true,
            username: 'developer',
            displayName: 'Development User',
            firstName: 'Dev',
            email: 'dev@example.com',
            roles: ['user', 'admin'],
            timestamp: new Date().toISOString(),
            environment: 'development',
            message: 'Running without authentication for development'
        };
    },
    
    logout: async () => {
        console.log('🔐 Logout called');
        return { 
            success: true, 
            message: 'Logged out successfully (development mode)' 
        };
    },
    
    // Mock login for development
    login: async (credentials) => {
        console.log('🔐 Mock login with:', credentials);
        return {
            success: true,
            user: {
                username: credentials.username || 'developer',
                displayName: 'Development User',
                firstName: 'Dev',
                email: 'dev@example.com'
            },
            token: 'mock-jwt-token-for-development'
        };
    },
    
    // Mock registration
    register: async (userData) => {
        console.log('🔐 Mock registration with:', userData);
        return {
            success: true,
            user: {
                username: userData.username,
                displayName: userData.displayName || userData.username,
                firstName: userData.firstName || userData.username.split(' ')[0],
                email: userData.email
            },
            message: 'User registered successfully (mock)'
        };
    }
};

export default authService;