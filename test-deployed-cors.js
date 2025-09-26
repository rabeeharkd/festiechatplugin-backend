const axios = require('axios');

async function testCurrentCORS() {
  console.log('🧪 Testing Current Deployed CORS Configuration\n');
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    console.log('Testing CORS from frontend origin: https://fmsplugin.vercel.app');
    
    // Test with the frontend origin that's failing
    const response = await axios.get(`${API_BASE}/api/health`, {
      headers: {
        'Origin': 'https://fmsplugin.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 10000
    });
    
    console.log('✅ CORS Test Successful!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
    console.log(`   Response: ${response.data.message}`);
    
  } catch (error) {
    console.log('❌ CORS Test Failed!');
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    }
    
    console.log('\n🔄 This indicates the deployed version needs the updated CORS configuration.');
  }
  
  // Test without origin header (should work)
  try {
    console.log('\n🧪 Testing without Origin header...');
    const noOriginResponse = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ No Origin Test: SUCCESS');
    console.log(`   Status: ${noOriginResponse.status}`);
  } catch (noOriginError) {
    console.log('❌ No Origin Test: FAILED');
    console.log(`   Error: ${noOriginError.message}`);
  }
}

testCurrentCORS();