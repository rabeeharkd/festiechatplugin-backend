// database.js - Updated for your frontend with correct URLs
class DatabaseManager {
  constructor() {
    // Use environment variable with correct fallback
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://festiechatplugin-backend-8g96.onrender.com';
    
    console.log('🔧 DatabaseManager initialized');
    console.log('🌐 Backend URL:', this.baseURL);
    console.log('🔍 Environment:', import.meta.env.VITE_NODE_ENV || 'production');
  }

  async testConnection() {
    try {
      console.log('🔍 Testing database connection through backend...');
      
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Database connection successful:', data);
      
      return { 
        success: true, 
        data,
        backend: this.baseURL,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      
      // Provide specific error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        if (this.baseURL.includes('localhost')) {
          throw new Error('Cannot connect to local backend. Make sure server is running on http://localhost:5000');
        } else {
          throw new Error('Cannot connect to production backend. Check your internet connection.');
        }
      } else if (error.message.includes('CORS')) {
        throw new Error(`CORS error: ${this.baseURL} needs to allow origin http://localhost:5176`);
      } else {
        throw new Error(`Backend connection failed: ${error.message}`);
      }
    }
  }

  async connect() {
    try {
      console.log('🔌 Connecting to database through backend...');
      console.log('🎯 Target:', this.baseURL);
      
      const result = await this.testConnection();
      
      if (result.success) {
        console.log('✅ Database connection established');
        return {
          success: true,
          message: 'Connected successfully',
          backend: this.baseURL,
          database: result.data.database,
          environment: result.data.environment,
          timestamp: result.data.timestamp
        };
      }
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  // Helper methods
  getApiUrl(endpoint = '') {
    return `${this.baseURL}/api${endpoint}`;
  }

  isLocalBackend() {
    return this.baseURL.includes('localhost');
  }

  isProductionBackend() {
    return this.baseURL.includes('onrender.com');
  }

  // Get backend info
  getBackendInfo() {
    return {
      url: this.baseURL,
      type: this.isLocalBackend() ? 'local' : 'production',
      apiUrl: this.getApiUrl(),
      healthUrl: this.getApiUrl('/health')
    };
  }
}

// Export singleton
const databaseManager = new DatabaseManager();
export default databaseManager;