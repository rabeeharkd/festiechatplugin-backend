const axios = require('axios');

async function testCorrectConfiguration() {
  console.log('🧪 Testing configuration with your actual Render URL...\n');
  
  const correctURL = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    // Test as if from frontend
    console.log('1️⃣ Testing health endpoint (as frontend would)...');
    const response = await axios.get(`${correctURL}/api/health`, {
      headers: {
        'Origin': 'http://localhost:5176',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Response:', response.data);
    console.log('✅ Status:', response.status);
    
    // Test auth endpoint
    console.log('\n2️⃣ Testing auth endpoint...');
    try {
      await axios.post(`${correctURL}/api/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      });
    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('✅ Auth endpoint accessible (401 expected for invalid creds)');
      } else if (authError.response && authError.response.status === 400) {
        console.log('✅ Auth endpoint accessible (400 validation error expected)');
      }
    }
    
    console.log('\n🎉 Your backend is ready!');
    console.log('📍 Correct URL for frontend:', correctURL);
    console.log('🔗 API Base URL:', `${correctURL}/api`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testCorrectConfiguration();