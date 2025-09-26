/* 
 * Frontend Configuration for FestieChat
 * Copy this content to your frontend project
 */

// 1. Create or update .env file in your frontend root:
/*
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
*/

// 2. Update your AuthContext.jsx:
export const AuthContextConfig = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // Updated login function
  login: async (email, password) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    
    try {
      console.log('Attempting login with backend API...');
      console.log('API Base URL:', API_BASE_URL);
      console.log('Full login URL:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update auth state
        setUser(user);
        setToken(accessToken);
        
        console.log('✅ Login successful:', user);
        return { success: true, user };
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        return { 
          success: false, 
          message: error.response.data.message || 'Login failed' 
        };
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        return { 
          success: false, 
          message: 'Cannot connect to server. Please check if backend is running on port 5000.' 
        };
      } else {
        // Error in request setup
        console.error('Request setup error:', error.message);
        return { 
          success: false, 
          message: 'Request configuration error' 
        };
      }
    }
  }
};

// 3. Alternative: Vite Proxy Configuration (vite.config.js):
export const viteProxyConfig = {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
};

// 4. Axios Base Configuration (create api.js file):
export const axiosConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};