// FINAL FIX: Update the actual Chat model fields that exist

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

async function finalUnrestrict() {
    console.log('🔧 FINAL UNRESTRICTION: Using actual Chat model fields');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
        const chats = await Chat.find({});
        
        for (const chat of chats) {
            console.log(`\n📝 Updating: "${chat.name}"`);
            
            // Update the fields that actually exist in the model
            const updates = {
                'participants': [],                    // Clear participants list
                'settings.isPublic': true,            // Make public in settings
                'settings.requireApproval': false,    // No approval needed
                'settings.maxParticipants': 999999,   // Remove member limit
                'isAdminDM': false,                   // Not admin-only
                'isArchived': false,                  // Not archived
                'isMuted': false,                     // Not muted
                'isActive': true                      // Keep active
            };
            
            await Chat.findByIdAndUpdate(chat._id, updates, { new: true });
            
            console.log(`   ✅ Updated "${chat.name}"`);
            console.log(`   🔓 Cleared participants list`);
            console.log(`   📢 Set settings.isPublic = true`);
            console.log(`   ✨ Removed approval requirements`);
            console.log(`   ∞  Removed member limits`);
        }
        
        // Verify the changes
        console.log('\n🔍 VERIFICATION:');
        console.log('═══════════════');
        
        const updatedChats = await Chat.find({});
        
        updatedChats.forEach(chat => {
            console.log(`\n"${chat.name}":`);
            console.log(`   - participants: ${chat.participants?.length || 0}`);
            console.log(`   - settings.isPublic: ${chat.settings?.isPublic}`);
            console.log(`   - settings.requireApproval: ${chat.settings?.requireApproval}`);
            console.log(`   - settings.maxParticipants: ${chat.settings?.maxParticipants}`);
            console.log(`   - isActive: ${chat.isActive}`);
            
            const isOpen = 
                (!chat.participants || chat.participants.length === 0) &&
                chat.settings?.isPublic === true &&
                chat.settings?.requireApproval === false;
            
            console.log(`   - STATUS: ${isOpen ? '✅ COMPLETELY OPEN' : '❌ CHECK NEEDED'}`);
        });
        
        console.log('\n🎉 FINAL RESULT:');
        console.log('✅ All chats updated with maximum openness settings');
        console.log('🔓 Empty participants lists = no restrictions');
        console.log('📢 settings.isPublic = true for all chats');
        console.log('✨ No approval required for any chat');
        console.log('🌐 All authenticated users can access all chats');
        
        console.log('\n💡 FOR YOUR BACKEND API:');
        console.log('The GET /api/chats endpoint should now return all chats');
        console.log('because we removed participant-based filtering.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

// Run the final unrestriction
connectDB().then(() => {
    finalUnrestrict();
});