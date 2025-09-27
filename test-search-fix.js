// QUICK TEST: Verify search-by-name endpoint works after fix

const axios = require('axios');

const BASE_URL = 'https://festiechatplugin-backend-8g96.onrender.com/api';

async function testSearchEndpoint() {
    console.log('🔍 TESTING SEARCH-BY-NAME ENDPOINT');
    console.log('══════════════════════════════════');
    
    try {
        // Step 1: Login to get token
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'amjedvnml@gmail.com',
            password: 'admin123456'
        });
        
        const token = loginResponse.data.accessToken;
        console.log('✅ Login successful');
        
        // Step 2: Test search with different queries
        const searchQueries = ['f', 'Fan', 'Fansat', 'Test', 'Join'];
        
        for (const query of searchQueries) {
            console.log(`\n2️⃣ Testing search for: "${query}"`);
            
            try {
                const searchResponse = await axios.get(
                    `${BASE_URL}/chats/search-by-name?q=${encodeURIComponent(query)}&limit=10`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (searchResponse.data.success) {
                    console.log(`   ✅ Found ${searchResponse.data.count} results`);
                    searchResponse.data.data.forEach((chat, index) => {
                        console.log(`   ${index + 1}. "${chat.name}" (${chat.participantCount} members)`);
                        console.log(`      Can join: ${chat.canJoin ? 'Yes' : 'No (already participant)'}`);
                    });
                } else {
                    console.log(`   ❌ Search failed:`, searchResponse.data.message);
                }
                
            } catch (searchError) {
                if (searchError.response?.status === 500) {
                    console.log(`   ❌ 500 Error still exists:`, searchError.response.data?.message);
                    console.log(`   Details:`, searchError.response.data);
                } else {
                    console.log(`   ❌ Search error:`, searchError.message);
                }
            }
        }
        
        console.log('\n✅ SEARCH ENDPOINT TEST COMPLETE');
        console.log('If you still see 500 errors, the deployment may not be updated yet.');
        console.log('Wait 2-3 minutes for Render to deploy the fix.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response?.data) {
            console.log('Response data:', error.response.data);
        }
    }
}

testSearchEndpoint();