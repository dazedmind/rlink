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
  render,
} from "@react-email/components";
import * as React from "react";

interface EmailTemplateProps {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export const WelcomeTemplate = ({
  email,
  firstName,
  lastName,
  password,
}: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Welcome to R Land, {firstName}! Your account is ready.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
            {/* Replace with your actual logo URL */}
            <Img
              src="https://your-domain.com/logo.png"
              width="120"
              height="40"
              alt="R Land Logo"
              style={logo}
            />
        </Section>
        
        <Heading style={h1}>Welcome aboard, {firstName}!</Heading>
        
        <Text style={text}>
          We're excited to have you with us. Your account has been successfully 
          created. You can now sign in to the portal using the credentials below:
        </Text>

        <Section style={credentialBox}>
          <Text style={credentialText}>
            <strong>Email:</strong> {email}
          </Text>
          <Text style={credentialText}>
            <strong>Temporary Password:</strong> <code style={codeStyle}>{password}</code>
          </Text>
        </Section>

        <Section style={btnContainer}>
          <Link
            style={button}
            href="https://your-portal-link.com/login"
          >
            Sign In to Your Account
          </Link>
        </Section>

        <Text style={securityNotice}>
          <strong>Security Tip:</strong> For your protection, you will be 
          prompted to change this temporary password immediately after your first login.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          If you didn't request this account, please ignore this email or 
          contact our support team.
          <br />
          © 2026 R Land Development Inc. | Manila, Philippines
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeTemplate;

// --- STYLING ---

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "8px",
  border: "1px solid #e6ebf1",
};

const headerSection = {
  paddingBottom: "20px",
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left" as const,
};

const credentialBox = {
  backgroundColor: "#f4f4f4",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const credentialText = {
  margin: "0",
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
};

const codeStyle = {
  backgroundColor: "#e0e0e0",
  padding: "2px 6px",
  borderRadius: "4px",
  fontFamily: "monospace",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#000000", // Change this to your Brand Primary Color
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const securityNotice = {
  fontSize: "14px",
  color: "#666",
  fontStyle: "italic",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};