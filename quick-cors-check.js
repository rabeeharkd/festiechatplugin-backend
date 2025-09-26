const axios = require('axios');

async function quickCORSCheck() {
  console.log('🔍 Quick CORS Status Check\n');
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    // Test 1: Basic health check
    console.log('1️⃣ Basic health check...');
    const health = await axios.get(`${API_BASE}/api/health`);
    console.log(`✅ Backend is UP - Version: ${health.data.version || 'Unknown'}`);
    console.log(`   Message: ${health.data.message}`);
    
    // Test 2: CORS preflight simulation
    console.log('\n2️⃣ Testing CORS with frontend origin...');
    try {
      const corsTest = await axios({
        method: 'OPTIONS',
        url: `${API_BASE}/api/health`,
        headers: {
          'Origin': 'https://fmsplugin.vercel.app',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('✅ OPTIONS request successful');
      console.log('   Access-Control-Allow-Origin:', corsTest.headers['access-control-allow-origin']);
      console.log('   Access-Control-Allow-Methods:', corsTest.headers['access-control-allow-methods']);
      
    } catch (optionsError) {
      console.log('❌ OPTIONS request failed:', optionsError.message);
    }
    
    // Test 3: Actual GET with Origin header
    console.log('\n3️⃣ Testing actual GET request with origin...');
    try {
      const getTest = await axios.get(`${API_BASE}/api/health`, {
        headers: {
          'Origin': 'https://fmsplugin.vercel.app'
        }
      });
      
      console.log('✅ GET request with Origin successful');
      console.log('   Status:', getTest.status);
      console.log('   CORS headers present:', !!getTest.headers['access-control-allow-origin']);
      
    } catch (getError) {
      console.log('❌ GET request with Origin failed:', getError.message);
    }
    
  } catch (error) {
    console.log('❌ Backend is DOWN:', error.message);
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('If the backend is UP but CORS is failing:');
  console.log('  • Deployment may still be in progress');
  console.log('  • Try your frontend again in 2-3 minutes');
  console.log('  • The CORS fix should be active shortly');
}

quickCORSCheck();