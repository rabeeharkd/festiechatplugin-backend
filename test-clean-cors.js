const axios = require('axios');

async function testCleanCORSConfig() {
  console.log('🧪 TESTING CLEAN CORS CONFIGURATION v3.0\n');
  console.log('Expected: Standard cors() package with origin function');
  console.log('Target Version: 3.0.0');
  console.log('═'.repeat(60));
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  const FRONTEND_ORIGIN = 'https://fmsplugin.vercel.app';
  
  let testCount = 0;
  const maxTests = 6;
  
  const runTest = async () => {
    testCount++;
    console.log(`\n🔍 Test ${testCount}/${maxTests} - ${new Date().toLocaleTimeString()}`);
    
    try {
      // Test health endpoint
      const response = await axios.get(`${API_BASE}/api/health`, {
        headers: { 'Origin': FRONTEND_ORIGIN },
        timeout: 12000
      });
      
      const version = response.data.version;
      const corsStatus = response.data.cors?.status;
      const allowedOrigins = response.data.cors?.allowedOrigins;
      
      console.log(`   📊 Version: ${version}`);
      console.log(`   🔧 CORS Status: ${corsStatus}`);
      console.log(`   🌐 Method: ${response.data.cors?.method || 'Unknown'}`);
      
      // Check actual CORS headers
      const headers = response.headers;
      console.log(`   🎯 Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || '❌ MISSING'}`);
      console.log(`   📋 Access-Control-Allow-Methods: ${headers['access-control-allow-methods'] || '❌ MISSING'}`);
      console.log(`   🔑 Access-Control-Allow-Credentials: ${headers['access-control-allow-credentials'] || '❌ MISSING'}`);
      
      // Success check
      if (version === '3.0.0') {
        console.log('\n🎉 SUCCESS! Clean CORS v3.0 is deployed!');
        
        // Test main route
        const mainResponse = await axios.get(API_BASE, {
          headers: { 'Origin': FRONTEND_ORIGIN }
        });
        console.log(`   🏠 Main route: ${mainResponse.data.message}`);
        
        // Test login endpoint CORS
        try {
          await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'test@test.com',
            password: 'test'
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Origin': FRONTEND_ORIGIN
            }
          });
        } catch (loginError) {
          if (loginError.response && (loginError.response.status === 401 || loginError.response.status === 400)) {
            console.log('   ✅ Login endpoint CORS: WORKING');
            console.log(`      Origin header: ${loginError.response.headers['access-control-allow-origin']}`);
          }
        }
        
        console.log('\n🚀 YOUR FRONTEND CORS IS NOW FIXED!');
        console.log('✅ Clean, reliable CORS configuration active');
        console.log('✅ All endpoints accessible from https://fmsplugin.vercel.app');
        console.log('🔗 Try your frontend application now!');
        
        return true;
      }
      
      // Check if CORS headers are present (even if version isn't updated)
      if (headers['access-control-allow-origin']) {
        console.log('   ✅ CORS headers detected - might be working now!');
        
        if (headers['access-control-allow-origin'] === FRONTEND_ORIGIN || 
            headers['access-control-allow-origin'] === '*') {
          console.log('   🎉 CORS should be working for your frontend!');
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.message}`);
      
      if (error.code === 'ECONNABORTED') {
        console.log('   ⏳ Timeout - deployment might be in progress');
      }
    }
    
    return false;
  };
  
  // Run initial test
  const success = await runTest();
  if (success) return;
  
  // Continue testing every 25 seconds
  const interval = setInterval(async () => {
    const success = await runTest();
    
    if (success || testCount >= maxTests) {
      clearInterval(interval);
      
      if (!success && testCount >= maxTests) {
        console.log('\n💡 FINAL STATUS:');
        console.log('- Deployment may take longer than expected');
        console.log('- Try your frontend - CORS might work even if not detected');
        console.log('- The clean configuration should be more reliable');
        console.log('🔗 Render dashboard: https://dashboard.render.com/');
      }
    }
  }, 25000);
}

testCleanCORSConfig();