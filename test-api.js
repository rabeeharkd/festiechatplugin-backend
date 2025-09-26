const axios = require('axios');

async function testBackendAPI() {
  console.log('🧪 Testing Backend API...\n');
  
  const baseURL = 'http://localhost:5000';
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Auth health check  
    console.log('\n2️⃣ Testing auth health endpoint...');
    const authHealthResponse = await axios.get(`${baseURL}/api/auth/health`);
    console.log('✅ Auth health:', authHealthResponse.data);
    
    // Test 3: Register endpoint (POST)
    console.log('\n3️⃣ Testing register endpoint structure...');
    try {
      await axios.post(`${baseURL}/api/auth/register`, {});
    } catch (error) {
      if (error.response) {
        console.log('✅ Register endpoint accessible (validation error expected)');
        console.log('Response status:', error.response.status);
      }
    }
    
    console.log('\n🎉 Backend API is working correctly!');
    
  } catch (error) {
    console.error('❌ Backend API Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testBackendAPI();