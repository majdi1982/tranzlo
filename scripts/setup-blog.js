const node_appwrite = require('node-appwrite');

const DB_ID = '69da165d00335f7a350e';
const COLLECTION_ID = 'blog';

const client = new node_appwrite.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_9e0aa4f10f95cf15e61068086a0499462ca42fb5079ae6ab8cca96484908d92379c8dabb8236ab85c7664b1d249388fe38d928ebc390eef37cd648b01866ef5b0db55d4be95933701bc02a94b81b091565e1d6dbbe60a2de9820b406ddaca33ef838f5099d1463f770cc0f6c75f263cb3bacc1aa66aeb6c222d7268d7375c210');

const databases = new node_appwrite.Databases(client);

async function setupBlog() {
  try {
    // 1. Create Collection
    await databases.createCollection(DB_ID, COLLECTION_ID, 'Blog Posts', [
      node_appwrite.Permission.read(node_appwrite.Role.any()),
      node_appwrite.Permission.create(node_appwrite.Role.label('admin')),
      node_appwrite.Permission.update(node_appwrite.Role.label('admin')),
      node_appwrite.Permission.delete(node_appwrite.Role.label('admin')),
    ]);
    console.log('✅ Collection created');

    // 2. Add Attributes
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'title', 255, true);
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'slug', 255, true);
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'content', 10000, true);
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'excerpt', 500, false);
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'author', 100, true);
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'category', 50, true);
    await databases.createStringAttribute(DB_ID, COLLECTION_ID, 'featuredImage', 255, false);
    await databases.createBooleanAttribute(DB_ID, COLLECTION_ID, 'published', false, true);
    
    console.log('✅ Attributes defined');
    
    // 3. Create Indexes
    await databases.createIndex(DB_ID, COLLECTION_ID, 'idx_slug', 'unique', ['slug']);
    await databases.createIndex(DB_ID, COLLECTION_ID, 'idx_published', 'key', ['published', '$createdAt'], ['ASC', 'DESC']);

    console.log('✅ setup complete');
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️  Blog already exists.');
    } else {
      console.error('❌ Error during setup:', err.message);
    }
  }
}

setupBlog();
