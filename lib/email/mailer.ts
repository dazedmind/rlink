import type { ReactElement } from "react";
import { WelcomeEmail } from "@/templates/email/welcome";
import { NewsletterCampaignEmail } from "@/templates/email/newsletter-campaign";
import { ForgotPasswordEmail } from "@/templates/email/forgot-password";
import { getAppOrigin } from "./config";
import { sendReactEmail, type SendReactResult } from "./send-react";

export type WelcomeEmailData = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  loginUrl?: string;
};

export type NewsletterCampaignEmailData = {
  campaignName: string;
  subject: string;
  previewLine: string;
  htmlBody: string;
};

export type ForgotPasswordEmailData = {
  email: string;
  displayName: string;
  resetUrl: string;
};

export type EmailTemplateName = "welcome" | "newsletter-campaign" | "forgot-password";

type TemplatePayload =
  | { template: "welcome"; data: WelcomeEmailData }
  | { template: "newsletter-campaign"; data: NewsletterCampaignEmailData }
  | { template: "forgot-password"; data: ForgotPasswordEmailData };

function buildReactElement(
  payload: TemplatePayload
): { subject: string; react: ReactElement } {
  const origin = getAppOrigin();
  switch (payload.template) {
    case "welcome": {
      const d = payload.data;
      return {
        subject: "Welcome to R Land Development Inc.",
        react: WelcomeEmail({
          email: d.email,
          firstName: d.firstName || "there",
          lastName: d.lastName,
          password: d.password,
          loginUrl: d.loginUrl ?? `${origin}/login`,
        }),
      };
    }
    case "newsletter-campaign": {
      const d = payload.data;
      return {
        subject: d.subject,
        react: NewsletterCampaignEmail({
          heading: d.campaignName,
          previewLine: d.previewLine,
          htmlBody: d.htmlBody,
        }),
      };
    }
    case "forgot-password": {
      const d = payload.data;
      return {
        subject: "Reset your R Link password",
        react: ForgotPasswordEmail({
          email: d.email,
          displayName: d.displayName,
          resetUrl: d.resetUrl,
        }),
      };
    }
  }
}

/**
 * Central entry: template name + data, same Resend `from` as account-creation emails.
 */
export async function sendTemplatedEmail(
  to: string,
  payload: TemplatePayload
): Promise<SendReactResult> {
  const { subject, react } = buildReactElement(payload);
  return sendReactEmail({ to, subject, react });
}

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<SendReactResult> {
  return sendTemplatedEmail(to, { template: "welcome", data });
}

export async function sendForgotPasswordEmail(
  to: string,
  data: ForgotPasswordEmailData
): Promise<SendReactResult> {
  return sendTemplatedEmail(to, { template: "forgot-password", data });
}
