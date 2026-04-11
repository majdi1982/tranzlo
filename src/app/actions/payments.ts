'use server';

import { createSessionClient } from '@/lib/server/appwrite';
import { triggerN8NWorkflow } from '@/lib/server/n8n';
import { ID, Query } from 'node-appwrite';
import { redirect } from 'next/navigation';

/**
 * Verifies and activates a PayPal subscription.
 */
export async function activatePayPalSubscription(subscriptionId: string) {
  try {
    const { verifyPayPalSubscription } = await import('@/lib/server/paypal-verify');
    const { createSessionClient } = await import('@/lib/server/appwrite');
    const { createNotification } = await import('./notifications');

    const subscription = await verifyPayPalSubscription(subscriptionId);
    if (!subscription || subscription.status !== 'ACTIVE') {
      return { success: false, error: 'PayPal subscription is not active' };
    }

    const { databases, account } = await createSessionClient();
    const user = await account.get();
    const dbId = '69da165d00335f7a350e';

    // 1. Determine Plan and Duration
    const planId = subscription.plan_id;
    const isYearly = planId === process.env.PAYPAL_PLAN_ID_YEARLY;
    const planName = planId === process.env.PAYPAL_PLAN_ID_MONTHLY ? 'translator_pro' : 'company_pro';
    
    // 2. Record Subscription
    await databases.createDocument(dbId, 'subscriptions', ID.unique(), {
      userId: user.$id,
      subscriptionId: subscription.id,
      plan: planName,
      provider: 'paypal',
      status: 'active',
      activatedAt: new Date().toISOString(),
      expiresAt: isYearly 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // 3. Update User Meta (isPro)
    const userMeta = await databases.listDocuments(dbId, 'users_meta', [Query.equal('userId', user.$id), Query.limit(1)]);
    if (userMeta.documents[0]) {
      await databases.updateDocument(dbId, 'users_meta', userMeta.documents[0].$id, {
        isPro: true,
        proPlan: planName
      });
    }

    // 4. Notifications
    await createNotification(
      user.$id,
      'Subscription Active!',
      'Your PayPal subscription is active. Welcome to Pro!',
      'payment',
      '/dashboard'
    );

    // 5. Notify via n8n
    await triggerN8NWorkflow('payment-success', {
      userId: user.$id,
      userEmail: user.email,
      subscriptionId: subscription.id,
      plan: planName,
      provider: 'paypal'
    });

    return { success: true };
  } catch (error: any) {
    console.error('PayPal activation error:', error);
    return { success: false, error: 'Failed to activate PayPal subscription' };
  }
}
