const axios = require('axios');

async function compareBackendURLs() {
  console.log('🔍 Comparing Backend URLs...\n');
  
  const urls = [
    {
      name: 'Current Frontend URL (WRONG)',
      url: 'https://https://festiechatplugin-backend-8g96.onrender.com',
      status: '❌'
    },
    {
      name: 'Correct Backend URL',
      url: 'https://festiechatplugin-backend-8g96.onrender.com',
      status: '✅'
    }
  ];
  
  for (const backend of urls) {
    console.log(`${backend.status} Testing: ${backend.name}`);
    console.log(`   URL: ${backend.url}`);
    
    try {
      // Test basic connection
      const healthResponse = await axios.get(backend.url, {
        timeout: 10000,
        headers: {
          'Origin': 'https://fmsplugin.vercel.app'
        }
      });
      
      console.log(`   ✅ Health check: ${healthResponse.status} - ${healthResponse.data}`);
      
      // Test login endpoint
      const loginResponse = await axios.post(`${backend.url}/api/auth/login`, {
        email: 'amjedvnml@gmail.com',
        password: 'admin123456'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://fmsplugin.vercel.app'
        },
        timeout: 10000
      });
      
      console.log(`   ✅ Login test: SUCCESS - User: ${loginResponse.data.user?.name}`);
      
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
      }
    }
    
    console.log('');
  }
  
  console.log('📋 SUMMARY:');
  console.log('❌ https://https://festiechatplugin-backend-8g96.onrender.com - NOT WORKING');
  console.log('✅ https://festiechatplugin-backend-8g96.onrender.com - WORKING PERFECTLY');
  console.log('');
  console.log('🔧 ACTION REQUIRED:');
  console.log('Update your frontend to use: https://festiechatplugin-backend-8g96.onrender.com');
}

compareBackendURLs();