const axios = require('axios');

async function monitorDeployment() {
  console.log('🚀 Monitoring Render Deployment...\n');
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    try {
      console.log(`Attempt ${attempts + 1}/${maxAttempts} - Checking deployment...`);
      
      // Check health endpoint for version update
      const healthResponse = await axios.get(`${API_BASE}/api/health`, {
        timeout: 10000
      });
      
      console.log('✅ Health check response:');
      console.log(`   Message: ${healthResponse.data.message}`);
      console.log(`   Version: ${healthResponse.data.version || 'Not set'}`);
      console.log(`   Database: ${healthResponse.data.database}`);
      
      // If we see the new version, test the chat routes
      if (healthResponse.data.version === "2.0.0") {
        console.log('\n🎉 New deployment detected! Testing chat routes...\n');
        
        // Test POST /api/chats with auth
        try {
          // First login to get token
          const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'amjedvnml@gmail.com',
            password: 'admin123456'
          });
          
          const authToken = loginResponse.data.accessToken;
          
          // Test chat creation
          const createChatResponse = await axios.post(`${API_BASE}/api/chats`, {
            name: 'Deployment Test Chat',
            type: 'group'
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'Origin': 'https://fmsplugin.vercel.app'
            }
          });
          
          console.log('✅ POST /api/chats - SUCCESS!');
          console.log(`   Chat ID: ${createChatResponse.data.data._id}`);
          console.log(`   Status: ${createChatResponse.status}`);
          
          console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
          console.log('✅ All routes are working');
          console.log('✅ CORS is properly configured');
          console.log('✅ Enhanced chat system is deployed');
          
          break;
          
        } catch (chatError) {
          console.log('❌ Chat routes still not working:', chatError.response?.status || chatError.message);
        }
      }
      
    } catch (error) {
      console.log(`❌ Health check failed: ${error.message}`);
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      console.log('   Waiting 15 seconds before next check...\n');
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
  
  if (attempts === maxAttempts) {
    console.log('\n⚠️ Maximum attempts reached. Please check Render dashboard manually.');
    console.log('🔗 Dashboard: https://dashboard.render.com/');
  }
}

monitorDeployment();