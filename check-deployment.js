const axios = require('axios');

async function checkDeploymentStatus() {
  console.log('🚀 Checking Render deployment status...\n');
  
  const backendURL = 'https://festiechatplugin-backend-8g96.onrender.com';
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      console.log(`Attempt ${attempts + 1}/${maxAttempts} - Checking deployment...`);
      
      // Test CORS with the new frontend origin
      const response = await axios.post(`${backendURL}/api/auth/login`, {
        email: 'amjedvnml@gmail.com',
        password: 'admin123456'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://fmsplugin.vercel.app'
        },
        timeout: 10000
      });
      
      if (response.status === 200) {
        console.log('✅ Deployment successful!');
        console.log('🎉 CORS is now configured for https://fmsplugin.vercel.app');
        console.log('✅ Login working with new configuration');
        console.log(`👤 User: ${response.data.user?.name}`);
        console.log(`🔑 Token: ${response.data.accessToken ? 'Generated successfully' : 'Missing'}`);
        break;
      }
      
    } catch (error) {
      console.log(`❌ Deployment not ready yet...`);
      console.log(`   Error: ${error.message}`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
      }
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      console.log('   Waiting 30 seconds before next check...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  if (attempts === maxAttempts) {
    console.log('\n⚠️ Maximum attempts reached. Please check Render dashboard for deployment status.');
    console.log('🔗 Render Dashboard: https://dashboard.render.com/');
  }
}

checkDeploymentStatus();