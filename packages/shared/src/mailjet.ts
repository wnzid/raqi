export type TransactionalEmailAttachment = { contentType: string; filename: string; content: Uint8Array };
export type TransactionalEmail = { to: string; subject: string; text: string; html: string; attachments?: TransactionalEmailAttachment[] };
export type MailjetConfiguration = { apiKey: string; secretKey: string; fromEmail: string; fromName: string };

export async function sendTransactionalEmail(config: MailjetConfiguration, message: TransactionalEmail) {
  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${config.apiKey}:${config.secretKey}`)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Messages: [{ From: { Email: config.fromEmail, Name: config.fromName }, To: [{ Email: message.to }], Subject: message.subject, TextPart: message.text, HTMLPart: message.html, ...(message.attachments?.length ? { Attachments: message.attachments.map((attachment) => ({ ContentType: attachment.contentType, Filename: attachment.filename, Base64Content: bytesToBase64(attachment.content) })) } : {}) }] }),
  });
  if (!response.ok) throw new Error(`Mailjet rejected the transactional email (${response.status}).`);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}
