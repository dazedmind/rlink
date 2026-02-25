import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { auth } from './auth';
  
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signOut, signUp, useSession } = authClient;

export const signInWithGoogle = async () => {
  const { error } = await authClient.signIn.social({ provider: 'google' });
  if (error) {
    throw new Error(error.message ?? "Failed to sign in with Google");
  }
};
