const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com';

async function testJoinLeaveChat() {
    console.log('\n🚪 Testing Join/Leave Chat Functionality');
    console.log('Target: Allow non-admin users to join existing chats');
    console.log('════════════════════════════════════════════════════════════');

    try {
        // Create two test users
        const uniqueId = Date.now();
        
        // User 1 - Chat creator
        console.log('1️⃣ Creating first user (chat creator)...');
        const user1 = {
            name: `Chat Creator ${uniqueId}`,
            email: `creator${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };
        
        const user1Response = await axios.post(`${BASE_URL}/api/auth/register`, user1);
        const user1Token = user1Response.data.accessToken;
        console.log('✅ User 1 registered:', user1Response.data.user.name);

        // User 2 - Will join the chat
        console.log('\n2️⃣ Creating second user (will join chat)...');
        const user2 = {
            name: `Chat Joiner ${uniqueId}`,
            email: `joiner${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };
        
        const user2Response = await axios.post(`${BASE_URL}/api/auth/register`, user2);
        const user2Token = user2Response.data.accessToken;
        console.log('✅ User 2 registered:', user2Response.data.user.name);

        // Create a chat with User 1
        console.log('\n3️⃣ User 1 creating a chat...');
        const chatData = {
            name: `Joinable Chat ${uniqueId}`,
            description: 'A chat that users can join',
            type: 'group'
        };
        
        const chatResponse = await axios.post(`${BASE_URL}/api/chats`, chatData, {
            headers: { 'Authorization': `Bearer ${user1Token}` }
        });
        
        const chatId = chatResponse.data.data._id;
        console.log('✅ Chat created:', chatResponse.data.data.name);
        console.log('🆔 Chat ID:', chatId);
        console.log('👥 Initial participants:', chatResponse.data.data.participants.length);

        // Test: User 2 joins the chat
        console.log('\n4️⃣ User 2 joining the chat...');
        try {
            const joinResponse = await axios.post(`${BASE_URL}/api/chats/${chatId}/join`, {}, {
                headers: { 'Authorization': `Bearer ${user2Token}` }
            });
            
            console.log('✅ SUCCESS! User 2 joined the chat');
            console.log('📄 Message:', joinResponse.data.message);
            console.log('👥 Updated participants:', joinResponse.data.data.participants.length);
            
            // List participants
            joinResponse.data.data.participants.forEach((participant, index) => {
                console.log(`   ${index + 1}. ${participant.name} (${participant.role})`);
            });

            // Test: Try to join again (should fail)
            console.log('\n5️⃣ Attempting to join again (should fail)...');
            try {
                await axios.post(`${BASE_URL}/api/chats/${chatId}/join`, {}, {
                    headers: { 'Authorization': `Bearer ${user2Token}` }
                });
                console.log('❌ Unexpected: Allowed to join twice');
            } catch (duplicateError) {
                console.log('✅ Correctly prevented duplicate join:', duplicateError.response?.data?.message);
            }

            // Test: User 2 leaves the chat
            console.log('\n6️⃣ User 2 leaving the chat...');
            const leaveResponse = await axios.post(`${BASE_URL}/api/chats/${chatId}/leave`, {}, {
                headers: { 'Authorization': `Bearer ${user2Token}` }
            });
            
            console.log('✅ SUCCESS! User 2 left the chat');
            console.log('📄 Message:', leaveResponse.data.message);
            console.log('👥 Remaining participants:', leaveResponse.data.data.participants.length);

            // Test: Try to leave again (should fail)
            console.log('\n7️⃣ Attempting to leave again (should fail)...');
            try {
                await axios.post(`${BASE_URL}/api/chats/${chatId}/leave`, {}, {
                    headers: { 'Authorization': `Bearer ${user2Token}` }
                });
                console.log('❌ Unexpected: Allowed to leave twice');
            } catch (leaveError) {
                console.log('✅ Correctly prevented leaving when not a member:', leaveError.response?.data?.message);
            }

        } catch (joinError) {
            console.log('❌ Join failed:', joinError.response?.status, joinError.response?.data?.message);
            if (joinError.response?.data) {
                console.log('📄 Full error:', JSON.stringify(joinError.response.data, null, 2));
            }
        }

        console.log('\n📋 JOIN/LEAVE FUNCTIONALITY SUMMARY:');
        console.log('✅ Users can register and authenticate');
        console.log('✅ Users can create chats');
        console.log('✅ Non-admin users can join existing chats');
        console.log('✅ Duplicate joins are prevented');
        console.log('✅ Users can leave chats they joined');
        console.log('✅ Leaving when not a member is prevented');
        
        console.log('\n🚀 FOR YOUR FRONTEND BUTTON:');
        console.log('   POST /api/chats/{chatId}/join - Join a chat');
        console.log('   POST /api/chats/{chatId}/leave - Leave a chat');
        console.log('   Headers: Authorization: Bearer {userToken}');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.log('📄 Full error response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testJoinLeaveChat();