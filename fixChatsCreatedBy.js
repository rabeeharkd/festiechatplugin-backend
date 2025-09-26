
// Script to fix missing 'createdBy' field in Chat documents
// Usage: node fixChatsCreatedBy.js

require('dotenv').config();
const mongoose = require('mongoose');
const Chat = require('./models/Chat.js');
const User = require('./models/User.js');

const MONGO_URI = 'mongodb://localhost:27017/festiechat';

async function fixChats() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const chats = await Chat.find({ createdBy: { $exists: false } });
  console.log(`Found ${chats.length} chats missing 'createdBy'`);

  for (const chat of chats) {
    let newCreatedBy = null;
    if (chat.participants && chat.participants.length > 0) {
      newCreatedBy = chat.participants[0];
    } else {
      // fallback: use first user in DB
      const user = await User.findOne();
      if (user) newCreatedBy = user._id;
    }
    if (newCreatedBy) {
      chat.createdBy = newCreatedBy;
      await chat.save();
      console.log(`Updated chat ${chat._id} with createdBy ${newCreatedBy}`);
    } else {
      console.log(`Could not update chat ${chat._id} (no user found)`);
    }
  }
  await mongoose.disconnect();
  console.log('Done.');
}

fixChats().catch(err => {
  console.error('Error fixing chats:', err);
  process.exit(1);
});
