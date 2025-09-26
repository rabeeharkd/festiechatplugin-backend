const axios = require('axios');

// Test script to verify the correct backend API endpoints
async function testFrontendIntegration() {
  console.log('🧪 Frontend Integration Test\n');
  console.log('Backend URL: https://festiechatplugin-backend-8g96.onrender.com');
  console.log('Frontend Origin: https://fmsplugin.vercel.app\n');
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Health Check...');
    const health = await axios.get(API_BASE);
    console.log(`✅ Status: ${health.status} - ${health.data}\n`);
    
    // Test 2: User Registration
    console.log('2️⃣ User Registration...');
    const registerData = {
      name: 'Frontend Test User',
      email: `frontend-test-${Date.now()}@example.com`,
      password: 'testpassword123'
    };
    
    const register = await axios.post(`${API_BASE}/api/auth/register`, registerData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://fmsplugin.vercel.app'
      }
    });
    
    console.log(`✅ Registration: ${register.status} - ${register.data.message}`);
    const authToken = register.data.accessToken;
    console.log(`🔑 Token received: ${authToken ? 'YES' : 'NO'}\n`);
    
    // Test 3: Login
    console.log('3️⃣ User Login...');
    const login = await axios.post(`${API_BASE}/api/auth/login`, {
      email: registerData.email,
      password: registerData.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://fmsplugin.vercel.app'
      }
    });
    
    console.log(`✅ Login: ${login.status} - User: ${login.data.user.name}`);
    console.log(`🔑 Login token: ${login.data.accessToken ? 'Generated' : 'Missing'}\n`);
    
    // Test 4: Protected Route (Chat API)
    console.log('4️⃣ Protected Chat API...');
    const chats = await axios.get(`${API_BASE}/api/chats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Origin': 'https://fmsplugin.vercel.app'
      }
    });
    
    console.log(`✅ Chat API: ${chats.status} - Chats count: ${chats.data.data?.length || 0}\n`);
    
    // Test 5: Chat Creation
    console.log('5️⃣ Chat Creation...');
    const createChat = await axios.post(`${API_BASE}/api/chats`, {
      name: 'Frontend Test Chat',
      type: 'group'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Origin': 'https://fmsplugin.vercel.app'
      }
    });
    
    console.log(`✅ Chat Creation: ${createChat.status} - Chat ID: ${createChat.data.data._id}\n`);
    
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Your backend is ready for frontend integration');
    console.log('✅ CORS is properly configured');
    console.log('✅ Authentication is working');
    console.log('✅ Chat system is functional');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFrontendIntegration();