import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export type NewsletterCampaignEmailProps = {
  heading: string;
  previewLine: string;
  /** Pre-rendered HTML from campaign body (markdown → HTML). */
  htmlBody: string;
};

export function NewsletterCampaignEmail({
  heading,
  previewLine,
  htmlBody,
}: NewsletterCampaignEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewLine || heading}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://i.imgur.com/TL2367q.png"
            width="120"
            height="60"
            alt="R Land Logo"
            className="mb-4"
          />
          <Heading style={h1}>{heading}</Heading>
          <Section style={bodyWrap}>
            <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            You are receiving this because you subscribed to R Land updates.
            <br />
            © 2026 R Land Development Inc.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px 24px",
  borderRadius: "8px",
  border: "1px solid #e6ebf1",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 20px",
};

const bodyWrap = {
  color: "#333",
  fontSize: "15px",
  lineHeight: "24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
};
