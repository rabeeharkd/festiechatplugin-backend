import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    console.log('🧹 Cleared existing data');

    // ------------------------
    // 1️⃣ Create Users
    // ------------------------
    // ------------------------
// 1️⃣ Create Users
// ------------------------
const usersData = [
  { name: 'Admin', role: 'admin', email: 'admin@festie.app', password: 'admin123' },
  { name: 'Alice', role: 'moderator', email: 'alice@festie.app', password: 'alice123' },
  { name: 'Bob', role: 'moderator', email: 'bob@festie.app', password: 'bob123' },
  { name: 'Charlie', role: 'moderator', email: 'charlie@festie.app', password: 'charlie123' },
  { name: 'Diana', role: 'moderator', email: 'diana@festie.app', password: 'diana123' }
];

// Optionally hash passwords if your schema uses bcrypt
// For seeding/testing purposes, plain text works but not recommended for production
const users = await User.insertMany(usersData);
    const userMap = {};
    users.forEach(u => userMap[u.name] = u._id);
    console.log('✅ Users created:', Object.keys(userMap));

    // ------------------------
    // 2️⃣ Group Chat
    // ------------------------
    const groupChat = new Chat({
      name: 'Festival Main Group',
      type: 'group',
      participants: [
        userMap['Admin'],
        userMap['Alice'],
        userMap['Bob'],
        userMap['Charlie'],
        userMap['Diana']
      ],
      lastActivity: new Date(),
      createdBy: userMap['Admin']
    });

    await groupChat.save();
    console.log('✅ Group chat created');

    // Sample messages for group chat
    const groupMessagesData = [
      { chatId: groupChat._id, sender: userMap['Admin'], content: 'Welcome everyone to the Festival Main Group! 🎪', timestamp: new Date() },
      { chatId: groupChat._id, sender: userMap['Alice'], content: 'Hi all, excited for the festival!', timestamp: new Date() },
      { chatId: groupChat._id, sender: userMap['Bob'], content: 'Can’t wait to see the performances!', timestamp: new Date() },
      { chatId: groupChat._id, sender: userMap['Charlie'], content: 'I am ready with my camera 📸', timestamp: new Date() },
      { chatId: groupChat._id, sender: userMap['Diana'], content: 'Let’s make it the best festival ever!', timestamp: new Date() }
    ];

    const groupMessages = await Message.insertMany(groupMessagesData);

    // Set lastMessage in group chat
    groupChat.lastMessage = groupMessages[groupMessages.length - 1]._id;
    await groupChat.save();

    console.log('✅ Group chat messages created');

    // ------------------------
    // 3️⃣ DM Chats
    // ------------------------
    const dmChatsData = [
      { name: 'Alice & Bob', participants: ['Alice', 'Bob'], lastActivityOffset: 1800000 },
      { name: 'Charlie & Diana', participants: ['Charlie', 'Diana'], lastActivityOffset: 3600000 },
      { name: 'Alice & Admin', participants: ['Alice', 'Admin'], lastActivityOffset: 7200000 },
      { name: 'Bob & Charlie', participants: ['Bob', 'Charlie'], lastActivityOffset: 600000 }
    ];

    for (const dm of dmChatsData) {
      const chat = new Chat({
        name: dm.name,
        type: 'individual',
        participants: dm.participants.map(p => userMap[p]),
        lastActivity: new Date(Date.now() - dm.lastActivityOffset),
        createdBy: userMap[dm.participants[0]]
      });

      await chat.save();

      // Sample messages
      const dmMessages = [
        { chatId: chat._id, sender: userMap[dm.participants[0]], content: `Hi ${dm.participants[1]}, how are you?`, timestamp: new Date(Date.now() - dm.lastActivityOffset + 10000) },
        { chatId: chat._id, sender: userMap[dm.participants[1]], content: `Hey ${dm.participants[0]}! I am good, thanks!`, timestamp: new Date(Date.now() - dm.lastActivityOffset + 20000) }
      ];

      const savedDM = await Message.insertMany(dmMessages);

      chat.lastMessage = savedDM[savedDM.length - 1]._id;
      await chat.save();

      console.log(`✅ DM chat created: ${dm.name}`);
    }

    const totalChats = await Chat.countDocuments();
    const totalMessages = await Message.countDocuments();

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Total chats: ${totalChats}`);
    console.log(`💬 Total messages: ${totalMessages}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
