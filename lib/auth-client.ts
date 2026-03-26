import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { auth } from './auth';
import { adminClient, twoFactorClient } from 'better-auth/client/plugins';
  
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient(),
    adminClient(), 
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
