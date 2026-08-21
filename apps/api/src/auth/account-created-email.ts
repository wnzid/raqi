import { sendTransactionalEmail } from '@footwear/shared';

type AccountCreatedEmail = { to: string; name: string; role?: string; resetUrl: string };

const required = (...names: string[]) => {
  for (const name of names) { const value = process.env[name]?.trim(); if (value) return value; }
  throw new Error(`${names.join(' or ')} is required to send email.`);
};
const escapeHtml = (value: string) => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const label = (role?: string) => role ? role.toLowerCase().split('_').map(word=>word[0]?.toUpperCase()+word.slice(1)).join(' ') : 'User';

export async function sendAccountCreatedEmail({ to, name, role, resetUrl }: AccountCreatedEmail): Promise<void> {
  const fromEmail=required('MAILJET_FROM_EMAIL','MAIL_FROM_EMAIL'),fromName=process.env.MAILJET_FROM_NAME?.trim()||process.env.MAIL_FROM_NAME?.trim()||'RAQI',roleLabel=label(role),safeName=escapeHtml(name),safeUrl=escapeHtml(resetUrl);
  await sendTransactionalEmail(
    {apiKey:required('MAILJET_API_KEY'),secretKey:required('MAILJET_SECRET_KEY'),fromEmail,fromName},
    {to,subject:'Your RAQI account has been created',text:`Hello ${name},\n\nA RAQI ${roleLabel} account has been created for ${to}.\n\nSet your password using this secure link:\n${resetUrl}\n\nThis link expires in 1 hour. If you were not expecting this account, contact RAQI.`,html:`<div style="font-family:Arial,sans-serif;color:#171717;line-height:1.6;max-width:560px"><p style="font-size:20px;font-weight:700;letter-spacing:.12em">RAQI</p><h1 style="font-size:24px">Your account has been created</h1><p>Hello ${safeName},</p><p>A RAQI <strong>${escapeHtml(roleLabel)}</strong> account has been created for <strong>${escapeHtml(to)}</strong>.</p><p style="margin:28px 0"><a href="${safeUrl}" style="background:#171717;color:#fff;padding:12px 20px;text-decoration:none">Set your password</a></p><p>This secure link expires in 1 hour.</p><p style="font-size:13px;color:#666">If you were not expecting this account, contact RAQI.</p></div>`},
  );
}
