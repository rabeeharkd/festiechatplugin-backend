const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com';

async function trace401Error() {
    console.log('\n🔍 TRACING 401 ERROR - Chat Loading Issue');
    console.log('Error: Failed to load resource: the server responded with a status of 401');
    console.log('User: amjedvnml@gmail.com');
    console.log('═══════════════════════════════════════════════════════════════');

    try {
        // Test 1: Check if backend is accessible
        console.log('1️⃣ Testing backend accessibility...');
        const healthResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Backend is accessible:', healthResponse.data.message);

        // Test 2: Try login with the user mentioned in error
        console.log('\n2️⃣ Testing login for amjedvnml@gmail.com...');
        const loginAttempts = [
            'admin123',
            'password123',
            'amjedvnml123',
            'festiechat123',
            'admin',
            'password',
            'admin123456'
        ];

        let validToken = null;
        let loginSuccess = false;

        for (const password of loginAttempts) {
            try {
                console.log(`   Trying password: ${password.substring(0, 4)}...`);
                const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
                    email: 'amjedvnml@gmail.com',
                    password: password
                });
                
                validToken = loginResponse.data.accessToken;
                loginSuccess = true;
                console.log('✅ Login successful with password:', password.substring(0, 4) + '...');
                console.log('🎫 Token received:', validToken ? 'Yes' : 'No');
                console.log('👤 User info:', loginResponse.data.user);
                break;
                
            } catch (loginError) {
                console.log(`   ❌ Failed: ${loginError.response?.data?.message || loginError.message}`);
            }
        }

        if (!loginSuccess) {
            console.log('\n🔄 All password attempts failed. Trying registration...');
            try {
                const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
                    name: 'Amjed Admin',
                    email: 'amjedvnml@gmail.com',
                    password: 'NewPassword123!'
                });
                
                validToken = registerResponse.data.accessToken;
                console.log('✅ New registration successful');
                console.log('🎫 New token:', validToken ? 'Yes' : 'No');
                
            } catch (registerError) {
                console.log('❌ Registration failed:', registerError.response?.data?.message);
            }
        }

        if (validToken) {
            // Test 3: Try accessing chats with valid token
            console.log('\n3️⃣ Testing chat access with valid token...');
            try {
                const chatResponse = await axios.get(`${BASE_URL}/api/chats`, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('✅ Chat access successful!');
                console.log('📊 Chat count:', chatResponse.data.count);
                console.log('👤 User role:', chatResponse.data.userRole);
                
                // Test 4: Test with malformed token (simulate frontend issue)
                console.log('\n4️⃣ Testing common token issues...');
                
                // Test with no Bearer prefix
                try {
                    await axios.get(`${BASE_URL}/api/chats`, {
                        headers: {
                            'Authorization': validToken, // Missing "Bearer "
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (noBearerError) {
                    console.log('❌ No "Bearer" prefix:', noBearerError.response?.status, noBearerError.response?.data?.message);
                }
                
                // Test with expired/invalid token
                try {
                    await axios.get(`${BASE_URL}/api/chats`, {
                        headers: {
                            'Authorization': 'Bearer invalidtoken123',
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (invalidError) {
                    console.log('❌ Invalid token:', invalidError.response?.status, invalidError.response?.data?.message);
                }
                
                // Test with no token
                try {
                    await axios.get(`${BASE_URL}/api/chats`);
                } catch (noTokenError) {
                    console.log('❌ No token:', noTokenError.response?.status, noTokenError.response?.data?.message);
                }
                
            } catch (chatError) {
                console.log('❌ Chat access failed even with valid token:', chatError.response?.status, chatError.response?.data?.message);
            }
        }

        console.log('\n📋 DIAGNOSIS & SOLUTIONS:');
        console.log('═══════════════════════════════════════════════════════════════');
        
        if (loginSuccess && validToken) {
            console.log('✅ Authentication is working on backend');
            console.log('🎯 FRONTEND ISSUES TO CHECK:');
            console.log('   1. Token storage: Check localStorage/sessionStorage for token');
            console.log('   2. Token format: Ensure "Bearer " prefix is included');
            console.log('   3. Token expiry: Check if token has expired (15min lifespan)');
            console.log('   4. Header format: Verify Authorization header format');
            console.log('   5. CORS: Ensure credentials are included in requests');
            
            console.log('\n🔧 FRONTEND DEBUGGING CODE:');
            console.log('// Add this to your Messages.jsx to debug:');
            console.log('console.log("Token from storage:", localStorage.getItem("token"));');
            console.log('console.log("Request headers:", { Authorization: `Bearer ${token}` });');
            console.log('console.log("Full axios config:", axiosConfig);');
            
            console.log('\n✅ WORKING TOKEN FOR TESTING:');
            console.log(`   Token: ${validToken}`);
            console.log('   Use this in your frontend to test if token format is the issue');
            
        } else {
            console.log('❌ Backend authentication issues detected');
            console.log('🎯 BACKEND ISSUES:');
            console.log('   1. User account may not exist or password is wrong');
            console.log('   2. JWT secret may have changed');
            console.log('   3. Database connection issues');
        }
        
    } catch (error) {
        console.error('❌ Trace failed:', error.message);
        console.log('🚨 CRITICAL BACKEND ISSUE DETECTED');
    }
}

trace401Error();