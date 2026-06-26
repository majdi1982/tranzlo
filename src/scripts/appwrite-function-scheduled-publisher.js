// Appwrite Function: Scheduled Post Publisher
// Language: Node.js (v18+)
// CRON: Every 10 minutes
//
// Checks for blog posts with status "scheduled" and scheduledAt <= now,
// publishes them, and triggers social sharing.

const { Client, Databases, Query } = require("node-appwrite");

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

async function shareToSocial(post, log, error) {
  const { title, slug, content, excerpt } = post;
  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://tranzlo.net"}/blog/${slug}`;

  // Strip HTML for social posts
  const plainExcerpt = (excerpt || content || "").replace(/<[^>]*>/g, "").slice(0, 200);
  const hashtags = "#translation #localization #freelance";

  // X / Twitter
  const twitterBearer = process.env.TWITTER_BEARER_TOKEN;
  if (twitterBearer) {
    try {
      const tweetText = `${title}\n\n${plainExcerpt.slice(0, 200)}\n\n${postUrl} ${hashtags}`;
      await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${twitterBearer}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tweetText.slice(0, 280) }),
      });
      log(`   ✅ Shared to X/Twitter`);
    } catch (e) {
      error(`   ❌ X/Twitter share failed: ${e.message}`);
    }
  } else {
    log("   ⏭️ Twitter: No bearer token configured");
  }

  // Facebook
  const fbPageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (fbPageToken) {
    try {
      await fetch(`https://graph.facebook.com/v19.0/me/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${title}\n\n${plainExcerpt}`,
          link: postUrl,
          access_token: fbPageToken,
        }),
      });
      log(`   ✅ Shared to Facebook`);
    } catch (e) {
      error(`   ❌ Facebook share failed: ${e.message}`);
    }
  } else {
    log("   ⏭️ Facebook: No page access token configured");
  }

  // LinkedIn
  const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (linkedinToken) {
    try {
      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${linkedinToken}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
        const author = orgId ? `urn:li:organization:${orgId}` : `urn:li:person:${profile.sub}`;
        await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${linkedinToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            author,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: `${title}\n\n${plainExcerpt}` },
                shareMediaCategory: "ARTICLE",
                media: [{ status: "READY", originalUrl: postUrl }],
              },
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
          }),
        });
        log(`   ✅ Shared to LinkedIn`);
      }
    } catch (e) {
      error(`   ❌ LinkedIn share failed: ${e.message}`);
    }
  } else {
    log("   ⏭️ LinkedIn: No access token configured");
  }
}

module.exports = async function (context) {
  const { req, res, log, error } = context;

  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

  if (!endpoint || !projectId || !apiKey) {
    error("Missing Appwrite environment variables");
    return res.json({ success: false, error: "Missing env vars" }, 500);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  log("🔍 Checking for scheduled posts...");

  try {
    const now = new Date().toISOString();
    const result = await db.listDocuments(databaseId, "blog_posts", [
      Query.equal("status", "scheduled"),
      Query.lessThanEqual("scheduledAt", now),
      Query.limit(50),
    ]);

    log(`   Found ${result.documents.length} posts ready to publish.`);

    const published = [];

    for (const post of result.documents) {
      try {
        const updatedAt = new Date().toISOString();
        await db.updateDocument(databaseId, "blog_posts", post.$id, {
          status: "published",
          publishedAt: now,
          updatedAt,
        });

        log(`   ✅ Published: "${post.title}" (${post.slug})`);

        // Share to social media
        log(`   📢 Sharing to social media...`);
        await shareToSocial(post, log, error);

        published.push({ id: post.$id, title: post.title, slug: post.slug });
      } catch (e) {
        error(`   ❌ Failed to publish post ${post.$id}: ${e.message}`);
      }
    }

    log(`🏁 Done. Published ${published.length} posts.`);
    return res.json({
      success: true,
      publishedCount: published.length,
      published,
    });
  } catch (e) {
    error(`❌ Query failed: ${e.message}`);
    return res.json({ success: false, error: e.message }, 500);
  }
};
