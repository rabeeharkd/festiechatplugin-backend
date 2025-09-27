// Make rabeehsp@gmail.com an admin user

const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://amjedvnml_db_user:festiechatplugindb@cluster0.xdyqibx.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

async function makeUserAdmin() {
    console.log('👑 MAKING rabeehsp@gmail.com AN ADMIN');
    console.log('════════════════════════════════════');
    
    try {
        const email = 'rabeehsp@gmail.com';
        
        // Find the user
        const user = await User.findOne({ email: email });
        
        if (!user) {
            console.log(`❌ User ${email} not found in database`);
            console.log('\n💡 Creating new admin user...');
            
            // Create new admin user if doesn't exist
            const newAdmin = new User({
                name: 'Rabeeh SP',
                email: email,
                password: 'admin123',  // You can change this
                role: 'admin',
                isActive: true
            });
            
            await newAdmin.save();
            console.log('✅ Created new admin user:', email);
            console.log('   Default password: admin123');
            console.log('   (User can change this after login)');
            
        } else {
            console.log(`👤 Found user: ${user.name} (${user.email})`);
            console.log(`   Current role: ${user.role}`);
            
            if (user.role === 'admin') {
                console.log('✅ User is already an admin!');
            } else {
                // Update role to admin
                user.role = 'admin';
                await user.save();
                
                console.log('✅ Successfully promoted user to admin!');
                console.log(`   ${user.name} (${user.email}) is now an admin`);
            }
        }
        
        // Verify the change
        console.log('\n🔍 VERIFICATION:');
        const updatedUser = await User.findOne({ email: email });
        if (updatedUser) {
            console.log('✅ Final status:');
            console.log(`   Name: ${updatedUser.name}`);
            console.log(`   Email: ${updatedUser.email}`);
            console.log(`   Role: ${updatedUser.role}`);
            console.log(`   Active: ${updatedUser.isActive}`);
            console.log(`   Created: ${updatedUser.createdAt}`);
        }
        
        console.log('\n🎉 SUCCESS!');
        console.log(`rabeehsp@gmail.com now has admin privileges and can:`);
        console.log('• Access admin-only endpoints');
        console.log('• Use bulk chat creation features');
        console.log('• See admin panels in frontend');
        console.log('• Manage other users (if implemented)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

// Run the admin promotion
connectDB().then(() => {
    makeUserAdmin();
});