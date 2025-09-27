const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com';

async function debugFansatArtsSearch() {
    console.log('\n🔍 DEBUG: Fansat Arts Fest Search Issue');
    console.log('Problem: Chat exists in DB but not found in non-admin search');
    console.log('═══════════════════════════════════════════════════════════');

    try {
        // Step 1: Login as admin to see all chats
        console.log('1️⃣ Logging in as admin...');
        const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'amjedvnml@gmail.com',
            password: 'admin123456'
        });
        
        const adminToken = adminLoginResponse.data.accessToken;
        console.log('✅ Admin login successful');

        // Step 2: Get all chats as admin
        console.log('\n2️⃣ Fetching all chats as admin...');
        const adminChatsResponse = await axios.get(`${BASE_URL}/api/chats`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        console.log('📊 Total chats found:', adminChatsResponse.data.count);
        console.log('📋 Available chats:');
        
        let fansatChat = null;
        adminChatsResponse.data.data.forEach((chat, index) => {
            console.log(`   ${index + 1}. "${chat.name}" (ID: ${chat._id})`);
            console.log(`      - Type: ${chat.type}`);
            console.log(`      - Active: ${chat.isActive}`);
            console.log(`      - Participants: ${chat.participants ? chat.participants.length : 0}`);
            
            if (chat.name.toLowerCase().includes('fansat')) {
                fansatChat = chat;
                console.log(`      🎯 FOUND FANSAT CHAT!`);
            }
        });

        // Step 3: Create a non-admin user
        console.log('\n3️⃣ Creating non-admin user...');
        const uniqueId = Date.now();
        const nonAdminUser = {
            name: `Regular User ${uniqueId}`,
            email: `regular${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };
        
        const userResponse = await axios.post(`${BASE_URL}/api/auth/register`, nonAdminUser);
        const userToken = userResponse.data.accessToken;
        console.log('✅ Non-admin user created');
        console.log('👤 User role:', userResponse.data.user.role);

        // Step 4: Get chats as non-admin user
        console.log('\n4️⃣ Fetching chats as non-admin user...');
        const userChatsResponse = await axios.get(`${BASE_URL}/api/chats`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        console.log('📊 Chats visible to non-admin:', userChatsResponse.data.count);
        console.log('📋 Non-admin can see:');
        
        let fansatVisibleToUser = false;
        userChatsResponse.data.data.forEach((chat, index) => {
            console.log(`   ${index + 1}. "${chat.name}"`);
            if (chat.name.toLowerCase().includes('fansat')) {
                fansatVisibleToUser = true;
                console.log(`      🎯 FANSAT VISIBLE TO NON-ADMIN!`);
            }
        });

        // Step 5: Analysis
        console.log('\n📋 ANALYSIS:');
        console.log('═══════════════════════════════════════════════════════════');
        
        if (fansatChat) {
            console.log('✅ "Fansat Arts Fest" EXISTS in database');
            console.log(`   - Chat ID: ${fansatChat._id}`);
            console.log(`   - Is Active: ${fansatChat.isActive}`);
            console.log(`   - Type: ${fansatChat.type}`);
            console.log(`   - Created by: ${fansatChat.createdBy?.name || 'Unknown'}`);
            
            if (fansatVisibleToUser) {
                console.log('✅ Chat IS visible to non-admin users');
                console.log('🎯 ISSUE: Frontend search functionality problem');
                console.log('💡 SOLUTION: Check frontend search implementation');
            } else {
                console.log('❌ Chat NOT visible to non-admin users');
                console.log('🎯 ISSUE: Backend access control problem');
                console.log('💡 SOLUTION: Need to fix chat access permissions');
            }
        } else {
            console.log('❌ "Fansat Arts Fest" NOT found in admin chat list');
            console.log('🎯 ISSUE: Chat may not exist or has different name');
        }

        // Step 6: Test direct access to Fansat chat
        if (fansatChat) {
            console.log('\n5️⃣ Testing direct access to Fansat chat...');
            try {
                const directAccessResponse = await axios.get(`${BASE_URL}/api/chats/${fansatChat._id}`, {
                    headers: { 'Authorization': `Bearer ${userToken}` }
                });
                console.log('✅ Non-admin CAN access Fansat chat directly');
                console.log('💡 This confirms the search functionality is the problem');
            } catch (accessError) {
                console.log('❌ Non-admin CANNOT access Fansat chat directly');
                console.log('🎯 Access control issue:', accessError.response?.data?.message);
            }
        }

        console.log('\n🔧 RECOMMENDED FIXES:');
        if (fansatVisibleToUser) {
            console.log('1. Check frontend search implementation');
            console.log('2. Verify search API endpoint is working');
            console.log('3. Check case sensitivity in search');
            console.log('4. Verify search query encoding');
        } else {
            console.log('1. Fix backend access control for non-admin users');
            console.log('2. Ensure all chats are visible to all logged-in users');
            console.log('3. Check participant filtering logic');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.log('📄 Full error response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugFansatArtsSearch();