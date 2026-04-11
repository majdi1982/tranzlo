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
const storage = new node.Storage(client);

async function setupV4() {
  console.log('--- Tranzlo V4 Master Provisioning ---');

  try {
    // 1. users_meta
    await createCollection('users_meta', 'Users Metadata', [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'role', type: 'string', size: 20, required: true },
      { key: 'plan', type: 'string', size: 50, required: false, default: 'free' },
      { key: 'agreedToTerms', type: 'boolean', required: true },
      { key: 'profileCompletion', type: 'float', required: false, default: 0.0 },
      { key: 'lastLogin', type: 'datetime', required: false }
    ], [
      node.Permission.read(node.Role.any()),
      node.Permission.create(node.Role.users()),
      node.Permission.update(node.Role.users()),
    ]);

    // 2. jobs
    await createCollection('jobs', 'Jobs v4', [
      { key: 'jobTitle', type: 'string', size: 255, required: true },
      { key: 'serviceType', type: 'string', size: 50, required: true },
      { key: 'sourceLanguage', type: 'string', size: 50, required: true },
      { key: 'targetLanguages', type: 'string', size: 255, required: true, array: true },
      { key: 'specialization', type: 'string', size: 100, required: false },
      { key: 'description', type: 'string', size: 10000, required: true },
      { key: 'wordCount', type: 'integer', required: false },
      { key: 'budgetType', type: 'string', size: 20, required: true }, // hourly, fixed
      { key: 'budgetAmount', type: 'float', required: true },
      { key: 'workMode', type: 'string', size: 20, required: false }, // remote, onsite
      { key: 'deadline', type: 'datetime', required: false },
      { key: 'contactMethod', type: 'string', size: 50, required: false },
      { key: 'attachments', type: 'string', size: 36, required: false, array: true }
    ], [
      node.Permission.read(node.Role.any()),
      node.Permission.create(node.Role.users()),
      node.Permission.update(node.Role.users()),
    ]);

    // 3. job_applications
    await createCollection('job_applications', 'Job Applications v4', [
      { key: 'jobId', type: 'string', size: 36, required: true },
      { key: 'translatorId', type: 'string', size: 36, required: true },
      { key: 'coverMessage', type: 'string', size: 5000, required: true },
      { key: 'proposedRateType', type: 'string', size: 20, required: true },
      { key: 'proposedRateAmount', type: 'float', required: true },
      { key: 'currency', type: 'string', size: 10, required: false, default: 'USD' },
      { key: 'estimatedDeliveryAt', type: 'datetime', required: false },
      { key: 'status', type: 'string', size: 20, required: false, default: 'submitted' }
    ], [
      node.Permission.read(node.Role.users()),
      node.Permission.create(node.Role.users()),
      node.Permission.update(node.Role.users()),
    ]);

    // 4. notifications
    await createCollection('notifications', 'Notifications v4', [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'type', type: 'string', size: 50, required: false },
      { key: 'read', type: 'boolean', required: false, default: false },
      { key: 'link', type: 'string', size: 255, required: false }
    ], [
      node.Permission.read(node.Role.users()),
      node.Permission.update(node.Role.users()),
    ]);

    // 5. conversations
    await createCollection('conversations', 'Conversations v4', [
      { key: 'participants', type: 'string', size: 36, required: true, array: true },
      { key: 'relatedJobId', type: 'string', size: 36, required: false }
    ], [
      node.Permission.read(node.Role.users()),
      node.Permission.create(node.Role.users()),
    ]);

    // 6. messages
    await createCollection('messages', 'Messages v4', [
      { key: 'conversationId', type: 'string', size: 36, required: true },
      { key: 'senderId', type: 'string', size: 36, required: true },
      { key: 'text', type: 'string', size: 5000, required: true },
      { key: 'attachments', type: 'string', size: 36, required: false, array: true }
    ], [
      node.Permission.read(node.Role.users()),
      node.Permission.create(node.Role.users()),
    ]);

    // 7. translators
    await createCollection('translators', 'Translators Profile v4', [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'bio', type: 'string', size: 5000, required: false },
      { key: 'nativeLanguage', type: 'string', size: 50, required: false },
      { key: 'sourceLanguages', type: 'string', size: 50, required: false, array: true },
      { key: 'targetLanguages', type: 'string', size: 50, required: false, array: true },
      { key: 'specialties', type: 'string', size: 100, required: false, array: true },
      { key: 'rating', type: 'float', required: false, default: 0.0 },
      { key: 'totalJobs', type: 'integer', required: false, default: 0 },
      { key: 'isVerified', type: 'boolean', required: false, default: false },
      { key: 'cvFileId', type: 'string', size: 36, required: false }
    ], [
      node.Permission.read(node.Role.any()),
      node.Permission.create(node.Role.users()),
      node.Permission.update(node.Role.users()),
    ]);

    // 8. companies
    await createCollection('companies', 'Companies Profile v4', [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'companyName', type: 'string', size: 255, required: true },
      { key: 'industry', type: 'string', size: 100, required: false },
      { key: 'website', type: 'string', size: 255, required: false },
      { key: 'bio', type: 'string', size: 5000, required: false },
      { key: 'logoFileId', type: 'string', size: 36, required: false },
      { key: 'isVerified', type: 'boolean', required: false, default: false }
    ], [
      node.Permission.read(node.Role.any()),
      node.Permission.create(node.Role.users()),
      node.Permission.update(node.Role.users()),
    ]);

    // 9. blog_posts
    await createCollection('blog_posts', 'Blog Posts v4', [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 20000, required: true },
      { key: 'excerpt', type: 'string', size: 1000, required: false },
      { key: 'category', type: 'string', size: 50, required: false, default: 'translation' },
      { key: 'featuredImage', type: 'string', size: 36, required: false },
      { key: 'published', type: 'boolean', required: false, default: true }
    ], [
      node.Permission.read(node.Role.any()),
      node.Permission.create(node.Role.label('admin')),
      node.Permission.update(node.Role.label('admin')),
      node.Permission.delete(node.Role.label('admin')),
    ]);

    // 10. subscriptions
    await createCollection('subscriptions', 'Subscriptions v4', [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'planType', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: false },
      { key: 'lastPaymentId', type: 'string', size: 255, required: false }
    ], [
      node.Permission.read(node.Role.users()),
    ]);

    // 11. storage buckets
    const buckets = ['avatars', 'cvs', 'certificates', 'company_docs', 'job_attachments'];
    for (const bucket of buckets) {
      try {
        console.log(`Creating bucket: ${bucket}...`);
        await storage.createBucket(bucket, bucket, [
          node.Permission.read(node.Role.any()),
          node.Permission.create(node.Role.users()),
          node.Permission.update(node.Role.users()),
          node.Permission.delete(node.Role.users()),
        ], false, false, undefined, ['jpg', 'png', 'pdf', 'doc', 'docx']);
        console.log(`✅ Bucket ${bucket} ready`);
      } catch (e) {
        if (e.code === 409) console.log(`ℹ️ Bucket ${bucket} already exists`);
        else throw e;
      }
    }

    console.log('🚀 Tranzlo V4 Infrastructure Provisioned Successfully!');
  } catch (err) {
    console.error('❌ Provisioning Failed:', err.message);
    if (err.response) console.error(JSON.stringify(err.response, null, 2));
  }
}

