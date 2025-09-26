const axios = require('axios');

async function diagnoseCORSProblem() {
  console.log('🔍 COMPREHENSIVE CORS DIAGNOSIS\n');
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  const FRONTEND_ORIGIN = 'https://fmsplugin.vercel.app';
  
  console.log('Backend URL:', API_BASE);
  console.log('Frontend Origin:', FRONTEND_ORIGIN);
  console.log('═'.repeat(60));
  
  try {
    // Test 1: Check if backend is responding at all
    console.log('\n1️⃣ Backend Availability Test...');
    const basicResponse = await axios.get(API_BASE, { timeout: 10000 });
    console.log('✅ Backend is UP:', basicResponse.data);
    
    // Test 2: Check current CORS headers
    console.log('\n2️⃣ CORS Headers Analysis...');
    const headersTest = await axios.get(`${API_BASE}/api/health`, {
      timeout: 10000,
      validateStatus: () => true // Accept any status
    });
    
    console.log('Response Status:', headersTest.status);
    console.log('CORS Headers:');
    console.log('  - Access-Control-Allow-Origin:', headersTest.headers['access-control-allow-origin'] || '❌ MISSING');
    console.log('  - Access-Control-Allow-Methods:', headersTest.headers['access-control-allow-methods'] || '❌ MISSING');
    console.log('  - Access-Control-Allow-Headers:', headersTest.headers['access-control-allow-headers'] || '❌ MISSING');
    console.log('  - Access-Control-Allow-Credentials:', headersTest.headers['access-control-allow-credentials'] || '❌ MISSING');
    
    // Test 3: Simulate browser preflight request
    console.log('\n3️⃣ Preflight OPTIONS Request Test...');
    try {
      const preflightResponse = await axios({
        method: 'OPTIONS',
        url: `${API_BASE}/api/health`,
        headers: {
          'Origin': FRONTEND_ORIGIN,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        },
        timeout: 10000
      });
      
      console.log('✅ Preflight Status:', preflightResponse.status);
      console.log('Preflight CORS Headers:');
      console.log('  - Allow-Origin:', preflightResponse.headers['access-control-allow-origin'] || '❌ MISSING');
      console.log('  - Allow-Methods:', preflightResponse.headers['access-control-allow-methods'] || '❌ MISSING');
      console.log('  - Allow-Headers:', preflightResponse.headers['access-control-allow-headers'] || '❌ MISSING');
      
    } catch (preflightError) {
      console.log('❌ Preflight FAILED:', preflightError.message);
    }
    
    // Test 4: Simulate actual frontend request
    console.log('\n4️⃣ Frontend Request Simulation...');
    try {
      const frontendTest = await axios.get(`${API_BASE}/api/health`, {
        headers: {
          'Origin': FRONTEND_ORIGIN,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Frontend simulation SUCCESS');
      console.log('Response CORS header:', frontendTest.headers['access-control-allow-origin']);
      
    } catch (frontendError) {
      console.log('❌ Frontend simulation FAILED:', frontendError.message);
    }
    
    // Test 5: Check deployment version
    console.log('\n5️⃣ Deployment Version Check...');
    try {
      const versionCheck = await axios.get(`${API_BASE}/api/health`);
      console.log('Current Version:', versionCheck.data.version || 'Unknown');
      console.log('CORS Status:', versionCheck.data.cors?.status || 'Not reported');
      console.log('Features:', versionCheck.data.features || 'Not listed');
    } catch (versionError) {
      console.log('❌ Version check failed:', versionError.message);
    }
    
  } catch (error) {
    console.log('❌ CRITICAL: Backend is completely DOWN');
    console.log('Error:', error.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 DIAGNOSIS COMPLETE');
}

diagnoseCORSProblem();