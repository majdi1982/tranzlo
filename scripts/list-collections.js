const node = require('node-appwrite');

const client = new node.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_9e0aa4f10f95cf15e61068086a0499462ca42fb5079ae6ab8cca96484908d92379c8dabb8236ab85c7664b1d249388fe38d928ebc390eef37cd648b01866ef5b0db55d4be95933701bc02a94b81b091565e1d6dbbe60a2de9820b406ddaca33ef838f5099d1463f770cc0f6c75f263cb3bacc1aa66aeb6c222d7268d7375c210');

const databases = new node.Databases(client);

async function list() {
  try {
    const res = await databases.listCollections('69da165d00335f7a350e');
    console.log('Collections Found:');
    res.collections.forEach(c => {
      console.log(`- ${c.name} (ID: ${c.$id})`);
    });
  } catch (err) {
    console.error('Error listing collections:', err.message);
  }
}

list();
