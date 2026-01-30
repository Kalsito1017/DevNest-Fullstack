// API Configuration - SINGLE SOURCE OF TRUTH
export const API_CONFIG = {
    BASE_URL: 'http://localhost:5099',  // HTTP on 5099
    BASE_URL_HTTPS: 'https://localhost:5099',  // HTTPS on 5099
    API_PREFIX: '/api',
    FRONTEND_PORT: '5173'
};

// Helper to get full API URL
export const getApiUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};

// Simple fetch wrapper
export const apiFetch = async (endpoint, options = {}) => {
    const url = getApiUrl(endpoint);
    
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        ...options
    };

    console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
    
    try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error ${response.status}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log(`✅ API Success:`, data);
        return data;
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        
        // Provide helpful error message
        if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
            throw new Error(
                `Cannot connect to API at ${url}. Please ensure:\n` +
                `1. The backend is running on port 5099\n` +
                `2. The URL ${url} is accessible in your browser\n` +
                `3. No firewall is blocking the connection`
            );
        }
        
        throw error;
    }
};

// Company API
export const companyApi = {
    getAllCompanies: () => apiFetch('/company'),
    getCompanyById: (id) => apiFetch(`/company/${id}`),
    test: () => apiFetch('/company/test'),
    debug: () => apiFetch('/company/debug')
};

// Health check
export const healthCheck = () => apiFetch('/health');

// Test all endpoints
export const testConnection = async () => {
    console.log('🔍 Testing API connection...');
    
    const endpoints = [
        { name: 'Health', url: getApiUrl('/health') },
        { name: 'Company Test', url: getApiUrl('/company/test') },
        { name: 'Company Data', url: getApiUrl('/company') }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const startTime = Date.now();
            const response = await fetch(endpoint.url, { 
                method: 'GET',
                credentials: 'include'
            });
            const endTime = Date.now();
            
            results.push({
                name: endpoint.name,
                url: endpoint.url,
                status: response.status,
                ok: response.ok,
                time: `${endTime - startTime}ms`,
                success: response.ok
            });
            
            console.log(`${endpoint.name}: ${response.status} ${response.ok ? '✅' : '❌'}`);
        } catch (error) {
            results.push({
                name: endpoint.name,
                url: endpoint.url,
                status: 'ERROR',
                ok: false,
                error: error.message,
                success: false
            });
            console.log(`${endpoint.name}: ERROR ❌ (${error.message})`);
        }
    }
    
    return results;
};