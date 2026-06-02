import * as fs from "fs";
import * as path from "path";

async function main() {
  const apiKey = "AIzaSyC8RMYkMybD8UNO2VcaHHJcmbqAZ_RePIg";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const flashModels = data.models.filter((m: any) => m.name.toLowerCase().includes("flash"));
    console.log("Allowed Flash Models in 2026:");
    console.log(JSON.stringify(flashModels.map((m: any) => m.name), null, 2));
  } catch (err: any) {
    console.error("Fetch failed:", err.message);
  }
}

main();
