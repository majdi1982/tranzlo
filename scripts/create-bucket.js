const node_appwrite = require('node-appwrite');

const client = new node_appwrite.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_standard_312e981375353442d9beedee35e57628727ba00d2ae66e0d021dc109a2c8298be89a0acd145c27b8f19727096d6cb68f3c8b9346e419f653868a58e2cbf73bb76020f81d6583456ad6e34dd5e6cbcc8a30c1d0e7049f03c9ff8ee299e0f277a11591127d4b4bb1b02a24e8107c32df8aed68ff8a049de0b2758086dd8fb0b3b1');

const storage = new node_appwrite.Storage(client);

async function createBucket() {
  try {
    const bucket = await storage.createBucket(
      'job_attachments',
      'Job Attachments',
      [
        node_appwrite.Permission.create(node_appwrite.Role.users()),
        node_appwrite.Permission.read(node_appwrite.Role.users()),
        node_appwrite.Permission.delete(node_appwrite.Role.users()),
      ],
      true,           // fileSecurity
      true,           // enabled
      20 * 1024 * 1024, // 20MB maxFileSize
      ['xlsx', 'xls', 'csv', 'pdf', 'doc', 'docx', 'txt', 'zip']
    );
    console.log('✅ Bucket created:', JSON.stringify(bucket, null, 2));
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️  Bucket already exists — skipping creation.');
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

createBucket();
