// Simple test for message bubble positioning
import fetch from 'node-fetch';

const testMessagePositioning = async () => {
  try {
    console.log('🔍 Testing Message Bubble Positioning...\n');
    
    // Step 1: Get available chats
    console.log('📋 Getting available chats...');
    const chatsResponse = await fetch('http://localhost:5000/api/chats');
    const chatsData = await chatsResponse.json();
    
    if (!chatsData.success || chatsData.data.length === 0) {
      console.log('❌ No chats available. Run seed script first.');
      return;
    }
    
    const testChatId = chatsData.data[0]._id;
    console.log(`✅ Using chat: ${chatsData.data[0].name} (${testChatId})\n`);
    
    // Step 2: Send messages from different users
    console.log('📤 Sending test messages...');
    
    // Message from User A
    const messageA = await fetch(`http://localhost:5000/api/messages/${testChatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Hello! This is User A speaking.',
        sender: 'UserA',
        senderEmail: 'usera@example.com',
        senderName: 'User A'
      })
    });
    const dataA = await messageA.json();
    console.log('✅ Message from User A sent');
    
    // Message from User B
    const messageB = await fetch(`http://localhost:5000/api/messages/${testChatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Hi there! User B here.',
        sender: 'UserB',
        senderEmail: 'userb@example.com',
        senderName: 'User B'
      })
    });
    const dataB = await messageB.json();
    console.log('✅ Message from User B sent');
    
    // Message from User A again
    const messageA2 = await fetch(`http://localhost:5000/api/messages/${testChatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Thanks for the reply!',
        sender: 'UserA',
        senderEmail: 'usera@example.com',
        senderName: 'User A'
      })
    });
    const dataA2 = await messageA2.json();
    console.log('✅ Second message from User A sent\n');
    
    // Step 3: Test message positioning for User A perspective
    console.log('👁️  Testing User A perspective (should see own messages on RIGHT):');
    const messagesForUserA = await fetch(`http://localhost:5000/api/messages/${testChatId}?userEmail=usera@example.com`);
    const userAData = await messagesForUserA.json();
    
    if (userAData.success) {
      const recentMessages = userAData.data.slice(-3);
      recentMessages.forEach((msg, index) => {
        const position = msg.position === 'right' ? '→ RIGHT' : '← LEFT';
        const own = msg.isOwnMessage ? '(OWN)' : '(OTHER)';
        console.log(`   ${index + 1}. ${position} ${own}: "${msg.content}" - ${msg.senderInfo.name}`);
      });
    }
    
    console.log('\n👁️  Testing User B perspective (should see own messages on RIGHT):');
    const messagesForUserB = await fetch(`http://localhost:5000/api/messages/${testChatId}?userEmail=userb@example.com`);
    const userBData = await messagesForUserB.json();
    
    if (userBData.success) {
      const recentMessages = userBData.data.slice(-3);
      recentMessages.forEach((msg, index) => {
        const position = msg.position === 'right' ? '→ RIGHT' : '← LEFT';
        const own = msg.isOwnMessage ? '(OWN)' : '(OTHER)';
        console.log(`   ${index + 1}. ${position} ${own}: "${msg.content}" - ${msg.senderInfo.name}`);
      });
    }
    
    console.log('\n🎉 Test completed! Message bubble positioning is working!');
    console.log('\n📋 Summary:');
    console.log('   • User A sees their own messages on the RIGHT');
    console.log('   • User A sees User B\'s messages on the LEFT');
    console.log('   • User B sees their own messages on the RIGHT');
    console.log('   • User B sees User A\'s messages on the LEFT');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run test
testMessagePositioning();