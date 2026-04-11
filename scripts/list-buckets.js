const node_appwrite = require('node-appwrite');

// Use the API key directly
const client = new node_appwrite.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_standard_312e981375353442d9beedee35e57628727ba00d2ae66e0d021dc109a2c8298be89a0acd145c27b8f19727096d6cb68f3c8b9346e419f653868a58e2cbf73bb76020f81d6583456ad6e34dd5e6cbcc8a30c1d0e7049f03c9ff8ee299e0f277a11591127d4b4bb1b02a24e8107c32df8aed68ff8a049de0b2758086dd8fb0b3b1');

const storage = new node_appwrite.Storage(client);

async function listBuckets() {
  try {
    const buckets = await storage.listBuckets();
    console.log('Existing buckets:', JSON.stringify(buckets, null, 2));
  } catch(err) {
    console.error('List error:', err.message, err.code);
  }
}

listBuckets();
