// Shared SMTP helper for all Edge Functions.
// Ensures emails always go out with a proper display name (e.g. "Lumi Tea
// <lumitea.kr@gmail.com>") rather than a bare gmail address — without this,
// recipients see the message as if it came from a personal inbox.
//
// Env: SMTP_HOST, SMTP_PORT (default 465), SMTP_USER, SMTP_PASS,
//      MAIL_FROM (optional override), MAIL_FROM_NAME (default "Lumi Tea").

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export interface MailerResult {
  ok: boolean;
  reason?: string;
}

function buildFromHeader(): string | null {
  const user = Deno.env.get('SMTP_USER');
  const explicit = Deno.env.get('MAIL_FROM');
  if (explicit && /</.test(explicit)) return explicit; // already has display name
  const address = explicit ?? user;
  if (!address) return null;
  const name = Deno.env.get('MAIL_FROM_NAME') ?? 'Lumi Tea';
  return `${name} <${address}>`;
}

export async function sendMail(opts: MailOptions): Promise<MailerResult> {
  const host = Deno.env.get('SMTP_HOST');
  const port = Number(Deno.env.get('SMTP_PORT') ?? '465');
  const user = Deno.env.get('SMTP_USER');
  const pass = Deno.env.get('SMTP_PASS');
  const from = buildFromHeader();

  if (!host || !user || !pass || !from) {
    console.warn('SMTP not configured — skipping email', { to: opts.to });
    return { ok: false, reason: 'smtp_not_configured' };
  }

  try {
    const { SMTPClient } = await import('npm:emailjs@4');
    const client = new SMTPClient({
      user,
      password: pass,
      host,
      port,
      ssl: port === 465,
      tls: port !== 465,
    });

    const msg: Record<string, unknown> = {
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    };
    if (opts.replyTo) msg['reply-to'] = opts.replyTo;
    if (opts.html) msg.attachment = [{ data: opts.html, alternative: true }];

    await client.sendAsync(msg as never);
    return { ok: true };
  } catch (e) {
    console.error('smtp_send_failed', e);
    return { ok: false, reason: (e as Error).message };
  }
}
