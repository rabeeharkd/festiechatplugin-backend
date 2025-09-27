// SIMPLE SOLUTION: Give ALL users access to ALL chats
// This removes all access control restrictions

const mongoose = require('mongoose');
const Chat = require('./models/Chat');

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

async function makeAllChatsPublic() {
    console.log('🔓 MAKING ALL CHATS ACCESSIBLE TO ALL USERS');
    console.log('══════════════════════════════════════════════');
    
    try {
        // Get all chats
        const chats = await Chat.find({});
        console.log(`📊 Found ${chats.length} chats in database`);
        
        for (const chat of chats) {
            console.log(`\n📝 Processing: "${chat.name}"`);
            
            // Remove all access restrictions
            chat.participants = []; // Empty participants means public access
            chat.isPublic = true;   // Mark as public if field exists
            
            await chat.save();
            console.log(`✅ Made "${chat.name}" accessible to all users`);
        }
        
        console.log('\n🎉 SUCCESS: All chats are now accessible to all users!');
        console.log('💡 No access control - everyone can see and join all chats');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.disconnect();
    }
}

// Run the fix
connectDB().then(() => {
    makeAllChatsPublic();
});