const axios = require('axios');

async function testLogin() {
  console.log('🔐 Testing login with CORS headers...\n');
  
  const backendURLs = [
    'https://festiechatplugin-backend-8g96.onrender.com',
    'https://festiechatplugin-backend-8g96.onrender.com'
  ];
  
  const loginData = {
    email: 'amjedvnml@gmail.com',
    password: 'admin123456'
  };
  
  for (const url of backendURLs) {
    try {
      console.log(`Testing login at: ${url}/api/auth/login`);
      
      const response = await axios.post(`${url}/api/auth/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://fmsplugin.vercel.app'
        }
      });
      
      console.log(`✅ Login successful at ${url}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   User: ${response.data.user?.name}`);
      console.log(`   Token: ${response.data.accessToken ? 'Generated' : 'Missing'}`);
      
    } catch (error) {
      console.log(`❌ Login failed at ${url}`);
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    console.log('');
  }
}

testLogin();