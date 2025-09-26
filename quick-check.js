const axios = require('axios');

async function quickDeploymentCheck() {
  console.log('🔍 Quick Deployment Status Check\n');
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    // Check health endpoint
    const health = await axios.get(`${API_BASE}/api/health`);
    console.log('📊 Current Deployment Info:');
    console.log(`   Message: ${health.data.message}`);
    console.log(`   Version: ${health.data.version || 'Old version (not set)'}`);
    console.log(`   Features: ${health.data.features ? health.data.features.join(', ') : 'Not listed'}`);
    console.log(`   Database: ${health.data.database}\n`);
    
    // Quick test of problematic route
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'amjedvnml@gmail.com',
        password: 'admin123456'
      });
      
      const authToken = loginResponse.data.accessToken;
      console.log('🔐 Authentication: ✅ Working');
      
      // Test POST /api/chats
      const createChatResponse = await axios.post(`${API_BASE}/api/chats`, {
        name: 'Quick Test Chat',
        type: 'group'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('💬 Chat Creation: ✅ Working');
      console.log(`   Chat ID: ${createChatResponse.data.data._id}`);
      console.log('\n🎉 ALL SYSTEMS GO!');
      console.log('Your backend is fully operational for frontend integration.');
      
    } catch (chatError) {
      console.log('💬 Chat Creation: ❌ Still not working');
      console.log(`   Status: ${chatError.response?.status}`);
      console.log(`   Error: ${chatError.message}`);
      
      if (chatError.response?.status === 404) {
        console.log('\n⏳ Deployment still in progress...');
        console.log('The chat routes are not yet available in the deployed version.');
      }
    }
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

quickDeploymentCheck();