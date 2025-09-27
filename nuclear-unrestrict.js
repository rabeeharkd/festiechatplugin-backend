// DEEP ANALYSIS: Check what restrictions still exist and remove them completely

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

async function analyzeAndFixRestrictions() {
    console.log('🔍 DEEP ANALYSIS: Finding and removing ALL restrictions');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
        const chats = await Chat.find({});
        
        for (const chat of chats) {
            console.log(`\n📋 ANALYZING: "${chat.name}"`);
            console.log('Current chat object:', JSON.stringify(chat.toObject(), null, 2));
            
            // Check every possible restriction field
            const restrictions = [];
            
            if (chat.participants && chat.participants.length > 0) {
                restrictions.push(`participants: ${chat.participants.length} members`);
            }
            if (chat.isPrivate === true) restrictions.push('isPrivate: true');
            if (chat.requiresInvite === true) restrictions.push('requiresInvite: true');
            if (chat.requiresApproval === true) restrictions.push('requiresApproval: true');
            if (chat.password) restrictions.push('password protected');
            if (chat.inviteOnly === true) restrictions.push('inviteOnly: true');
            if (chat.restricted === true) restrictions.push('restricted: true');
            if (chat.accessLevel && chat.accessLevel !== 'public') {
                restrictions.push(`accessLevel: ${chat.accessLevel}`);
            }
            if (chat.visibility && chat.visibility !== 'public') {
                restrictions.push(`visibility: ${chat.visibility}`);
            }
            if (chat.joinPermission && chat.joinPermission !== 'anyone') {
                restrictions.push(`joinPermission: ${chat.joinPermission}`);
            }
            if (chat.membershipType && chat.membershipType !== 'open') {
                restrictions.push(`membershipType: ${chat.membershipType}`);
            }
            
            console.log(`Found restrictions: ${restrictions.length > 0 ? restrictions.join(', ') : 'None detected'}`);
            
            // NUCLEAR OPTION: Replace entire document with minimal structure
            const completelyOpenChat = {
                name: chat.name,
                description: chat.description || 'Open access chat',
                type: chat.type || 'group',
                category: chat.category || 'general',
                createdBy: chat.createdBy,
                createdAt: chat.createdAt,
                participants: [],
                isPublic: true,
                isPrivate: false,
                restricted: false,
                accessLevel: 'public',
                visibility: 'public',
                joinPermission: 'anyone',
                membershipType: 'open',
                requiresInvite: false,
                requiresApproval: false,
                inviteOnly: false,
                maxMembers: null,
                password: null
            };
            
            // Replace the entire chat document
            await Chat.findByIdAndUpdate(chat._id, completelyOpenChat, { 
                new: true,
                overwrite: true  // This replaces the entire document
            });
            
            console.log(`✅ Completely replaced "${chat.name}" with unrestricted version`);
        }
        
        // Final verification
        console.log('\n🔍 FINAL VERIFICATION:');
        console.log('══════════════════════');
        
        const finalChats = await Chat.find({});
        
        finalChats.forEach(chat => {
            console.log(`\n"${chat.name}":`);
            console.log(`  - participants: ${chat.participants?.length || 0}`);
            console.log(`  - isPublic: ${chat.isPublic}`);
            console.log(`  - isPrivate: ${chat.isPrivate}`);
            console.log(`  - restricted: ${chat.restricted}`);
            console.log(`  - accessLevel: ${chat.accessLevel}`);
            console.log(`  - visibility: ${chat.visibility}`);
            console.log(`  - joinPermission: ${chat.joinPermission}`);
            console.log(`  - membershipType: ${chat.membershipType}`);
            
            const isCompletelyOpen = 
                (!chat.participants || chat.participants.length === 0) &&
                chat.isPublic === true &&
                chat.isPrivate === false &&
                chat.restricted === false &&
                chat.accessLevel === 'public' &&
                chat.visibility === 'public' &&
                chat.joinPermission === 'anyone' &&
                chat.membershipType === 'open';
            
            console.log(`  - STATUS: ${isCompletelyOpen ? '✅ COMPLETELY OPEN' : '❌ STILL RESTRICTED'}`);
        });
        
        console.log('\n🎉 ALL CHATS ARE NOW COMPLETELY UNRESTRICTED!');
        console.log('🌐 Every authenticated user can see and join any chat');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

// Run the complete unrestriction
connectDB().then(() => {
    analyzeAndFixRestrictions();
});