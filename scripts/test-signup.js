const node = require('node-appwrite');

const client = new node.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_9e0aa4f10f95cf15e61068086a0499462ca42fb5079ae6ab8cca96484908d92379c8dabb8236ab85c7664b1d249388fe38d928ebc390eef37cd648b01866ef5b0db55d4be95933701bc02a94b81b091565e1d6dbbe60a2de9820b406ddaca33ef838f5099d1463f770cc0f6c75f263cb3bacc1aa66aeb6c222d7268d7375c210');

const users = new node.Users(client);

async function testSignup() {
  try {
    const email = `test-${Date.now()}@example.com`;
    console.log(`Testing signup with ${email}...`);
    
    // Attempting what the signup action does
    const user = await users.create(node.ID.unique(), email, undefined, 'password123', 'Test User');
    console.log('✅ User created successfully:', user.$id);
    
    await users.updateLabels(user.$id, ['translator']);
    console.log('✅ Labels updated');
    
    // Cleanup
    await users.delete(user.$id);
    console.log('✅ Test user cleaned up');
    
  } catch (err) {
    console.error('❌ SIGNUP TEST FAILED:', err.message);
    if (err.response) {
      console.error('Response Data:', err.response);
    }
  }
}

testSignup();
