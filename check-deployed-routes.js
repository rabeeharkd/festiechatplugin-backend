const axios = require('axios');

async function checkDeployedRoutes() {
  console.log('🔍 Checking Deployed API Routes...\n');
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  const routes = [
    { method: 'GET', path: '/', description: 'Health Check' },
    { method: 'POST', path: '/api/auth/register', description: 'User Registration' },
    { method: 'POST', path: '/api/auth/login', description: 'User Login' },
    { method: 'GET', path: '/api/chats', description: 'Get Chats' },
    { method: 'POST', path: '/api/chats', description: 'Create Chat' },
    { method: 'GET', path: '/api/messages', description: 'Get Messages' }
  ];
  
  for (const route of routes) {
    try {
      console.log(`Testing: ${route.method} ${route.path} - ${route.description}`);
      
      if (route.method === 'GET' && route.path === '/') {
        const response = await axios.get(`${API_BASE}${route.path}`);
        console.log(`✅ ${response.status} - ${response.data}`);
      } else if (route.path.includes('/auth/')) {
        // Test auth routes with dummy data
        if (route.path === '/api/auth/register') {
          console.log('   📝 Testing with sample data...');
          try {
            await axios.post(`${API_BASE}${route.path}`, {
              name: 'Test',
              email: 'test@test.com',
              password: '123456'
            });
          } catch (err) {
            if (err.response?.status === 409) {
              console.log('   ✅ Route exists (user already exists)');
            } else if (err.response?.status === 400) {
              console.log('   ✅ Route exists (validation error as expected)');
            } else {
              throw err;
            }
          }
        } else {
          console.log('   🔐 Auth route (skipping without credentials)');
        }
      } else {
        // Test other routes without auth first
        try {
          const response = await axios({
            method: route.method.toLowerCase(),
            url: `${API_BASE}${route.path}`,
            timeout: 5000
          });
          console.log(`   ✅ ${response.status}`);
        } catch (err) {
          if (err.response?.status === 401) {
            console.log('   ✅ Route exists (requires authentication)');
          } else if (err.response?.status === 404) {
            console.log('   ❌ Route not found (404)');
          } else {
            console.log(`   ❌ Error: ${err.response?.status || err.message}`);
          }
        }
      }
      
    } catch (error) {
      console.log(`   ❌ ${error.response?.status || 'Network Error'} - ${error.message}`);
    }
    
    console.log('');
  }
}

checkDeployedRoutes();