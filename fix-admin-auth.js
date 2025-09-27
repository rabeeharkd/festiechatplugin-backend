const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com';

async function fixAdminAuth() {
    console.log('\n🔧 FIXING ADMIN AUTHENTICATION ISSUE');
    console.log('Target: Reset admin password and test login');
    console.log('═══════════════════════════════════════════════════════════');

    try {
        // Step 1: Reset admin password
        console.log('1️⃣ Resetting admin password...');
        const resetResponse = await axios.post(`${BASE_URL}/api/auth/reset-password-debug`, {
            email: 'amjedvnml@gmail.com',
            newPassword: 'AdminPassword123!'
        });
        
        console.log('✅ Password reset successful:', resetResponse.data.message);
        console.log('👤 User info:', resetResponse.data.user);

        // Step 2: Test login with new password
        console.log('\n2️⃣ Testing login with new password...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'amjedvnml@gmail.com',
            password: 'AdminPassword123!'
        });
        
        console.log('✅ Login successful!');
        console.log('🎫 Access token received:', loginResponse.data.accessToken ? 'Yes' : 'No');
        console.log('🔄 Refresh token received:', loginResponse.data.refreshToken ? 'Yes' : 'No');
        console.log('👤 User role:', loginResponse.data.user.role);
        console.log('🔑 Is admin:', loginResponse.data.user.isAdmin);

        const token = loginResponse.data.accessToken;

        // Step 3: Test chat access with new token
        console.log('\n3️⃣ Testing chat access...');
        const chatResponse = await axios.get(`${BASE_URL}/api/chats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Chat access successful!');
        console.log('📊 Chat count:', chatResponse.data.count);
        console.log('👤 User role in chat response:', chatResponse.data.userRole);
        console.log('💬 Response message:', chatResponse.data.message);

        // Step 4: Test creating a chat
        console.log('\n4️⃣ Testing chat creation...');
        const createResponse = await axios.post(`${BASE_URL}/api/chats`, {
            name: 'Admin Test Chat',
            description: 'Testing admin functionality',
            type: 'group'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Chat creation successful!');
        console.log('🆔 New chat ID:', createResponse.data.data._id);

        console.log('\n' + '═'.repeat(60));
        console.log('🎉 AUTHENTICATION ISSUE FIXED!');
        console.log('═'.repeat(60));
        console.log('✅ Admin password reset to: AdminPassword123!');
        console.log('✅ Login working perfectly');
        console.log('✅ Chat access working');
        console.log('✅ Chat creation working');
        
        console.log('\n🔧 FOR YOUR FRONTEND:');
        console.log('Email: amjedvnml@gmail.com');
        console.log('Password: AdminPassword123!');
        console.log(`Working Token: ${token}`);
        
        console.log('\n💡 FRONTEND DEBUGGING STEPS:');
        console.log('1. Clear localStorage: localStorage.clear()');
        console.log('2. Login with new credentials');
        console.log('3. Check token storage: localStorage.getItem("token")');
        console.log('4. Verify Authorization header: "Bearer " + token');
        
    } catch (error) {
        console.error('❌ Fix failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.log('📄 Full error response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

fixAdminAuth();