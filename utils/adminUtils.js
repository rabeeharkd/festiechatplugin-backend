import User from '../models/User.js';

// Ensure admin user exists and is properly configured
export const ensureAdminUser = async () => {
  try {
    console.log('🔍 Checking admin user configuration...');
    
    const adminEmail = 'amjedvnml@gmail.com';
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      // Update existing user to admin if not already
      let updated = false;
      
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        updated = true;
      }
      
      if (!admin.isAdmin) {
        admin.isAdmin = true;
        updated = true;
      }
      
      if (!admin.isActive) {
        admin.isActive = true;
        updated = true;
      }
      
      if (updated) {
        await admin.save();
        console.log('✅ Admin user updated successfully');
      } else {
        console.log('✅ Admin user already properly configured');
      }
    } else {
      console.log('⚠️  Admin user not found. Admin user should be created through registration.');
      console.log('📝 To create admin user, register with email: amjedvnml@gmail.com');
    }
    
    // Log current admin status
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`👑 Total admin users: ${adminCount}`);
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  }
};

// Initialize admin settings on server startup
export const initializeAdminSettings = async () => {
  try {
    console.log('🚀 Initializing admin settings...');
    
    await ensureAdminUser();
    
    // You can add more admin initialization here
    // e.g., default chat rooms, system settings, etc.
    
    console.log('✅ Admin initialization complete');
  } catch (error) {
    console.error('❌ Error initializing admin settings:', error);
  }
};

export default {
  ensureAdminUser,
  initializeAdminSettings
};