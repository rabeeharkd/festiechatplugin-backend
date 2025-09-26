import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // API Base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    
    // Add token to requests if available
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, API_BASE_URL]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with backend API...');
      console.log('📡 API Base URL:', API_BASE_URL);
      console.log('🎯 Full login URL:', `${API_BASE_URL}/api/auth/login`);

      const response = await axios.post('/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('✅ Login response:', response.data);

      if (response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setUser(userData);
        setToken(accessToken);

        console.log('🎉 Login successful for user:', userData.email);
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }

    } catch (error) {
      console.error('❌ Login error:', error);

      let errorMessage = 'Login failed';

      if (error.response) {
        // Server responded with error status
        console.error('📊 Response status:', error.response.status);
        console.error('📄 Response data:', error.response.data);
        errorMessage = error.response.data.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request made but no response received
        console.error('📡 No response received. Is backend running on port 5000?');
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else {
        // Error in request setup
        console.error('⚙️ Request setup error:', error.message);
        errorMessage = error.message || 'Request configuration error';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      console.log('📝 Attempting registration...');

      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setUser(userData);
        setToken(accessToken);

        console.log('✅ Registration successful for:', userData.email);
        return { success: true, user: userData };
      }

    } catch (error) {
      console.error('❌ Registration error:', error);

      let errorMessage = 'Registration failed';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Attempt to logout on server
      if (token) {
        const refreshToken = localStorage.getItem('refreshToken');
        await axios.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.warn('Server logout failed:', error.message);
    } finally {
      // Clear local state regardless
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      console.log('🚪 Logged out successfully');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const savedRefreshToken = localStorage.getItem('refreshToken');
      if (!savedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('/api/auth/refresh-token', {
        refreshToken: savedRefreshToken
      });

      if (response.data.success) {
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        setToken(accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;