async function createCollection(id, name, attributes, permissions) {
  try {
    console.log(`Creating collection: ${id}...`);
    try {
      await databases.createCollection(DB_ID, id, name, permissions);
      console.log(`✅ Collection ${id} created`);
    } catch (e) {
      if (e.code === 409) {
        console.log(`ℹ️ Collection ${id} already exists`);
      } else {
        throw e;
      }
    }

    // Attributes
    for (const attr of attributes) {
      try {
        console.log(`  Creating attribute: ${attr.key}...`);
        if (attr.type === 'string') {
          await databases.createStringAttribute(DB_ID, id, attr.key, attr.size, attr.required, attr.default, attr.array);
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(DB_ID, id, attr.key, attr.required, attr.default);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(DB_ID, id, attr.key, attr.required, 0, 1000000, attr.default);
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(DB_ID, id, attr.key, attr.required, 0, 1000000, attr.default);
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(DB_ID, id, attr.key, attr.required, attr.default);
        }
        console.log(`  ✅ ${attr.key} ready`);
      } catch (e) {
        if (e.code === 409) console.log(`  ℹ️ ${attr.key} exists`);
        else throw e;
      }
    }
  } catch (err) {
    console.error(`❌ Error in collection ${id}:`, err.message);
  }
}

setupV4();
