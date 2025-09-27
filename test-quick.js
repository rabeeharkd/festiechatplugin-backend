const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com';

async function quickTest() {
    console.log('\n🔍 Quick Individual Chat Access Test');
    console.log('═══════════════════════════════════════');
    
    try {
        // Register a test user
        const uniqueId = Date.now();
        const testUser = {
            name: `Test User ${uniqueId}`,
            email: `testuser${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };

        const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
        const authToken = registerResponse.data.accessToken;
        console.log('✅ User registered and token received');

        // Create a chat
        const chatResponse = await axios.post(`${BASE_URL}/api/chats`, 
            {
                name: `Test Chat ${uniqueId}`,
                type: 'group'
            },
            {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );
        
        const chatId = chatResponse.data.data._id;
        console.log('✅ Chat created:', chatId);

        // Try to access the chat immediately
        console.log('🔍 Testing individual chat access...');
        const individualResponse = await axios.get(`${BASE_URL}/api/chats/${chatId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('✅ SUCCESS! Individual chat access works');
        console.log('📄 Response message:', individualResponse.data.message);
        
    } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
        
        if (error.response?.status === 403) {
            console.log('🚨 Access denied - deployment may not be complete');
        }
    }
}

quickTest();