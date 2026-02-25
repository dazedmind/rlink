import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from './auth';
  
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signOut, signUp, useSession } = authClient;

export const signInWithGoogle = async () => {
  await authClient.signIn.social({ provider: 'google' });
};

export const setPassword = async (password: string) => {
  const { error } = await authClient.changePassword({
    newPassword: password,
    currentPassword: '',
    revokeOtherSessions: false,
  });
  if (error) throw new Error(error.message ?? 'Failed to set password');
  return true;
};
