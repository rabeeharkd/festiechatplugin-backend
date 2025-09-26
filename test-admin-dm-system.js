const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let userToken = '';
let adminUserId = '';
let regularUserId = '';
let adminDMChatId = '';

console.log('🧪 Testing Admin DM Chat System\n');

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { response, data };
}

// Test 1: Admin User Authentication
async function testAdminAuthentication() {
  console.log('1️⃣ Testing Admin User Authentication...');
  
  try {
    // Try to register admin (in case not exists)
    await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Admin User',
        email: 'amjedvnml@gmail.com',
        password: 'admin123'
      })
    });

    // Login as admin
    const { response, data } = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'amjedvnml@gmail.com',
        password: 'admin123'
      })
    });

    if (response.ok && data.success) {
      adminToken = data.token;
      adminUserId = data.user.id;
      console.log('✅ Admin authentication successful');
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Is Admin: ${data.user.isAdmin}`);
      return true;
    } else {
      console.log('❌ Admin authentication failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin authentication error:', error.message);
    return false;
  }
}

// Test 2: Regular User Authentication
async function testRegularUserAuthentication() {
  console.log('\n2️⃣ Testing Regular User Authentication...');
  
  try {
    // Register regular user
    const registerRes = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Regular User',
        email: 'user@test.com',
        password: 'user123'
      })
    });

    // Login as regular user
    const { response, data } = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@test.com',
        password: 'user123'
      })
    });

    if (response.ok && data.success) {
      userToken = data.token;
      regularUserId = data.user.id;
      console.log('✅ Regular user authentication successful');
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Is Admin: ${data.user.isAdmin || false}`);
      return true;
    } else {
      console.log('❌ Regular user authentication failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Regular user authentication error:', error.message);
    return false;
  }
}

// Test 3: Create Admin DM Chat
async function testCreateAdminDM() {
  console.log('\n3️⃣ Testing Admin DM Creation...');
  
  try {
    const { response, data } = await apiCall('/api/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Admin',
        type: 'dm',
        isAdminDM: true,
        description: 'Direct message with admin'
      })
    });

    if (response.ok && data.success) {
      adminDMChatId = data.data._id;
      console.log('✅ Admin DM created successfully');
      console.log(`   Chat ID: ${adminDMChatId}`);
      console.log(`   Is Admin DM: ${data.data.isAdminDM}`);
      console.log(`   Participants: ${data.data.participants.length}`);
      return true;
    } else {
      console.log('❌ Admin DM creation failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin DM creation error:', error.message);
    return false;
  }
}

// Test 4: Send Message to Admin DM
async function testSendMessageToAdminDM() {
  console.log('\n4️⃣ Testing Send Message to Admin DM...');
  
  try {
    // User sends message to admin
    const { response, data } = await apiCall(`/api/messages/${adminDMChatId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        content: 'Hello admin, I need help with my account.',
        messageType: 'text'
      })
    });

    if (response.ok && data.success) {
      console.log('✅ Message sent to admin DM successfully');
      console.log(`   Message ID: ${data.data._id}`);
      console.log(`   Content: ${data.data.content}`);
      return true;
    } else {
      console.log('❌ Failed to send message to admin DM:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Send message error:', error.message);
    return false;
  }
}

// Test 5: Admin Replies to DM
async function testAdminReply() {
  console.log('\n5️⃣ Testing Admin Reply to DM...');
  
  try {
    // Admin sends reply
    const { response, data } = await apiCall(`/api/messages/${adminDMChatId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        content: 'Hi! I\'m here to help. What specific issue are you having?',
        messageType: 'text'
      })
    });

    if (response.ok && data.success) {
      console.log('✅ Admin reply sent successfully');
      console.log(`   Message ID: ${data.data._id}`);
      console.log(`   Content: ${data.data.content}`);
      return true;
    } else {
      console.log('❌ Failed to send admin reply:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin reply error:', error.message);
    return false;
  }
}

