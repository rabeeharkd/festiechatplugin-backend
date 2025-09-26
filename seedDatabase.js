import connectDB from './config/database.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';

// Sample data for initial setup
const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Chat.deleteMany({});
    await Message.deleteMany({});
    
    console.log('🧹 Cleared existing data');
    
    // Create sample chats
    const chat1 = new Chat({
      name: 'General Discussion',
      description: 'Main festival chat for everyone',
      type: 'group',
      participants: [
        { name: 'Admin', role: 'admin' },
        { name: 'Alice', role: 'member' },
        { name: 'Bob', role: 'member' }
      ]
    });
    
    const chat2 = new Chat({
      name: 'Event Updates',
      description: 'Latest announcements and updates',
      type: 'announcement',
      participants: [
        { name: 'EventTeam', role: 'admin' },
        { name: 'Admin', role: 'admin' }
      ]
    });
    
    await chat1.save();
    await chat2.save();
    
    console.log('✅ Created sample chats');
    
    // Create sample messages for chat1
    const messages1 = [
      new Message({
        chat: chat1._id,
        sender: 'Admin',
        content: 'Welcome to the Festival Chat! 🎉',
        type: 'text'
      }),
      new Message({
        chat: chat1._id,
        sender: 'Alice',
        content: 'Hi everyone! So excited for the festival! 🎪',
        type: 'text'
      }),
      new Message({
        chat: chat1._id,
        sender: 'Bob',
        content: 'Can\'t wait for the music performances! 🎵',
        type: 'text'
      })
    ];
    
    // Create sample messages for chat2
    const messages2 = [
      new Message({
        chat: chat2._id,
        sender: 'EventTeam',
        content: 'New event added: Evening Concert at Main Stage!',
        type: 'text'
      }),
      new Message({
        chat: chat2._id,
        sender: 'EventTeam',
        content: 'Workshop "Digital Art Creation" starts in 30 minutes!',
        type: 'text'
      })
    ];
    
    await Message.insertMany([...messages1, ...messages2]);
    
    // Update chats with last messages
    chat1.lastMessage = {
      content: messages1[messages1.length - 1].content,
      sender: messages1[messages1.length - 1].sender,
      timestamp: new Date()
    };
    chat1.lastActivity = new Date();
    
    chat2.lastMessage = {
      content: messages2[messages2.length - 1].content,
      sender: messages2[messages2.length - 1].sender,
      timestamp: new Date()
    };
    chat2.lastActivity = new Date();
    
    await chat1.save();
    await chat2.save();
    
    console.log('✅ Created sample messages');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('Created:');
    console.log(`- ${await Chat.countDocuments()} chats`);
    console.log(`- ${await Message.countDocuments()} messages`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();