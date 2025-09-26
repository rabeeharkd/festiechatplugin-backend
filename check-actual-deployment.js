const axios = require('axios');

async function checkActualDeployment() {
  console.log('🔍 Checking your actual Render deployment...\n');
  
  const actualRenderURL = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    // Test root endpoint
    console.log('1️⃣ Testing root endpoint...');
    const rootResponse = await axios.get(`${actualRenderURL}/`, {
      timeout: 15000
    });
    console.log('✅ Root endpoint:', rootResponse.data);
    
    // Test health endpoint
    console.log('\n2️⃣ Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${actualRenderURL}/api/health`, {
        timeout: 15000
      });
      console.log('✅ Health endpoint:', healthResponse.data);
    } catch (healthError) {
      console.log('❌ Health endpoint not available yet:', healthError.response?.status || healthError.message);
    }
    
    // Test CORS with your frontend origin
    console.log('\n3️⃣ Testing CORS for localhost:5176...');
    try {
      const corsResponse = await axios.get(`${actualRenderURL}/`, {
        headers: {
          'Origin': 'http://localhost:5176'
        },
        timeout: 15000
      });
      console.log('✅ CORS working for localhost:5176');
    } catch (corsError) {
      if (corsError.response?.status) {
        console.log('❌ CORS issue. Status:', corsError.response.status);
        console.log('Need to update CORS configuration for localhost:5176');
      } else {
        console.log('❌ CORS test failed:', corsError.message);
      }
    }
    
    console.log('\n📍 Your deployment URL:', actualRenderURL);
    
  } catch (error) {
    console.error('❌ Deployment check failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔄 Deployment might still be starting up...');
    }
  }
}

checkActualDeployment();