'use server';

import { createAdminClient, createSessionClient } from '@/lib/server/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ID } from 'node-appwrite';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set('tranzlo-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Determine redirect based on user role (will be fetched from DB in next steps)
    // For now, redirect to global dashboard
    redirect('/dashboard');
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Login error', error);
    return { error: 'Invalid email or password.' };
  }
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const plan = formData.get('plan') as string || 'free';

  const DB_ID = '69da165d00335f7a350e';
  const USERS_META_ID = 'users_meta';

  try {
    const { users, account } = await createAdminClient();
    
    // Log configuration for debugging (don't log full key)
    console.log('--- SIGNUP ATTEMPT ---');
    console.log('Target Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('Target Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    const user = await users.create(ID.unique(), email, undefined, password, name);

    // Assign role label
    const label = role === 'company' ? 'company' : 'translator';
    await users.updateLabels(user.$id, [label]);

    // Create users_meta record
    const { databases } = await createAdminClient();
    await databases.createDocument(DB_ID, USERS_META_ID, user.$id, {
      userId: user.$id,
      role: label,
      plan: plan,
      agreedToTerms: true, // Captured at form level
      profileCompletion: 0.1, // Basic completion
      lastLogin: new Date().toISOString()
    });

    // Create role-specific profile document
    if (label === 'translator') {
      await databases.createDocument(DB_ID, 'translators', user.$id, {
        userId: user.$id,
        isVerified: false,
        rating: 0,
        totalJobs: 0
      });
    } else if (label === 'company') {
      await databases.createDocument(DB_ID, 'companies', user.$id, {
        userId: user.$id,
        companyName: name, // Default to user's name
        isVerified: false
      });
    }
    
    console.log(`✅ Account, V4 Meta, and ${label} profile created for ${email}`);

    // Auto-login (Create session for user)
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set('tranzlo-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, 
    });

    redirect('/dashboard');
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Signup error details:', error);
    
    // Return specific error if possible
    if (error.code === 409 || error.message?.includes('already exists')) {
      return { error: 'An account with this email already exists.' };
    }
    
    return { error: error.message || 'Failed to create account. Please check your credentials.' };
  }
}


export async function logout() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession('current');
    
    const cookieStore = await cookies();
    cookieStore.delete('tranzlo-session');
    
    redirect('/');
  } catch (error) {
    console.error('Logout error', error);
    return { error: 'Failed to logout' };
  }
}

export async function getUser() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch {
    return null;
  }
}

