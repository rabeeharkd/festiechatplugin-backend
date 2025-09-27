// REMOVE ALL RESTRICTIONS: Make chats completely open access
// This removes every possible restriction from all chats

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

async function removeAllRestrictions() {
    console.log('🔓 REMOVING ALL RESTRICTIONS FROM ALL CHATS');
    console.log('═══════════════════════════════════════════════════');
    
    try {
        // Get all chats
        const chats = await Chat.find({});
        console.log(`📊 Found ${chats.length} chats in database\n`);
        
        for (const chat of chats) {
            console.log(`🔧 Processing: "${chat.name}"`);
            console.log(`   Current participants: ${chat.participants?.length || 0}`);
            
            // Remove ALL possible restrictions
            const updates = {
                participants: [],                    // Empty = no participant restrictions
                isPublic: true,                     // Mark as public
                isPrivate: false,                   // Not private
                requiresInvite: false,              // No invite required
                requiresApproval: false,            // No approval needed
                maxMembers: null,                   // No member limit
                password: null,                     // No password protection
                inviteOnly: false,                  // Not invite only
                restricted: false,                  // Not restricted
                accessLevel: 'public',              // Public access
                visibility: 'public',               // Public visibility
                joinPermission: 'anyone',           // Anyone can join
                membershipType: 'open'              // Open membership
            };
            
            // Update the chat with all open settings
            await Chat.findByIdAndUpdate(chat._id, updates, { new: true });
            
            console.log(`   ✅ Removed all restrictions from "${chat.name}"`);
            console.log(`   🔓 Now completely open to everyone\n`);
        }
        
        // Verify changes
        console.log('🔍 VERIFICATION: Checking all chats are now unrestricted...');
        console.log('═══════════════════════════════════════════════════════════');
        
        const updatedChats = await Chat.find({});
        let allOpen = true;
        
        updatedChats.forEach((chat, index) => {
            const hasRestrictions = 
                (chat.participants && chat.participants.length > 0) ||
                chat.isPrivate === true ||
                chat.requiresInvite === true ||
                chat.requiresApproval === true ||
                chat.password ||
                chat.inviteOnly === true ||
                chat.restricted === true ||
                chat.accessLevel !== 'public';
            
            if (hasRestrictions) {
                allOpen = false;
                console.log(`❌ "${chat.name}" still has restrictions!`);
            } else {
                console.log(`✅ "${chat.name}" is completely open`);
            }
        });
        
        console.log('\n🎉 FINAL RESULT:');
        if (allOpen) {
            console.log('✅ SUCCESS: All chats are now completely unrestricted!');
            console.log('🔓 Anyone can see, join, and participate in any chat');
            console.log('🌐 No permissions, no participants lists, no barriers');
        } else {
            console.log('⚠️ Some chats may still have restrictions - check above');
        }
        
        console.log('\n📋 SUMMARY:');
        console.log(`• Total chats: ${updatedChats.length}`);
        console.log('• All chats set to public access');
        console.log('• No participant restrictions');
        console.log('• No invite requirements');
        console.log('• No approval processes');
        console.log('• No passwords or barriers');
        console.log('• Complete open access for everyone');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

// Run the unrestriction process
connectDB().then(() => {
    removeAllRestrictions();
});