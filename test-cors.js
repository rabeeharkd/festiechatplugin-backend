const axios = require('axios');

async function testCORS() {
  console.log('🌐 Testing CORS configuration...\n');
  
  const backendURLs = [
    'https://festiechatplugin-backend-8g96.onrender.com',
    'https://https://festiechatplugin-backend-8g96.onrender.com'
  ];
  
  for (const url of backendURLs) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'Origin': 'https://fmsplugin.vercel.app'
        }
      });
      console.log(`✅ ${url} - Status: ${response.status}`);
      console.log(`   Response: ${response.data}`);
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
      }
    }
    console.log('');
  }
}

testCORS();