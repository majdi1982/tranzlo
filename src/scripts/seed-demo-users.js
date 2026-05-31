const endpoint = "https://appwrite.tranzlo.net/v1";
const projectId = "6a156f9000335c99e9be";
const apiKey = "standard_17383c66fe7564fe45a118d89c5bc194c8bfbb05c50dde040e1e9373419e59bf107290a09f561c74f80fecd3302f665617d7cefb7aed89687d938a63592dd898484fe95a2d6480d3b78709a475be7e8ef24d31f9b39eb6680f010e4d7e4e899fde86d67e14088383a703e7eb0811177235db722a3e6077bba8ad2363089922cf";
const databaseId = "tranzlo_main";

const demoUsers = [
  {
    userId: "translator_demo",
    email: "translator@demo.tranzlo",
    password: "password123",
    name: "Translator Demo",
    role: "translator",
    collection: "translator_profiles",
    profileData: {
      userId: "translator_demo",
      email: "translator@demo.tranzlo",
      fullName: "Translator Demo",
      isVerified: true,
      verificationStatus: "verified",
      planTier: "free",
      completedJobs: 0,
      rating: 5,
      ratingCount: 1,
      isApproved: true,
      status: "active",
      onboardingComplete: true
    }
  },
  {
    userId: "company_demo",
    email: "company@demo.tranzlo",
    password: "password123",
    name: "Company Demo",
    role: "company",
    collection: "company_profiles",
    profileData: {
      userId: "company_demo",
      email: "company@demo.tranzlo",
      companyName: "Company Demo Ltd",
      fullName: "Company Demo",
      contactPerson: "Demo Representative",
      isVerified: true,
      verificationStatus: "verified",
      planTier: "free",
      isApproved: true,
      status: "active",
      onboardingComplete: true
    }
  },
  {
    userId: "admin_demo",
    email: "admin@demo.tranzlo",
    password: "password123",
    name: "Admin Demo",
    role: "admin"
  }
];

async function seed() {
  console.log("🚀 Starting Appwrite Demo Users Seeder...");

  for (const user of demoUsers) {
    console.log(`\n👤 Seeding user: ${user.email}...`);

    // 1. Create User
    try {
      const userRes = await fetch(`${endpoint}/users`, {
        method: "POST",
        headers: {
          "X-Appwrite-Project": projectId,
          "X-Appwrite-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.userId,
          email: user.email,
          password: user.password,
          name: user.name
        })
      });

      const userJson = await userRes.json();
      if (!userRes.ok) {
        if (userJson.code === 409) {
          console.log("ℹ️ User already exists in Auth.");
        } else {
          throw new Error(`Auth Error: ${userJson.message}`);
        }
      } else {
        console.log("✅ User created successfully in Auth.");
      }
    } catch (err) {
      console.error(`❌ Error creating Auth user:`, err.message);
    }

    // 2. Update User Prefs (Role)
    try {
      const prefRes = await fetch(`${endpoint}/users/${user.userId}/prefs`, {
        method: "PATCH",
        headers: {
          "X-Appwrite-Project": projectId,
          "X-Appwrite-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prefs: { role: user.role }
        })
      });

      if (!prefRes.ok) {
        const prefJson = await prefRes.json();
        throw new Error(`Prefs Error: ${prefJson.message}`);
      }
      console.log(`✅ User preferences (role: ${user.role}) updated.`);
    } catch (err) {
      console.error(`❌ Error updating user preferences:`, err.message);
    }

    // 3. Create Document in collection if available
    if (user.collection && user.profileData) {
      try {
        const docRes = await fetch(`${endpoint}/databases/${databaseId}/collections/${user.collection}/documents`, {
          method: "POST",
          headers: {
            "X-Appwrite-Project": projectId,
            "X-Appwrite-Key": apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            documentId: user.userId,
            data: user.profileData
          })
        });

        const docJson = await docRes.json();
        if (!docRes.ok) {
          if (docJson.code === 409) {
            console.log(`ℹ️ Profile document already exists in collection '${user.collection}'.`);
          } else {
            throw new Error(`Collection Error: ${docJson.message}`);
          }
        } else {
          console.log(`✅ Profile document created in collection '${user.collection}'.`);
        }
      } catch (err) {
        console.error(`❌ Error creating profile document:`, err.message);
      }
    }
  }

  console.log("\n🎉 Seeding completed successfully!");
}

seed();
