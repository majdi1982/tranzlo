import { NextResponse } from "next/server";

const LISTMONK_URL = "http://tranzlo-listmonk:9000/api";
const AUTH_B64 = "YWRtaW46dHJhbnpsbzIwMjQ="; // Basic auth token for admin:tranzlo2024
const LIST_ID = 3;

export async function POST(req: Request) {
  try {
    const { email, name, role } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const payload = {
      email,
      name: name || email.split("@")[0],
      status: "confirmed",
      lists: [LIST_ID],
      attribs: {
        role: role || "user",
      },
    };

    console.log(`Subscribing ${email} to Listmonk...`);
    const response = await fetch(`${LISTMONK_URL}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_B64}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Listmonk API error:", errText);
      
      // If user already exists, Listmonk might return 409 or similar.
      // We can try to update/subscribe them or ignore since they're already registered.
      if (response.status === 409 || errText.includes("already exists")) {
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      
      return NextResponse.json({ error: "Failed to subscribe to mailing list" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Mailing list subscription failed:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
