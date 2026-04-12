import { NextRequest, NextResponse } from 'next/server';
import { activatePayPalSubscription } from '@/app/actions/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('PayPal Webhook Received:', body.event_type);

    // We primarily care about subscription activation
    if (body.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionId = body.resource.id;
      console.log('Activating subscription via webhook:', subscriptionId);
      
      const result = await activatePayPalSubscription(subscriptionId);
      if (result.success) {
        return NextResponse.json({ processed: true });
      } else {
        console.error('Webhook activation failed:', result.error);
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    // Acknowledge other events but do nothing for now
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('PayPal Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
