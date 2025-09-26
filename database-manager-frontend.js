// database.js - Updated for your frontend
// Replace your current database.js with this

class DatabaseManager {
  constructor() {
    // Use environment variable or fall back to local development
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    
    console.log('🔧 DatabaseManager initialized with:', this.baseURL);
  }

  async testConnection() {
    try {
      console.log('🔍 Testing backend connection...');
      console.log('🌐 Backend URL:', this.baseURL);
      
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Backend health check successful:', data);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      
      // Provide helpful error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running on ' + this.baseURL);
      } else if (error.message.includes('CORS')) {
        throw new Error('CORS error: Backend needs to allow your frontend origin');
      } else {
        throw new Error('Backend connection failed: ' + error.message);
      }
    }
  }

  async connect() {
    try {
      console.log('🔌 Connecting to database through backend...');
      
      // Test backend health first
      const healthCheck = await this.testConnection();
      
      if (healthCheck.success) {
        console.log('✅ Database connection established successfully');
        return {
          success: true,
          message: 'Connected to backend successfully',
          backend: this.baseURL,
          database: healthCheck.data.database || 'Connected'
        };
      }
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  // Helper method to get API URL
  getApiUrl(endpoint = '') {
    return `${this.baseURL}/api${endpoint}`;
  }

  // Helper method to check if using local backend
  isLocalBackend() {
    return this.baseURL.includes('localhost');
  }
}

// Export singleton instance
const databaseManager = new DatabaseManager();
export default databaseManager;

// Also export the class for testing
export { DatabaseManager };