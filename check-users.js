const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://amjedvnml_db_user:festiechatplugindb@cluster0.xdyqibx.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking existing users...\n');
    
    // Find all users
    const users = await User.find({});
    
    console.log(`👥 Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏆 Role: ${user.role}`);
      console.log(`   ⚡ Admin: ${user.isAdmin}`);
      console.log(`   📅 Created: ${user.createdAt}\n`);
    });
    
    // Find admin users specifically
    const adminUsers = await User.find({ isAdmin: true });
    console.log(`👑 Admin users found: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      console.log('Admin credentials for testing:');
      adminUsers.forEach(admin => {
        console.log(`📧 Email: ${admin.email}`);
        console.log(`👤 Name: ${admin.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkAdminUsers();