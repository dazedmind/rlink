import { WelcomeTemplate } from '../../../components/email/welcome-template';
import { Resend } from 'resend';
import { rateLimit, rateLimit429 } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const limitResult = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!limitResult.success) return rateLimit429(limitResult, 30);

  try {
    const { email, firstName, lastName, password } = await request.json();
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }
    const { data, error } = await resend.emails.send({
      from: 'R Land Development Inc. <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to R Land Development Inc.',
        react: WelcomeTemplate({ email: email, firstName: firstName, lastName: lastName, password: password }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}