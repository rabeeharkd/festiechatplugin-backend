const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://amjedvnml_db_user:festiechatplugindb@cluster0.xdyqibx.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');
    
    // Find the admin user
    const admin = await User.findOne({ email: 'amjedvnml@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log(`👤 Found admin: ${admin.name}`);
    
    // Update password
    admin.password = 'admin123456';
    await admin.save(); // This will trigger the pre-save hook to hash the password
    
    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email: amjedvnml@gmail.com');
    console.log('🔑 New Password: admin123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

resetAdminPassword();