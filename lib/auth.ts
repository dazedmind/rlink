import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { db } from "@/lib/db";
import { user, session, account, verification, twoFactor } from "@/db/auth-schema";
import { activityLogs } from "@/db/schema";
import { admin, twoFactor as twoFactorPlugin } from "better-auth/plugins";
import { sendForgotPasswordEmail } from "@/lib/email/mailer";

export const auth = betterAuth({
  appName: "R Link",
  plugins: [
    twoFactorPlugin({ issuer: "R Link" }),
    admin(),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email" || ctx.path.startsWith("/callback")) {
        const newSession = ctx.context.newSession;
        if (newSession?.user?.id) {
          ctx.context.runInBackground(
            logActivity(newSession.user.id, "Login", ctx.headers)
          );
        }
      }
    }),
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-out") {
        const session = await getSessionFromCtx(ctx);
        if (session?.user?.id) {
          await logActivity(session.user.id, "Logout", ctx.headers);
        }
      }
    }),
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification, twoFactor },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user: u, url }) => {
      void sendForgotPasswordEmail(u.email, {
        email: u.email,
        displayName: u.name?.trim() || u.email,
        resetUrl: url,
      }).catch((e) => console.error("[sendResetPassword]", e));
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["email-password"],
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

// FOR ACTIVITY LOGS
async function logActivity(
  userId: string,
  activity: string,
  headers: Headers | undefined
) {
  const h = headers ?? new Headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const userAgent = h.get("user-agent") ?? "unknown";
  await db.insert(activityLogs).values({
    userId,
    activity,
    ipAddress: ip,
    userAgent,
  });
}
