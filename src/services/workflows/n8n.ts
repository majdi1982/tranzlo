"use server";

export async function triggerWorkflow(event: string, data: any) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!webhookUrl) throw new Error("n8n webhook URL not configured");

  const response = await fetch(`${webhookUrl}${event}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": apiKey || "",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`n8n workflow failed: ${response.statusText}`);
  }

  return response.json();
}
