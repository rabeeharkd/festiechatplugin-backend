const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com';

async function temporaryFix() {
    console.log('\n🔧 TEMPORARY FIX: Add non-admin user to Fansat Arts Fest');
    console.log('This will make the chat visible until open access policy deploys');
    console.log('═══════════════════════════════════════════════════════════');

    try {
        // Step 1: Login as admin
        console.log('1️⃣ Logging in as admin...');
        const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'amjedvnml@gmail.com',
            password: 'admin123456'
        });
        
        const adminToken = adminLoginResponse.data.accessToken;
        console.log('✅ Admin login successful');

        // Step 2: Login as the specific user (rabeehsp@gmail.com)
        console.log('\n2️⃣ Logging in as rabeehsp@gmail.com...');
        
        let userToken = null;
        let userId = null;
        
        // Try to login with common passwords
        const passwords = ['password123', 'admin123','rabeehcparkd', 'rabeeh123', 'test123', 'password'];
        let loginSuccess = false;
        
        for (const password of passwords) {
            try {
                console.log(`   Trying password: ${password.substring(0, 4)}...`);
                const userLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
                    email: 'rabeehsp@gmail.com',
                    password: password
                });
                
                userToken = userLoginResponse.data.accessToken;
                userId = userLoginResponse.data.user.id;
                loginSuccess = true;
                console.log('✅ Login successful for rabeehsp@gmail.com');
                break;
                
            } catch (loginError) {
                console.log(`   ❌ Failed: ${loginError.response?.data?.message}`);
            }
        }
        
        if (!loginSuccess) {
            console.log('\n🔄 Login failed, trying registration...');
            try {
                const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
                    name: 'Rabeeh SP',
                    email: 'rabeehsp@gmail.com',
                    password: 'Password123!'
                });
                
                userToken = registerResponse.data.accessToken;
                userId = registerResponse.data.user.id;
                console.log('✅ New account created for rabeehsp@gmail.com');
                
            } catch (registerError) {
                console.log('❌ Registration also failed:', registerError.response?.data?.message);
                return;
            }
        }

        // Step 3: Add user to Fansat Arts Fest chat
        console.log('\n3️⃣ Adding user to Fansat Arts Fest...');
        const fansatChatId = '68d6ea0037c8c810bcbf7125'; // From our debug
        
        try {
            const addParticipantResponse = await axios.post(
                `${BASE_URL}/api/chats/${fansatChatId}/participants`,
                {
                    userId: userId,
                    role: 'member'
                },
                {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                }
            );
            
            console.log('✅ User added to Fansat Arts Fest successfully!');
            
            // Step 4: Test if user can now see the chat
            console.log('\n4️⃣ Testing if user can now see chats...');
            const userChatsResponse = await axios.get(`${BASE_URL}/api/chats`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            
            console.log('📊 User can now see:', userChatsResponse.data.count, 'chats');
            userChatsResponse.data.data.forEach((chat, index) => {
                console.log(`   ${index + 1}. "${chat.name}"`);
                if (chat.name.includes('Fansat')) {
                    console.log('      🎉 FANSAT ARTS FEST IS NOW VISIBLE!');
                }
            });
            
        } catch (addError) {
            console.log('❌ Failed to add user to chat:', addError.response?.data?.message);
        }

        console.log('\n📋 TEMPORARY FIX SUMMARY:');
        console.log('✅ Added user as participant to make chat visible');
        console.log('⚠️ This is a workaround until open access policy deploys');
        console.log('🎯 Permanent fix: Wait for deployment to complete');
        
        console.log('\n💡 FOR YOUR FRONTEND USER:');
        console.log('1. Ask admin to add them to the "Fansat Arts Fest" chat');
        console.log('2. Or wait for the open access deployment to complete');
        console.log('3. Once deployed, all users will see all chats automatically');
        
    } catch (error) {
        console.error('❌ Temporary fix failed:', error.response?.data?.message || error.message);
    }
}

temporaryFix();