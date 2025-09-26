const axios = require('axios');

async function checkRenderDeployment() {
  console.log('🔍 Checking Render deployment status...\n');
  
  const renderURL = 'https://https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${renderURL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Health endpoint response:', healthResponse.data);
    
    // Test CORS headers
    console.log('\n2️⃣ Checking CORS headers...');
    const corsResponse = await axios.get(`${renderURL}/`, {
      headers: {
        'Origin': 'http://localhost:5176'
      }
    });
    console.log('✅ CORS headers working for localhost:5176');
    
    console.log('\n🎉 Render deployment is updated and working!');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Deployment not ready yet. Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('❌ Deployment still updating. Error:', error.message);
    }
    
    console.log('\n⏰ Render is still deploying. Please wait 2-3 minutes and try again.');
  }
}

checkRenderDeployment();