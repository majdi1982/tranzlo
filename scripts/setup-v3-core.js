const node = require('node-appwrite');

const DB_ID = '69da165d00335f7a350e';
const client = new node.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_9e0aa4f10f95cf15e61068086a0499462ca42fb5079ae6ab8cca96484908d92379c8dabb8236ab85c7664b1d249388fe38d928ebc390eef37cd648b01866ef5b0db55d4be95933701bc02a94b81b091565e1d6dbbe60a2de9820b406ddaca33ef838f5099d1463f770cc0f6c75f263cb3bacc1aa66aeb6c222d7268d7375c210');

const databases = new node.Databases(client);

async function setupCore() {
  try {
    // 1. Create Jobs Collection
    console.log('Creating Jobs collection...');
    await databases.createCollection(DB_ID, 'jobs', 'Jobs', [
      node.Permission.read(node.Role.any()),
      node.Permission.create(node.Role.users()),
      node.Permission.update(node.Role.users()),
    ]);
    await databases.createStringAttribute(DB_ID, 'jobs', 'userId', 36, true);
    await databases.createStringAttribute(DB_ID, 'jobs', 'jobTitle', 255, true);
    await databases.createStringAttribute(DB_ID, 'jobs', 'jobDescription', 5000, true);
    await databases.createStringAttribute(DB_ID, 'jobs', 'serviceType', 50, true);
    await databases.createStringAttribute(DB_ID, 'jobs', 'sourceLanguage', 50, true);
    await databases.createStringAttribute(DB_ID, 'jobs', 'targetLanguage', 50, true);
    await databases.createStringAttribute(DB_ID, 'jobs', 'status', 20, false, 'published');
    console.log('✅ Jobs ready');

    // 2. Create Applications Collection
    console.log('Creating Applications collection...');
    await databases.createCollection(DB_ID, 'applications', 'Applications', [
      node.Permission.read(node.Role.users()),
      node.Permission.create(node.Role.users()),
      node.Permission.update(node.Role.users()),
    ]);
    await databases.createStringAttribute(DB_ID, 'applications', 'jobId', 36, true);
    await databases.createStringAttribute(DB_ID, 'applications', 'translatorId', 36, true);
    await databases.createStringAttribute(DB_ID, 'applications', 'translatorName', 255, true);
    await databases.createStringAttribute(DB_ID, 'applications', 'coverLetter', 5000, true);
    await databases.createFloatAttribute(DB_ID, 'applications', 'proposedPrice', true);
    await databases.createStringAttribute(DB_ID, 'applications', 'status', 20, false, 'pending');
    
    // Add V4 Offer Fields
    await databases.createFloatAttribute(DB_ID, 'applications', 'offeredPrice', false);
    await databases.createStringAttribute(DB_ID, 'applications', 'offeredDeadline', 50, false);
    await databases.createStringAttribute(DB_ID, 'applications', 'offerTerms', 2000, false);
    
    console.log('✅ Applications ready');

    console.log('🚀 Phase 3 Base Infrastructure Complete!');
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️  Core already exists.');
    } else {
      console.error('❌ Error during core setup:', err.message);
    }
  }
}

setupCore();
