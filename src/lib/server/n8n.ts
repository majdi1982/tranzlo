export async function triggerN8NWorkflow(webhookId: string, payload: any) {
  // Typical n8n webhook URL format: https://<your-n8n-domain>/webhook/<id>
  // In a local dev environment, it might be http://localhost:5678/webhook-test/<id>
  // We use N8N_API_KEY as Bearer if required by webhook Auth.

  const baseUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
  const url = `${baseUrl}/${webhookId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.N8N_API_KEY}`, // Enable if webhook is protected
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[n8n] Error triggering workflow:', error);
    // Suppress throw to avoid killing app runtime over webhook failure
    return { success: false, error: 'Failed to trigger automation' };
  }
}
