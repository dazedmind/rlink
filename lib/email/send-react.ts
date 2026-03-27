import { Resend } from "resend";
import type { ReactElement } from "react";
import { getDefaultFrom } from "./config";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export type SendReactResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

/**
 * Low-level send using the same Resend + `from` configuration as welcome / account emails.
 */
export async function sendReactEmail(options: {
  to: string | string[];
  subject: string;
  react: ReactElement;
}): Promise<SendReactResult> {
  const client = getResend();
  if (!client) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  const { data, error } = await client.emails.send({
    from: getDefaultFrom(),
    to: options.to,
    subject: options.subject,
    react: options.react,
  });

  if (error) {
    return { ok: false, error: String(error) };
  }
  return { ok: true, id: data?.id };
}
