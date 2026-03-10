import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/db/auth-schema";
import { activityLogs } from "@/db/schema";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    admin()
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
