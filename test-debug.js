const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com';

async function detailedDebugTest() {
    console.log('\n🔍 Detailed Debug Test - Open Access Policy');
    console.log('═══════════════════════════════════════════════════');
    
    try {
        // Step 1: Register user
        const uniqueId = Date.now();
        const testUser = {
            name: `Debug User ${uniqueId}`,
            email: `debug${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };

        console.log('1️⃣ Registering user...');
        const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
        const authToken = registerResponse.data.accessToken;
        console.log('✅ User registered:', registerResponse.data.user.email);

        // Step 2: List all chats first
        console.log('\n2️⃣ Listing all chats...');
        const listResponse = await axios.get(`${BASE_URL}/api/chats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ Chat listing works:', listResponse.data.message);
        console.log('📊 Found chats:', listResponse.data.count);

        // Step 3: Create a new chat
        console.log('\n3️⃣ Creating new chat...');
        const createResponse = await axios.post(`${BASE_URL}/api/chats`, 
            {
                name: `Debug Chat ${uniqueId}`,
                description: 'Debug test chat',
                type: 'group'
            },
            {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );
        
        console.log('✅ Chat created successfully');
        const chatId = createResponse.data.data._id;
        console.log('🆔 Chat ID:', chatId);
        console.log('👤 Creator:', createResponse.data.data.createdBy);

        // Step 4: Try to access the chat we just created
        console.log('\n4️⃣ Accessing the chat we just created...');
        
        try {
            const accessResponse = await axios.get(`${BASE_URL}/api/chats/${chatId}`, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ SUCCESS! Individual chat access works!');
            console.log('📄 Response message:', accessResponse.data.message);
            console.log('📊 Chat data received:', !!accessResponse.data.data);
            
        } catch (accessError) {
            console.log('❌ FAILED to access individual chat');
            console.log('🚨 Status:', accessError.response?.status);
            console.log('💬 Error message:', accessError.response?.data?.message);
            console.log('📄 Full error response:', JSON.stringify(accessError.response?.data, null, 2));
            
            // Additional debugging
            console.log('\n🔍 Debugging info:');
            console.log('- Chat ID used:', chatId);
            console.log('- User ID:', registerResponse.data.user.id);
            console.log('- Auth token present:', !!authToken);
            console.log('- Route should be: GET /api/chats/' + chatId);
            
            // Try a different approach - maybe the issue is with the specific chat
            console.log('\n🔄 Trying to access an older chat...');
            if (listResponse.data.count > 0 && listResponse.data.data.length > 0) {
                const oldChatId = listResponse.data.data[0]._id;
                try {
                    const oldChatResponse = await axios.get(`${BASE_URL}/api/chats/${oldChatId}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    console.log('✅ Old chat access works:', oldChatResponse.data.message);
                } catch (oldChatError) {
                    console.log('❌ Old chat access also fails:', oldChatError.response?.data?.message);
                }
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

detailedDebugTest();