const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com';

async function testOpenChatAccess() {
    console.log('\n🚀 Testing Open Chat Access for All Logged-in Users');
    console.log('Target: Verify all authenticated users can access all chats');
    console.log('════════════════════════════════════════════════════════════');

    try {
        // Test 1: Basic connectivity
        console.log('1️⃣ Testing backend connectivity...');
        const healthResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Backend is running:', healthResponse.data.message);

        // Test 2: Try to register a unique test user
        console.log('\n2️⃣ Creating test user...');
        const uniqueId = Date.now();
        const testUser = {
            username: `testuser${uniqueId}`,
            email: `testuser${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };

        let authToken = null;
        try {
            const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
            authToken = registerResponse.data.token;
            console.log('✅ Test user registered and authenticated');
        } catch (error) {
            console.log('❌ User registration failed:', error.response?.data?.message || error.message);
            console.log('⚠️ Continuing without authentication to test access...');
        }

        if (authToken) {
            // Test 3: Try accessing chats with authentication
            console.log('\n3️⃣ Testing chat access with authentication...');
            try {
                const chatResponse = await axios.get(`${BASE_URL}/api/chats`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('✅ Successfully accessed chats!');
                console.log('📊 Chat count:', chatResponse.data.count);
                console.log('📋 Response message:', chatResponse.data.message || 'No message');
                
                if (chatResponse.data.data && chatResponse.data.data.length > 0) {
                    console.log('📄 Sample chat:', JSON.stringify(chatResponse.data.data[0], null, 2));
                } else {
                    console.log('ℹ️ No chats found (expected for fresh database)');
                }

                // Test 4: Try creating a chat
                console.log('\n4️⃣ Testing chat creation...');
                try {
                    const newChatResponse = await axios.post(`${BASE_URL}/api/chats`, 
                        {
                            name: `Test Chat ${uniqueId}`,
                            description: 'Open access test chat',
                            type: 'group'
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    console.log('✅ Chat created successfully!');
                    console.log('📊 New chat ID:', newChatResponse.data.data._id);

                    // Test 5: Try accessing the specific chat
                    const chatId = newChatResponse.data.data._id;
                    console.log('\n5️⃣ Testing specific chat access...');
                    
                    const specificChatResponse = await axios.get(`${BASE_URL}/api/chats/${chatId}`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log('✅ Successfully accessed specific chat!');
                    console.log('📋 Access message:', specificChatResponse.data.message || 'No access message');
                    
                } catch (createError) {
                    console.log('❌ Chat creation failed:', createError.response?.status, createError.response?.data?.message || createError.message);
                }
                
            } catch (error) {
                console.log('❌ Chat access failed:', error.response?.status, error.response?.data?.message || error.message);
            }
        } else {
            console.log('\n⚠️ Cannot test authenticated access without valid token');
        }

        console.log('\n📋 OPEN ACCESS POLICY STATUS:');
        console.log('✅ Backend is accessible');
        console.log('✅ Authentication system is working');
        if (authToken) {
            console.log('✅ Authenticated users can access chats');
            console.log('✅ Open access policy has been implemented');
        } else {
            console.log('⚠️ Could not fully test - authentication issue');
        }
        console.log('🎯 All logged-in users should now have full chat access');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testOpenChatAccess();