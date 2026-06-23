// Appwrite Function: Social Media Publisher
// Language: Node.js (v18+)
// Called via HTTP trigger when a blog post is published.
// POST body: { postId: string }

const { Client, Databases } = require("node-appwrite");

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

  let postId;
  try {
    const body = JSON.parse(req.body || "{}");
    postId = body.postId;
  } catch {
    return res.json({ success: false, error: "Invalid JSON body" }, 400);
  }

  if (!postId) {
    return res.json({ success: false, error: "Missing postId" }, 400);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  try {
    const post = await db.getDocument(databaseId, "blog_posts", postId);
    if (!post || post.status !== "published") {
      return res.json({ success: false, error: "Post not found or not published" }, 404);
    }

    const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://tranzlo.net"}/blog/${post.slug}`;
    const plainExcerpt = (post.excerpt || post.content || "").replace(/<[^>]*>/g, "").slice(0, 200);
    const hashtags = "#translation #localization #freelance";
    const shared = [];

    // X / Twitter
    const twitterBearer = process.env.TWITTER_BEARER_TOKEN;
    if (twitterBearer) {
      try {
        const tweetText = `${post.title}\n\n${plainExcerpt.slice(0, 200)}\n\n${postUrl} ${hashtags}`;
        await fetch("https://api.twitter.com/2/tweets", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${twitterBearer}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: tweetText.slice(0, 280) }),
        });
        shared.push("twitter");
        log("Shared to X/Twitter");
      } catch (e) {
        error(`Twitter failed: ${e.message}`);
      }
    }

    // Facebook
    const fbPageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (fbPageToken) {
      try {
        await fetch(`https://graph.facebook.com/v19.0/me/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `${post.title}\n\n${plainExcerpt}`,
            link: postUrl,
            access_token: fbPageToken,
          }),
        });
        shared.push("facebook");
        log("Shared to Facebook");
      } catch (e) {
        error(`Facebook failed: ${e.message}`);
      }
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
          const author = `urn:li:person:${profile.sub}`;
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
                  shareCommentary: { text: `${post.title}\n\n${plainExcerpt}` },
                  shareMediaCategory: "ARTICLE",
                  media: [{ status: "READY", originalUrl: postUrl }],
                },
              },
              visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
            }),
          });
          shared.push("linkedin");
          log("Shared to LinkedIn");
        }
      } catch (e) {
        error(`LinkedIn failed: ${e.message}`);
      }
    }

    log(`Done. Shared to: ${shared.join(", ") || "none"}`);
    return res.json({ success: true, postId, shared });
  } catch (e) {
    error(`Failed: ${e.message}`);
    return res.json({ success: false, error: e.message }, 500);
  }
};
