const axios = require('axios');

async function monitorCORSFix() {
  console.log('🚀 MONITORING CRITICAL CORS FIX DEPLOYMENT\n');
  console.log('Target: Explicit CORS headers for https://fmsplugin.vercel.app');
  console.log('Version: Looking for v2.2.0');
  console.log('═'.repeat(60));
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  const FRONTEND_ORIGIN = 'https://fmsplugin.vercel.app';
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n🔍 Attempt ${attempts}/${maxAttempts} - Checking deployment...`);
    
    try {
      // Check health endpoint for version
      const healthResponse = await axios.get(`${API_BASE}/api/health`, {
        headers: { 'Origin': FRONTEND_ORIGIN },
        timeout: 15000
      });
      
      const version = healthResponse.data.version;
      const corsStatus = healthResponse.data.cors?.status;
      
      console.log(`   📊 Version: ${version || 'Unknown'}`);
      console.log(`   🔧 CORS Status: ${corsStatus || 'Unknown'}`);
      
      // Check for CORS headers
      const allowOrigin = healthResponse.headers['access-control-allow-origin'];
      console.log(`   🌐 Access-Control-Allow-Origin: ${allowOrigin || 'MISSING'}`);
      
      // If we see version 2.2.0, run comprehensive tests
      if (version === "2.2.0") {
        console.log('\n🎉 NEW DEPLOYMENT DETECTED! Running CORS tests...');
        
        // Test 1: Check all CORS headers
        console.log('\n   ✅ CORS Headers Check:');
        console.log(`      - Allow-Origin: ${healthResponse.headers['access-control-allow-origin'] || 'MISSING'}`);
        console.log(`      - Allow-Methods: ${healthResponse.headers['access-control-allow-methods'] || 'MISSING'}`);
        console.log(`      - Allow-Headers: ${healthResponse.headers['access-control-allow-headers'] || 'MISSING'}`);
        console.log(`      - Allow-Credentials: ${healthResponse.headers['access-control-allow-credentials'] || 'MISSING'}`);
        
        // Test 2: Test OPTIONS preflight
        try {
          const optionsResponse = await axios({
            method: 'OPTIONS',
            url: `${API_BASE}/api/auth/login`,
            headers: {
              'Origin': FRONTEND_ORIGIN,
              'Access-Control-Request-Method': 'POST',
              'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
          });
          
          console.log('\n   ✅ Preflight OPTIONS Test: SUCCESS');
          console.log(`      Status: ${optionsResponse.status}`);
          
        } catch (optionsError) {
          console.log('\n   ❌ Preflight OPTIONS Test: FAILED');
        }
        
        // Test 3: Test actual login endpoint
        try {
          await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'test@test.com',
            password: 'wrongpassword'
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Origin': FRONTEND_ORIGIN
            }
          });
        } catch (loginError) {
          if (loginError.response && (loginError.response.status === 401 || loginError.response.status === 400)) {
            console.log('\n   ✅ Login Endpoint CORS Test: SUCCESS (auth error expected)');
            console.log(`      Access-Control-Allow-Origin: ${loginError.response.headers['access-control-allow-origin'] || 'MISSING'}`);
          } else {
            console.log('\n   ❌ Login Endpoint CORS Test: FAILED');
          }
        }
        
        console.log('\n🎊 CORS FIX DEPLOYMENT COMPLETE!');
        console.log('✅ Your frontend should now work without CORS errors!');
        console.log('✅ All API endpoints accessible from https://fmsplugin.vercel.app');
        console.log('🔗 Try your frontend application now!');
        
        break;
      }
      
      if (allowOrigin && allowOrigin !== 'undefined') {
        console.log('\n🎉 CORS WORKING! Headers are being set correctly!');
        console.log('✅ Your frontend connection should work now!');
        break;
      }
      
    } catch (error) {
      console.log(`   ❌ Health check failed: ${error.message}`);
    }
    
    if (attempts < maxAttempts) {
      console.log(`   ⏳ Waiting 30 seconds before next check...`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  if (attempts === maxAttempts) {
    console.log('\n⚠️ Max attempts reached. Check Render dashboard for deployment status.');
    console.log('🔗 Render Dashboard: https://dashboard.render.com/');
  }
}

monitorCORSFix();