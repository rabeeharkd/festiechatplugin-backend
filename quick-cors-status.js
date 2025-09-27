const axios = require('axios');

async function quickCORSStatusCheck() {
  console.log('🔍 IMMEDIATE CORS STATUS CHECK\n');
  
  const API_BASE = 'https://festiechatplugin-backend-8g96.onrender.com';
  
  try {
    // Check current deployment version
    const response = await axios.get(`${API_BASE}/api/health`, {
      timeout: 10000
    });
    
    console.log('Current Status:');
    console.log('- Version:', response.data.version || 'Unknown');
    console.log('- Message:', response.data.message);
    console.log('- CORS Status:', response.data.cors?.status || 'Unknown');
    
    // Check CORS headers
    console.log('\nCORS Headers:');
    console.log('- Access-Control-Allow-Origin:', response.headers['access-control-allow-origin'] || 'MISSING ❌');
    console.log('- Access-Control-Allow-Methods:', response.headers['access-control-allow-methods'] || 'MISSING ❌');
    console.log('- Access-Control-Allow-Headers:', response.headers['access-control-allow-headers'] || 'MISSING ❌');
    
    if (response.data.version === '2.2.0') {
      console.log('\n✅ Latest deployment is live!');
    } else {
      console.log('\n⏳ Still waiting for v2.2.0 deployment...');
    }
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

quickCORSStatusCheck();