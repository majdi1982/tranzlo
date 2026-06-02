import * as fs from "fs";
import * as path from "path";

async function main() {
  const apiKey = "AIzaSyC8RMYkMybD8UNO2VcaHHJcmbqAZ_RePIg";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log("Fetching available Gemini models for this API key...");
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Error: HTTP ${res.status}`, await res.text());
      return;
    }
    const data = await res.json();
    console.log("SUCCESS! Available models:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Fetch failed:", err.message);
  }
}

main();