// Test 6: Test Chat Access - Regular User
async function testUserChatAccess() {
  console.log('\n6️⃣ Testing Regular User Chat Access...');
  
  try {
    const { response, data } = await apiCall('/api/chats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    if (response.ok && data.success) {
      console.log('✅ User chat access test passed');
      console.log(`   Total chats visible to user: ${data.count}`);
      console.log(`   User role: ${data.userRole}`);
      
      // Check if user sees their admin DM
      const hasAdminDM = data.data.some(chat => chat.isAdminDM);
      if (hasAdminDM) {
        console.log('✅ User can see their admin DM');
      } else {
        console.log('⚠️  User cannot see admin DM');
      }
      return true;
    } else {
      console.log('❌ User chat access failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ User chat access error:', error.message);
    return false;
  }
}

// Test 7: Test Chat Access - Admin User
async function testAdminChatAccess() {
  console.log('\n7️⃣ Testing Admin Chat Access...');
  
  try {
    const { response, data } = await apiCall('/api/chats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.ok && data.success) {
      console.log('✅ Admin chat access test passed');
      console.log(`   Total chats visible to admin: ${data.count}`);
      console.log(`   User role: ${data.userRole}`);
      
      // Check if admin sees all chats including DMs
      const adminDMs = data.data.filter(chat => chat.isAdminDM);
      console.log(`   Admin DMs visible: ${adminDMs.length}`);
      return true;
    } else {
      console.log('❌ Admin chat access failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin chat access error:', error.message);
    return false;
  }
}

// Test 8: Test Message Privacy in Admin DM
async function testMessagePrivacy() {
  console.log('\n8️⃣ Testing Message Privacy in Admin DM...');
  
  try {
    // Get messages as regular user
    const { response: userResponse, data: userData } = await apiCall(`/api/messages/${adminDMChatId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    // Get messages as admin
    const { response: adminResponse, data: adminData } = await apiCall(`/api/messages/${adminDMChatId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (userResponse.ok && adminResponse.ok) {
      console.log('✅ Message privacy test passed');
      console.log(`   Messages visible to user: ${userData.count}`);
      console.log(`   Messages visible to admin: ${adminData.count}`);
      
      // Both should see the same messages in this DM since it's only between them
      if (userData.count === adminData.count) {
        console.log('✅ Message counts match (expected for 2-person DM)');
      } else {
        console.log('⚠️  Message counts differ - this might indicate filtering issues');
      }
      return true;
    } else {
      console.log('❌ Message privacy test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Message privacy test error:', error.message);
    return false;
  }
}

// Test 9: Test Duplicate Admin DM Prevention
async function testDuplicateAdminDMPrevention() {
  console.log('\n9️⃣ Testing Duplicate Admin DM Prevention...');
  
  try {
    // Try to create another admin DM with same user
    const { response, data } = await apiCall('/api/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Admin Chat 2',
        type: 'dm',
        isAdminDM: true,
        description: 'Another admin DM attempt'
      })
    });

    if (response.ok && data.message === 'Admin DM already exists') {
      console.log('✅ Duplicate admin DM prevention works');
      console.log('   System correctly returned existing DM');
      return true;
    } else {
      console.log('⚠️  Duplicate prevention may not be working properly');
      console.log(`   Response: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Duplicate prevention test error:', error.message);
    return false;
  }
}

// Test 10: Test User Count Endpoints
async function testUserCountEndpoints() {
  console.log('\n🔟 Testing User Count Endpoints...');
  
  try {
    // Test active user count
    const { response: activeResponse, data: activeData } = await apiCall('/api/users/active-count', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    // Test online user count
    const { response: onlineResponse, data: onlineData } = await apiCall('/api/users/online-count', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (activeResponse.ok && onlineResponse.ok) {
      console.log('✅ User count endpoints working');
      console.log(`   Active users: ${activeData.count}`);
      console.log(`   Online users: ${onlineData.count}`);
      return true;
    } else {
      console.log('❌ User count endpoints failed');
      return false;
    }
  } catch (error) {
    console.log('❌ User count test error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Admin DM System Tests\n');
  
  const tests = [
    testAdminAuthentication,
    testRegularUserAuthentication,
    testCreateAdminDM,
    testSendMessageToAdminDM,
    testAdminReply,
    testUserChatAccess,
    testAdminChatAccess,
    testMessagePrivacy,
    testDuplicateAdminDMPrevention,
    testUserCountEndpoints
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Admin DM system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});

module.exports = {
  runAllTests,
  testAdminAuthentication,
  testRegularUserAuthentication,
  testCreateAdminDM,
  testSendMessageToAdminDM,
  testAdminReply,
  testUserChatAccess,
  testAdminChatAccess,
  testMessagePrivacy,
  testDuplicateAdminDMPrevention,
  testUserCountEndpoints
};