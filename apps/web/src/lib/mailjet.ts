import { sendTransactionalEmail } from '@footwear/shared';
import { raqiContact } from './raqi-contact';

type PasswordResetEmail = {
  to: string;
  resetUrl: string;
};

function requiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required to send email.`);
  return value;
}

function requiredEnvironmentValueFrom(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  throw new Error(`${names.join(' or ')} is required to send email.`);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendPasswordResetEmail({ to, resetUrl }: PasswordResetEmail) {
  const apiKey = requiredEnvironmentValue('MAILJET_API_KEY');
  const secretKey = requiredEnvironmentValue('MAILJET_SECRET_KEY');
  const fromEmail = requiredEnvironmentValueFrom('MAILJET_FROM_EMAIL', 'MAIL_FROM_EMAIL');
  const fromName = process.env.MAILJET_FROM_NAME?.trim() || process.env.MAIL_FROM_NAME?.trim() || 'RAQI';
  const safeResetUrl = escapeHtml(resetUrl);

  await sendTransactionalEmail(
    { apiKey, secretKey, fromEmail, fromName },
    { to, subject: 'Reset your RAQI password', text: `Reset your password\n\nWe received a request to reset the password for your RAQI account.\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can ignore this email.\n\nRAQI\n${raqiContact.email}\nInstagram: ${raqiContact.instagramUrl}\nFacebook: ${raqiContact.facebookUrl}`, html: `<div style="font-family:Arial,sans-serif;color:#171717;line-height:1.6;max-width:560px"><p style="font-size:20px;font-weight:700;letter-spacing:.12em">RAQI</p><h1 style="font-size:24px">Reset your password</h1><p>We received a request to reset the password for your RAQI account.</p><p style="margin:28px 0"><a href="${safeResetUrl}" style="background:#171717;color:#fff;padding:12px 20px;text-decoration:none">Reset password</a></p><p>This link expires in 1 hour.</p><p>If you didn't request this, you can ignore this email.</p><div style="border-top:1px solid #ddd;margin-top:32px;padding-top:18px;font-size:13px;color:#666"><strong style="color:#171717">RAQI</strong><br><a href="mailto:${raqiContact.email}" style="color:#666">${raqiContact.email}</a><br><a href="${raqiContact.instagramUrl}" style="color:#666">Instagram</a> | <a href="${raqiContact.facebookUrl}" style="color:#666">Facebook</a></div></div>` },
  );
}
