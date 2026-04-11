const node_appwrite = require('node-appwrite');

const DB_ID = '69da165d00335f7a350e';

const client = new node_appwrite.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_9e0aa4f10f95cf15e61068086a0499462ca42fb5079ae6ab8cca96484908d92379c8dabb8236ab85c7664b1d249388fe38d928ebc390eef37cd648b01866ef5b0db55d4be95933701bc02a94b81b091565e1d6dbbe60a2de9820b406ddaca33ef838f5099d1463f770cc0f6c75f263cb3bacc1aa66aeb6c222d7268d7375c210');

const databases = new node_appwrite.Databases(client);

async function setupChat() {
  try {
    // 1. Create Conversations Collection
    await databases.createCollection(DB_ID, 'conversations', 'Conversations', [
      node_appwrite.Permission.read(node_appwrite.Role.users()),
      node_appwrite.Permission.create(node_appwrite.Role.users()),
    ]);
    await databases.createStringAttribute(DB_ID, 'conversations', 'jobId', 36, false);
    await databases.createStringAttribute(DB_ID, 'conversations', 'participants', 36, true, undefined, true); // Array
    await databases.createStringAttribute(DB_ID, 'conversations', 'lastMessage', 1000, false);
    await databases.createStringAttribute(DB_ID, 'conversations', 'lastMessageAt', 50, false);
    console.log('✅ Conversations setup complete');

    // 2. Create Messages Collection
    await databases.createCollection(DB_ID, 'messages', 'Messages', [
      node_appwrite.Permission.read(node_appwrite.Role.users()),
      node_appwrite.Permission.create(node_appwrite.Role.users()),
    ]);
    await databases.createStringAttribute(DB_ID, 'messages', 'conversationId', 36, true);
    await databases.createStringAttribute(DB_ID, 'messages', 'senderId', 36, true);
    await databases.createStringAttribute(DB_ID, 'messages', 'senderName', 255, true);
    await databases.createStringAttribute(DB_ID, 'messages', 'content', 5000, true);
    console.log('✅ Messages setup complete');

    // Indexes
    await databases.createIndex(DB_ID, 'messages', 'idx_convo', 'key', ['conversationId']);
    await databases.createIndex(DB_ID, 'conversations', 'idx_job', 'key', ['jobId']);
    
    console.log('✅ Chat indexing complete');
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️  Chat collections already exist.');
    } else {
      console.error('❌ Error during chat setup:', err.message);
    }
  }
}

setupChat();
