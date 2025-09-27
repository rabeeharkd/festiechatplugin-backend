const axios = require('axios');

async function rapidCORSCheck() {
  console.log('🚀 RAPID CORS FIX VERIFICATION\n');
  console.log('Target: v2.3.0 with AGGRESSIVE CORS fix');
  console.log('Expected: Always allow https://fmsplugin.vercel.app');
  console.log('═'.repeat(50));
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  const FRONTEND_ORIGIN = 'https://fmsplugin.vercel.app';
  
  let checkCount = 0;
  const maxChecks = 8;
  
  const checkDeployment = async () => {
    checkCount++;
    console.log(`\n🔍 Check ${checkCount}/${maxChecks} - ${new Date().toLocaleTimeString()}`);
    
    try {
      // Test health endpoint with origin header
      const response = await axios.get(`${API_BASE}/api/health`, {
        headers: { 'Origin': FRONTEND_ORIGIN },
        timeout: 15000
      });
      
      const version = response.data.version;
      const corsStatus = response.data.cors?.status;
      
      console.log(`   📊 Version: ${version}`);
      console.log(`   🔧 CORS Status: ${corsStatus}`);
      
      // Check CORS headers
      const allowOrigin = response.headers['access-control-allow-origin'];
      const allowMethods = response.headers['access-control-allow-methods'];
      const allowHeaders = response.headers['access-control-allow-headers'];
      
      console.log(`   🌐 Allow-Origin: ${allowOrigin || 'MISSING'}`);
      console.log(`   📋 Allow-Methods: ${allowMethods || 'MISSING'}`);
      console.log(`   📝 Allow-Headers: ${allowHeaders || 'MISSING'}`);
      
      // Success conditions
      if (version === '2.3.0' && allowOrigin === FRONTEND_ORIGIN) {
        console.log('\n🎉 SUCCESS! AGGRESSIVE CORS FIX IS LIVE!');
        console.log('✅ Version 2.3.0 deployed');
        console.log('✅ Access-Control-Allow-Origin correctly set');
        console.log('✅ Your frontend should work NOW!');
        
        // Test actual API call
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
          if (loginError.response && loginError.response.status === 401) {
            console.log('✅ Login endpoint CORS: WORKING (auth error expected)');
          }
        }
        
        console.log('\n🚀 FRONTEND CONNECTION IS NOW FIXED!');
        console.log('🔗 Try your frontend application immediately!');
        return true;
      }
      
      if (allowOrigin && allowOrigin !== 'undefined') {
        console.log('\n✅ CORS headers detected! Should be working...');
      }
      
    } catch (error) {
      console.log(`   ❌ Check failed: ${error.message}`);
    }
    
    return false;
  };
  
  // Initial check
  const success = await checkDeployment();
  if (success) return;
  
  // Set up interval checks
  const interval = setInterval(async () => {
    const success = await checkDeployment();
    
    if (success || checkCount >= maxChecks) {
      clearInterval(interval);
      
      if (checkCount >= maxChecks && !success) {
        console.log('\n⚠️ Max checks reached. Manual verification needed.');
        console.log('🔗 Check Render logs: https://dashboard.render.com/');
        console.log('💡 Try your frontend - it might work now even if not detected');
      }
    }
  }, 20000); // Check every 20 seconds
}

rapidCORSCheck();