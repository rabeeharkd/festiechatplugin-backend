const axios = require('axios');

async function testCorrectURL() {
  console.log('🧪 Testing Your Correct Backend URL\n');
  
  // ✅ Your correct URL
  const correctURL = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    console.log(`Testing: ${correctURL}`);
    
    // Test health check
    const health = await axios.get(`${correctURL}/api/health`);
    console.log('✅ Health Check: SUCCESS');
    console.log(`   Status: ${health.status}`);
    console.log(`   Message: ${health.data.message}`);
    
    // Test login endpoint availability
    try {
      await axios.post(`${correctURL}/api/auth/login`, {
        email: 'test@test.com',
        password: 'test'
      });
    } catch (loginError) {
      if (loginError.response && loginError.response.status === 401) {
        console.log('✅ Login Endpoint: AVAILABLE (returns 401 as expected for invalid creds)');
      } else if (loginError.response && loginError.response.status === 400) {
        console.log('✅ Login Endpoint: AVAILABLE (returns 400 for validation error)');
      } else {
        console.log('❌ Login Endpoint: Issue -', loginError.message);
      }
    }
    
    console.log('\n🎉 YOUR BACKEND IS WORKING!');
    console.log('✅ Correct URL:', correctURL);
    console.log('✅ Use this URL in your frontend application');
    
  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
  }
}

testCorrectURL();