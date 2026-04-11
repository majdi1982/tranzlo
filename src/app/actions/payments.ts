'use server';

import { createSubscriptionCheckout, verifyPayment } from '@/lib/server/fatora';
import { createSessionClient } from '@/lib/server/appwrite';
import { triggerN8NWorkflow } from '@/lib/server/n8n';
import { ID } from 'node-appwrite';
import { redirect } from 'next/navigation';

/**
 * Initiates a Fatora checkout for a Pro subscription.
 * Uses redirect() internally — satisfies React's void form action type.
 */
export async function initiateSubscription(formData: FormData): Promise<void> {
  const plan = formData.get('plan') as 'translator_pro' | 'company_pro';

  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const orderId = `${user.$id}-${plan}-${Date.now()}`;

    const checkoutUrl = await createSubscriptionCheckout({
      orderId,
      plan,
      userEmail: user.email,
      userName: user.name,
    });

    redirect(checkoutUrl);
  } catch (error: any) {
    // redirect() throws internally — let it propagate
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Fatora checkout error:', error);
    redirect('/payment/failure');
  }
}

/**
 * Called from the /payment/success page to confirm and record the payment.
 * Verifies the order with Fatora, then writes a subscription record in Appwrite.
 */
export async function confirmPayment(orderId: string) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    // Verify with Fatora
    const verification = await verifyPayment(orderId);

    if (verification.payment_status !== 'CAPTURED') {
      return { success: false, error: `Payment status: ${verification.payment_status}` };
    }

    const dbId = process.env.APPWRITE_DATABASE_ID!;

    // Store subscription record
    await databases.createDocument(dbId, 'subscriptions', ID.unique(), {
      userId: user.$id,
      orderId,
      plan: orderId.includes('translator_pro') ? 'translator_pro' : 'company_pro',
      amount: verification.amount,
      currency: verification.currency,
      status: 'active',
      activatedAt: new Date().toISOString(),
    });

    // Create In-App Notification
    const { createNotification } = await import('./notifications');
    await createNotification({
      userId: user.$id,
      title: 'Payment Successful',
      message: `Your ${orderId.includes('translator_pro') ? 'Translator Pro' : 'Company Pro'} subscription is now active!`,
      type: 'payment',
      link: '/dashboard'
    });

    // Notify via n8n
    await triggerN8NWorkflow('payment-success', {
      userId: user.$id,
      userEmail: user.email,
      orderId,
      plan: orderId.includes('translator_pro') ? 'Translator Pro' : 'Company Pro',
    });

    return { success: true };
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return { success: false, error: 'Failed to confirm payment' };
  }
}
