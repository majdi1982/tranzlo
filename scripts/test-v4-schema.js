const node = require('node-appwrite');

const PROJECT_ID = '69da16050031d6ff6ddd';
const DB_ID = '69da165d00335f7a350e';
const ENDPOINT = 'https://appwrite.tranzlo.net/v1';
const API_KEY = 'standard_9e0aa4f10f95cf15e61068086a0499462ca42fb5079ae6ab8cca96484908d92379c8dabb8236ab85c7664b1d249388fe38d928ebc390eef37cd648b01866ef5b0db55d4be95933701bc02a94b81b091565e1d6dbbe60a2de9820b406ddaca33ef838f5099d1463f770cc0f6c75f263cb3bacc1aa66aeb6c222d7268d7375c210';

const client = new node.Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new node.Databases(client);

async function verifySchema() {
  console.log('--- Tranzlo V4 Schema Verification ---');
  
  const requiredCollections = [
    'users_meta',
    'jobs',
    'job_applications',
    'translators',
    'companies',
    'notifications',
    'conversations',
    'messages',
    'blog_posts'
  ];

  for (const collId of requiredCollections) {
    try {
      const coll = await databases.getCollection(DB_ID, collId);
      console.log(`✅ Collection [${collId}] exists: ${coll.name}`);
      
      const attrs = await databases.listAttributes(DB_ID, collId);
      console.log(`   Found ${attrs.total} attributes`);
      
      // Sample check for a key field
      const hasUserId = attrs.attributes.some(a => a.key === 'userId' || a.key === 'jobId');
      if (hasUserId) console.log(`   ✅ Primary keys found`);
      else console.log(`   ⚠️ Potential missing linkage keys`);

    } catch (e) {
      console.error(`❌ Collection [${collId}] missing or unreachable:`, e.message);
    }
  }

  console.log('\n--- Verification Complete ---');
}

verifySchema();
