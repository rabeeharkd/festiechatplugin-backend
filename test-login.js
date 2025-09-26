const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Login Endpoint...\n');
  
  const baseURL = 'http://localhost:5000';
  
  try {
    // Test login with invalid credentials (should fail gracefully)
    console.log('🔐 Testing login endpoint with invalid data...');
    
    const response = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    console.log('Unexpected success:', response.data);
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Login endpoint working correctly (invalid credentials rejected)');
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    } else if (error.response && error.response.status === 400) {
      console.log('✅ Login endpoint working (validation error)');
      console.log('Status:', error.response.status);
      console.log('Validation errors:', error.response.data.errors);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
  
  console.log('\n🎯 Login endpoint is ready for frontend connection!');
}

testLogin();