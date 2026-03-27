import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export type ForgotPasswordEmailProps = {
  email: string;
  displayName: string;
  resetUrl: string;
};

export function ForgotPasswordEmail({
  displayName,
  resetUrl,
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your R Link password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://i.imgur.com/TL2367q.png"
            width="120"
            height="60"
            alt="R Land Logo"
            className="mb-4"
          />
          <Heading style={h1}>Password reset</Heading>
          <Text style={text}>Hi {displayName},</Text>
          <Text style={text}>
            We received a request to reset your password for your R Link employee account. Click
            the button below to choose a new password. This link expires after a short time.
          </Text>
          <Section style={btnContainer}>
            <Link style={button} href={resetUrl}>
              Reset password
            </Link>
          </Section>
          <Text style={muted}>
            If you didn&apos;t request this, you can ignore this email. Your password will stay the
            same.
          </Text>
          <Text style={muted}>
            <strong>Security:</strong> After signing in, consider changing your password again from
            settings if you use a shared device.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© 2026 R Land Development Inc. | Quezon City, Philippines</Text>
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
  padding: "40px 24px",
  borderRadius: "8px",
  border: "1px solid #e6ebf1",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const text = {
  color: "#4a4a4a",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 12px",
};

const muted = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 12px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "28px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  padding: "12px 28px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  textAlign: "center" as const,
};
