import { db } from "@/lib/db";
import { campaigns, newsletter } from "@/db/schema";
import { eq } from "drizzle-orm";
import { renderMarkdown } from "@/app/utils/markdown";
import { sendTemplatedEmail } from "./mailer";

/**
 * Sends the campaign email to every subscribed newsletter address.
 */
export async function deliverCampaignToSubscribers(
  campaignId: number
): Promise<{ sent: number; failed: number }> {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId));

  if (!campaign) {
    return { sent: 0, failed: 0 };
  }

  const subs = await db
    .select({ email: newsletter.email })
    .from(newsletter)
    .where(eq(newsletter.status, "subscribed"));

  const htmlBody = renderMarkdown(campaign.body);

  let sent = 0;
  let failed = 0;

  for (const { email } of subs) {
    const result = await sendTemplatedEmail(email, {
      template: "newsletter-campaign",
      data: {
        campaignName: campaign.name,
        subject: campaign.subject,
        previewLine: campaign.previewLine,
        htmlBody,
      },
    });
    if (result.ok) sent++;
    else failed++;
  }

  return { sent, failed };
}
