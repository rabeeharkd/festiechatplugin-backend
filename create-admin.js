const axios = require('axios');

async function createAdminUser() {
  console.log('👤 Creating admin user for testing...\n');
  
  const baseURL = 'http://localhost:5000';
  
  try {
    // Register admin user
    const adminData = {
      name: 'Admin User',
      email: 'amjedvnml@gmail.com',
      password: 'admin123456'
    };

    const response = await axios.post(`${baseURL}/api/auth/register`, adminData);
    
    if (response.data.success) {
      console.log('✅ Admin user created successfully!');
      console.log('👤 Email: amjedvnml@gmail.com');
      console.log('🔑 Password: admin123456');
      console.log('🏆 Role:', response.data.user.role);
      console.log('⚡ Admin Status:', response.data.user.isAdmin);
      
      return response.data;
    }
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ Admin user already exists');
      
      // Try to login with admin credentials
      try {
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
          email: 'amjedvnml@gmail.com',
          password: 'admin123456'
        });
        
        console.log('✅ Admin login successful!');
        return loginResponse.data;
        
      } catch (loginError) {
        console.log('❌ Admin exists but password might be different');
        console.log('Try using the correct admin password');
      }
    } else {
      console.error('❌ Error creating admin:', error.response?.data || error.message);
    }
  }
}

createAdminUser();