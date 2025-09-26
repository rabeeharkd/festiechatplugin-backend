// Quick script to add sample group chats for testing
import mongoose from 'mongoose';
import Chat from './models/Chat.js';
import dotenv from 'dotenv';

dotenv.config();

async function createSampleChats() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if we already have chats
    const existingChats = await Chat.find();
    console.log(`Found ${existingChats.length} existing chats`);

    // Create sample group chats if none exist
    if (existingChats.length === 0) {
      const sampleChats = [
        {
          name: 'General Discussion',
          type: 'group',
          description: 'Main chat for festival discussions',
          legacyParticipants: [
            { name: 'Admin', role: 'admin' },
            { name: 'Alice', role: 'member' },
            { name: 'Bob', role: 'member' }
          ],
          lastActivity: new Date()
        },
        {
          name: 'Event Coordination',
          type: 'group',
          description: 'Coordinate festival events and schedules',
          legacyParticipants: [
            { name: 'Admin', role: 'admin' },
            { name: 'Event Manager', role: 'moderator' },
            { name: 'Volunteer Team', role: 'member' }
          ],
          lastActivity: new Date()
        },
        {
          name: 'Tech Support',
          type: 'group',
          description: 'Technical support and troubleshooting',
          legacyParticipants: [
            { name: 'Admin', role: 'admin' },
            { name: 'Tech Team', role: 'moderator' }
          ],
          lastActivity: new Date()
        }
      ];

      for (const chatData of sampleChats) {
        const chat = new Chat(chatData);
        await chat.save();
        console.log(`Created chat: ${chat.name}`);
      }

      console.log('✅ Sample chats created successfully');
    } else {
      console.log('Existing chats found:');
      existingChats.forEach(chat => {
        console.log(`- ${chat.name} (${chat.type}${chat.isAdminDM ? ', Admin DM' : ''})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSampleChats();