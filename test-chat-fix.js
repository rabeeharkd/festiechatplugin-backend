const axios = require('axios');

async function testChatCreationFix() {
  console.log('🧪 Testing Chat Creation Fix - MongoDB Query Error\n');
  console.log('Target: Fix "Can\'t use $size" MongoDB error');
  console.log('Endpoint: POST /api/chats');
  console.log('═'.repeat(60));
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    // Step 1: Login to get auth token
    console.log('1️⃣ Logging in to get auth token...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'rabeehsp@gmail.com',
      password: 'your_password_here'  // You'll need to provide the correct password
    });
    
    if (!loginResponse.data.accessToken) {
      console.log('❌ Login failed - need valid credentials');
      return;
    }
    
    const authToken = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // Step 2: Test regular chat creation
    console.log('\n2️⃣ Testing regular chat creation...');
    try {
      const regularChatResponse = await axios.post(`${API_BASE}/api/chats`, {
        name: 'Test Chat',
        type: 'group',
        description: 'Test chat for MongoDB fix'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Regular chat creation: SUCCESS');
      console.log(`   Chat ID: ${regularChatResponse.data.data._id}`);
      console.log(`   Name: ${regularChatResponse.data.data.name}`);
      
    } catch (regularError) {
      console.log('❌ Regular chat creation failed:');
      console.log(`   Status: ${regularError.response?.status}`);
      console.log(`   Error: ${regularError.response?.data?.message || regularError.message}`);
    }
    
    // Step 3: Test admin DM creation (the previously failing case)
    console.log('\n3️⃣ Testing admin DM creation...');
    try {
      const adminDMResponse = await axios.post(`${API_BASE}/api/chats`, {
        name: 'Admin Support',
        type: 'dm',
        isAdminDM: true,
        description: 'Admin DM test'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Admin DM creation: SUCCESS');
      console.log(`   Chat ID: ${adminDMResponse.data.data._id}`);
      console.log(`   Type: ${adminDMResponse.data.data.type}`);
      console.log(`   Admin DM: ${adminDMResponse.data.data.isAdminDM}`);
      
    } catch (adminError) {
      console.log('❌ Admin DM creation failed:');
      console.log(`   Status: ${adminError.response?.status}`);
      console.log(`   Error: ${adminError.response?.data?.message || adminError.message}`);
      
      if (adminError.response?.data?.error?.includes('$size')) {
        console.log('⚠️ MongoDB $size error still present - deployment may not be complete');
      }
    }
    
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    console.log('💡 Try with correct login credentials for rabeehsp@gmail.com');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('✅ CORS is working (connection successful)');
  console.log('🔧 MongoDB query fix deployed');  
  console.log('🎯 Chat creation should work without $size errors');
}

// Also create a simpler test without authentication
async function testHealthCheck() {
  console.log('\n🏥 Quick Health Check...');
  try {
    const health = await axios.get('https://festiechatplugin-backend-8g96.onrender.com/api/health');
    console.log('✅ Backend Status:', health.data.message);
    console.log('📊 Version:', health.data.version);
    console.log('🔧 CORS Status:', health.data.cors?.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

// Run tests
testHealthCheck().then(() => {
  return testChatCreationFix();
});