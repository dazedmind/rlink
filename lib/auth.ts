import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
    },
  },
  user: {
    additionalFields: {
      firstName:  { type: "string", required: false, defaultValue: "" },
      lastName:   { type: "string", required: false, defaultValue: "" },
      middleName: { type: "string", required: false, defaultValue: "" },
      phone:      { type: "string", required: false, defaultValue: "" },
      position:   { type: "string", required: false, defaultValue: "" },
      department: { type: "string", required: false, defaultValue: "" },
      employeeId: { type: "string", required: false, defaultValue: "" },
      birthdate:  { type: "string", required: false, defaultValue: null },
    },
  },
});
