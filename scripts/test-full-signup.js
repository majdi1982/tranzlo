const node = require('node-appwrite');

const client = new node.Client()
  .setEndpoint('https://appwrite.tranzlo.net/v1')
  .setProject('69da16050031d6ff6ddd')
  .setKey('standard_9e0aa4f10f95cf15e61068086a0499462ca42fb5079ae6ab8cca96484908d92379c8dabb8236ab85c7664b1d249388fe38d928ebc390eef37cd648b01866ef5b0db55d4be95933701bc02a94b81b091565e1d6dbbe60a2de9820b406ddaca33ef838f5099d1463f770cc0f6c75f263cb3bacc1aa66aeb6c222d7268d7375c210');

const account = new node.Account(client);
const users = new node.Users(client);

async function testFullSignup() {
  try {
    const email = `test-full-${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`Testing Full Signup with ${email}...`);
    
    // 1. Create Account
    const user = await account.create(node.ID.unique(), email, password, 'Full Test User');
    console.log('✅ Account created:', user.$id);
    
    // 2. Update Labels
    await users.updateLabels(user.$id, ['translator']);
    console.log('✅ Labels updated');
    
    // 3. Create Session
    const session = await account.createEmailPasswordSession(email, password);
    console.log('✅ Session created. Secret ends with:', session.secret.slice(-5));
    
    // Cleanup
    await users.delete(user.$id);
    console.log('✅ Full Test cleaned up');
    
  } catch (err) {
    console.error('❌ FULL SIGNUP TEST FAILED:', err.message);
    if (err.response) {
      console.error('Response Data:', err.response);
    }
  }
}

testFullSignup();
