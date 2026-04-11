const node_appwrite = require('node-appwrite');

const DB_ID = '69da165d00335f7a350e';
const COLLECTION_ID = 'applications';

const client = new node_appwrite.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_9e0aa4f10f95cf15e61068086a0499462ca42fb5079ae6ab8cca96484908d92379c8dabb8236ab85c7664b1d249388fe38d928ebc390eef37cd648b01866ef5b0db55d4be95933701bc02a94b81b091565e1d6dbbe60a2de9820b406ddaca33ef838f5099d1463f770cc0f6c75f263cb3bacc1aa66aeb6c222d7268d7375c210');

const databases = new node_appwrite.Databases(client);

async function updateApplicationsSchema() {
  try {
    // Add Offer Fields to existing applications collection
    await databases.createFloatAttribute(DB_ID, COLLECTION_ID, 'offeredPrice', false);
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'offeredDeadline', 50, false);
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'offerTerms', 2000, false);
    
    // Convert status to an enum if not already, or just use string
    // Existing status is already 'pending' (string usually)
    
    console.log('✅ Offer fields added to applications schema');
  } catch (err) {
    console.error('❌ Error during schema update:', err.message);
  }
}

updateApplicationsSchema();
