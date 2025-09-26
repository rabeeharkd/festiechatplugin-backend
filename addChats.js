import mongoose from 'mongoose';
import Chat from './models/Chat.js';
import Message from './models/Message.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const addChats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing chats and messages
    await Chat.deleteMany({});
    await Message.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create 1 Group Chat
    const groupChat = new Chat({
      name: 'Festival Main Group',
      description: 'Main discussion for all festival attendees',
      type: 'group',
      participants: [
        { name: 'Admin', role: 'admin' },
        { name: 'Alice', role: 'member' },
        { name: 'Bob', role: 'member' },
        { name: 'Charlie', role: 'member' },
        { name: 'Diana', role: 'moderator' }
      ],
      lastMessage: {
        content: 'Welcome everyone to the Festival Main Group! 🎪',
        sender: 'Admin',
        timestamp: new Date()
      },
      lastActivity: new Date(),
      createdBy: new mongoose.Types.ObjectId() // Generate a dummy ObjectId
    });

    await groupChat.save();
    console.log('✅ Created group chat: Festival Main Group');

    // Create 4 Direct Message Chats
    const dmChats = [
      {
        name: 'Alice & Bob',
        description: null,
        type: 'individual',
        participants: [
          { name: 'Alice', role: 'member' },
          { name: 'Bob', role: 'member' }
        ],
        lastMessage: {
          content: 'Hey Bob! Are you coming to the concert tonight?',
          sender: 'Alice',
          timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
        },
        lastActivity: new Date(Date.now() - 1800000),
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        name: 'Charlie & Diana',
        description: null,
        type: 'individual',
        participants: [
          { name: 'Charlie', role: 'member' },
          { name: 'Diana', role: 'member' }
        ],
        lastMessage: {
          content: 'Thanks for helping with the event setup!',
          sender: 'Charlie',
          timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        },
        lastActivity: new Date(Date.now() - 3600000),
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        name: 'Alice & Admin',
        description: null,
        type: 'individual',
        participants: [
          { name: 'Alice', role: 'member' },
          { name: 'Admin', role: 'member' }
        ],
        lastMessage: {
          content: 'Could you help me with the workshop registration?',
          sender: 'Alice',
          timestamp: new Date(Date.now() - 7200000) // 2 hours ago
        },
        lastActivity: new Date(Date.now() - 7200000),
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        name: 'Bob & Charlie',
        description: null,
        type: 'individual',
        participants: [
          { name: 'Bob', role: 'member' },
          { name: 'Charlie', role: 'member' }
        ],
        lastMessage: {
          content: 'Let\'s meet at the food court in 10 minutes',
          sender: 'Bob',
          timestamp: new Date(Date.now() - 600000) // 10 minutes ago
        },
        lastActivity: new Date(Date.now() - 600000),
        createdBy: new mongoose.Types.ObjectId()
      }
    ];

    // Save all DM chats
    for (let i = 0; i < dmChats.length; i++) {
      const dmChat = new Chat(dmChats[i]);
      await dmChat.save();
      console.log(`✅ Created DM chat: ${dmChats[i].name}`);
    }

    // Add some sample messages to the group chat
    const groupMessages = [
      new Message({
        chat: groupChat._id,
        sender: 'Admin',
        content: 'Welcome everyone to the Festival Main Group! 🎪',
        type: 'text'
      }),
      new Message({
        chat: groupChat._id,
        sender: 'Alice',
        content: 'So excited for this festival! When does the music start?',
        type: 'text'
      }),
      new Message({
        chat: groupChat._id,
        sender: 'Bob',
        content: 'I think the first band starts at 2 PM on the main stage! 🎵',
        type: 'text'
      }),
      new Message({
        chat: groupChat._id,
        sender: 'Diana',
        content: 'Don\'t forget to check out the art workshops too!',
        type: 'text'
      }),
      new Message({
        chat: groupChat._id,
        sender: 'Charlie',
        content: 'Food trucks are amazing this year! 🍕🌮',
        type: 'text'
      })
    ];

    await Message.insertMany(groupMessages);
    console.log('✅ Added sample messages to group chat');

    console.log('\n🎉 Successfully created:');
    console.log('📊 1 Group chat: Festival Main Group');
    console.log('💬 4 DM chats:');
    console.log('   - Alice & Bob');
    console.log('   - Charlie & Diana');
    console.log('   - Alice & Admin');
    console.log('   - Bob & Charlie');
    console.log('📝 5 sample messages in group chat');
    
    const totalChats = await Chat.countDocuments();
    const totalMessages = await Message.countDocuments();
    console.log(`\n📈 Database now has: ${totalChats} chats, ${totalMessages} messages`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating chats:', error);
    process.exit(1);
  }
};

addChats();