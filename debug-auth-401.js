// DEBUG: Test authentication flow for amjedvnml@gmail.com
// This will help identify the JWT token authentication issue

const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com/api';

async function debugAuth() {
    console.log('🔍 DEBUGGING AUTHENTICATION FOR amjedvnml@gmail.com');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
        // Step 1: Test backend availability
        console.log('\n1️⃣ Testing backend availability...');
        try {
            const healthCheck = await axios.get('https://festiechatplugin-backend-8g96.onrender.com/health');
            console.log('✅ Backend health:', healthCheck.data);
        } catch (healthError) {
            console.log('⚠️ Health endpoint failed:', healthError.message);
            console.log('   Trying direct API test...');
        }

        // Step 2: Test login
        console.log('\n2️⃣ Testing login for amjedvnml@gmail.com...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'amjedvnml@gmail.com',
            password: 'admin123456'
        });

        if (loginResponse.data.success) {
            const { accessToken, user } = loginResponse.data;
            console.log('✅ Login successful!');
            console.log('   User:', user.name, '(', user.email, ') - Role:', user.role);
            console.log('   Token (first 50 chars):', accessToken.substring(0, 50) + '...');

            // Step 3: Test protected endpoint with token
            console.log('\n3️⃣ Testing GET /api/chats with token...');
            const chatsResponse = await axios.get(`${BASE_URL}/chats`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (chatsResponse.data.success) {
                console.log('✅ Chats fetch successful!');
                console.log('   Found', chatsResponse.data.count, 'chats');
                chatsResponse.data.data.forEach(chat => {
                    console.log('   -', chat.name);
                });
            }

            // Step 4: Test token validation
            console.log('\n4️⃣ Testing token format...');
            const tokenParts = accessToken.split('.');
            console.log('   Token parts:', tokenParts.length, '(should be 3 for JWT)');
            
            if (tokenParts.length === 3) {
                try {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('   Token payload:', payload);
                    
                    // Check expiration
                    const now = Math.floor(Date.now() / 1000);
                    if (payload.exp && payload.exp < now) {
                        console.log('   ❌ Token is EXPIRED!');
                    } else {
                        console.log('   ✅ Token is valid until:', new Date(payload.exp * 1000));
                    }
                } catch (parseError) {
                    console.log('   ❌ Failed to parse token payload:', parseError.message);
                }
            }

            // Step 5: Provide frontend debugging info
            console.log('\n📋 FRONTEND DEBUGGING INFO:');
            console.log('════════════════════════════');
            console.log('✅ Backend is working');
            console.log('✅ Admin login credentials correct: amjedvnml@gmail.com / admin123456');
            console.log('✅ JWT token is being generated');
            console.log('✅ Protected endpoint /api/chats works with proper token');
            console.log('');
            console.log('🔧 FRONTEND FIXES NEEDED:');
            console.log('1. Check if token is being stored correctly in localStorage');
            console.log('2. Verify Authorization header format: "Bearer " + token');
            console.log('3. Ensure token is not expired or corrupted');
            console.log('4. Check CORS settings for your frontend domain');
            console.log('');
            console.log('💡 FRONTEND TOKEN DEBUG:');
            console.log('   localStorage.getItem("accessToken") should return:');
            console.log('   ', accessToken.substring(0, 100) + '...');

        } else {
            console.log('❌ Login failed:', loginResponse.data);
        }

    } catch (error) {
        console.log('\n❌ ERROR OCCURRED:');
        
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Message:', error.response.data?.message || 'No message');
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.status === 401) {
                console.log('\n🔍 401 UNAUTHORIZED ANALYSIS:');
                console.log('   This means the token is invalid, expired, or malformed');
                console.log('   Check frontend token handling!');
            }
        } else if (error.request) {
            console.log('   Network Error - Backend may be down');
            console.log('   ', error.message);
        } else {
            console.log('   Unexpected Error:', error.message);
        }
    }
}

// Run the debug
debugAuth();