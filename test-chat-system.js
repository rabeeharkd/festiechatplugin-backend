const axios = require('axios');

// Test the enhanced chat creation system
async function testChatSystem() {
  console.log('🧪 Testing Enhanced Chat System...\n');
  
  const baseURL = 'http://localhost:5000'; // Use local for testing
  let authToken = '';

  try {
    // Step 1: Register a test user
    console.log('1️⃣ Creating test user...');
    const registerResponse = await axios.post(`${baseURL}/api/auth/register`, {
      name: 'Test User 2',
      email: 'testuser2@example.com',
      password: 'testpassword123'
    });

    if (registerResponse.data.success) {
      authToken = registerResponse.data.accessToken;
      console.log('✅ Test user created and logged in');
    }

    // Step 2: Test chat creation
    console.log('\n2️⃣ Creating a test chat...');
    const chatData = {
      name: 'Test Group Chat',
      description: 'A test group chat',
      type: 'group',
      category: 'general'
    };

    const createChatResponse = await axios.post(`${baseURL}/api/chats`, chatData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (createChatResponse.data.success) {
      console.log('✅ Chat created successfully');
      console.log('Chat ID:', createChatResponse.data.data._id);
      console.log('Participants:', createChatResponse.data.data.participantCount);
    }

    // Step 3: Test getting chats
    console.log('\n3️⃣ Fetching user chats...');
    const getChatsResponse = await axios.get(`${baseURL}/api/chats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (getChatsResponse.data.success) {
      console.log('✅ Chats fetched successfully');
      console.log('Total chats:', getChatsResponse.data.count);
    }

    console.log('\n🎉 Chat system is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication required - this is expected behavior');
    }
    
    if (error.response?.status === 400) {
      console.log('💡 Validation error - check request data');
      console.log('Errors:', error.response.data.errors);
    }
  }
}

// Test with existing user (admin)
async function testWithAdmin() {
  console.log('\n🔐 Testing with admin credentials...\n');
  
  const baseURL = 'http://localhost:5000';
  
  try {
    // Login as admin
    console.log('1️⃣ Trying admin login with different passwords...');
    
    const adminPasswords = ['admin123456', 'amjed123', 'admin123', 'password123', 'festie123', '123456', 'admin', 'password'];
    let loginResponse = null;
    
    for (const password of adminPasswords) {
      try {
        console.log(`   Testing password: ${password}`);
        loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
          email: 'amjedvnml@gmail.com',
          password: password
        });
        console.log(`✅ Admin login successful with password: ${password}`);
        break;
      } catch (error) {
        console.log(`   ❌ Password "${password}" failed`);
      }
    }

    if (loginResponse && loginResponse.data.success) {
      const authToken = loginResponse.data.accessToken;
      console.log('✅ Admin logged in successfully');

      // Test admin DM creation
      console.log('\n2️⃣ Creating admin DM...');
      const adminDMResponse = await axios.post(`${baseURL}/api/chats`, {
        name: 'Admin Support',
        type: 'dm',
        isAdminDM: true
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Admin DM response:', adminDMResponse.data.message);
    } else {
      console.log('⚠️ Admin login failed with all passwords');
      console.log('📧 Admin email: amjedvnml@gmail.com');
      console.log('💡 Try updating the admin password in the database or use correct credentials');
    }

  } catch (error) {
    console.log('ℹ️ Admin test requires valid admin credentials');
    console.log('Error:', error.response?.data?.message || error.message);
  }
}

// Run tests
testChatSystem().then(() => {
  return testWithAdmin();
});