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

  try {
    const { users, account } = await createAdminClient();
    
    // Create Appwrite Auth User via Admin Users API (more reliable from server)
    const user = await users.create(ID.unique(), email, undefined, password, name);

    // Assign role label
    const label = role === 'company' ? 'company' : 'translator';
    await users.updateLabels(user.$id, [label]);
    
    console.log(`✅ Account created for ${email} with role ${label}`);

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

