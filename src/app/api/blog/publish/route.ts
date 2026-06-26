import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account, Databases } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite-config";

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    // 1. Authenticate the user calling this API
    const userClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      userClient.setJWT(authHeader.substring(7));
    } else {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(`a_session_${appwriteConfig.projectId}`) || cookieStore.get(`a_session_${appwriteConfig.projectId.toLowerCase()}`);
      if (sessionCookie) userClient.setSession(sessionCookie.value);
    }

    const account = new Account(userClient);
    let user;
    try {
      user = await account.get();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user is an admin
    if (user.prefs?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 2. Initialize Admin SDK to update database and share post
    const adminClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(appwriteConfig.apiKey);

    const databases = new Databases(adminClient);

    // 3. Update status in Database
    const post = await databases.updateDocument(dbId, "blog_posts", postId, {
      status: "published",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`[Publish API] Status updated to published for post: ${post.title}`);

    // 4. Trigger Social Sharing
    const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://tranzlo.net"}/blog/${post.slug}`;
    const plainExcerpt = (post.excerpt || post.content || "").replace(/<[^>]*>/g, "").slice(0, 200);
    const hashtags = "#translation #localization #freelance";
    const shared = [];

    // Facebook sharing
    const fbPageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (fbPageToken) {
      try {
        console.log("[Publish API] Attempting to share to Facebook...");
        const fbRes = await fetch("https://graph.facebook.com/v19.0/me/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `${post.title}\n\n${plainExcerpt}`,
            link: postUrl,
            access_token: fbPageToken,
          }),
        });
        const fbData = await fbRes.json();
        if (fbRes.ok) {
          shared.push("facebook");
          console.log("[Publish API] Shared to Facebook:", fbData);
        } else {
          console.error("[Publish API] Facebook sharing failed:", fbData);
        }
      } catch (e: any) {
        console.error("[Publish API] Facebook sharing exception:", e.message);
      }
    } else {
      console.log("[Publish API] Facebook token not configured");
    }

    // LinkedIn sharing
    const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
    if (linkedinToken) {
      try {
        console.log("[Publish API] Attempting to share to LinkedIn...");
        const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${linkedinToken}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
          const author = orgId ? `urn:li:organization:${orgId}` : `urn:li:person:${profile.sub}`;
          const liRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
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
          const liData = await liRes.json();
          if (liRes.ok) {
            shared.push("linkedin");
            console.log("[Publish API] Shared to LinkedIn:", liData);
          } else {
            console.error("[Publish API] LinkedIn sharing failed:", liData);
          }
        } else {
          console.error("[Publish API] Failed to fetch LinkedIn profile:", await profileRes.text());
        }
      } catch (e: any) {
        console.error("[Publish API] LinkedIn sharing exception:", e.message);
      }
    } else {
      console.log("[Publish API] LinkedIn token not configured");
    }

    return NextResponse.json({ success: true, post, shared });
  } catch (err: any) {
    console.error("[Publish API] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
