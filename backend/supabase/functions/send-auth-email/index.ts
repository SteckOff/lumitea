import { sendMail } from '../_shared/mailer.ts';

const PINK = '#e91e63';
const FOOTER = `
<tr><td style="background:#f7f7f7;padding:24px 32px;border-top:1px solid #eee;border-radius:0 0 16px 16px;">
  <p style="color:#aaa;font-size:11px;text-align:center;margin:0 0 6px;line-height:1.7;">
    &copy; 2026 Lumi Tea &middot; Incheon Yeonsu-gu Hambak-ro 12beon-gil 14, Republic of Korea<br>
    lumitea.kr@gmail.com &middot; +82 10 2187 3643
  </p>
  <p style="color:#ccc;font-size:11px;text-align:center;margin:0;">
    <a href="https://lumitea.vercel.app" style="color:${PINK};text-decoration:none;">lumitea.vercel.app</a>
    &nbsp;&middot;&nbsp;
    <a href="mailto:lumitea.kr@gmail.com?subject=Unsubscribe" style="color:${PINK};text-decoration:none;">Unsubscribe</a>
  </p>
</td></tr>`;

const HEADER = `
<tr><td style="background:${PINK};padding:36px;text-align:center;border-radius:16px 16px 0 0;">
  <img src="https://lumitea.vercel.app/logo.png" width="60" height="60"
       style="border-radius:50%;background:#fff;padding:6px;margin-bottom:12px;" />
  <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Lumi Tea</h1>
  <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:12px;letter-spacing:2px;">PREMIUM KOREAN TEA</p>
</td></tr>`;

function wrap(body: string): string {
  return `<body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0"
  style="background:#fff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
${HEADER}${body}${FOOTER}
</table></td></tr></table></body>`;
}

function confirmationHtml(token: string, confirmUrl: string): string {
  return wrap(`
<tr><td style="padding:40px 36px 32px;">
  <h2 style="color:#111;margin:0 0 12px;font-size:20px;font-weight:700;">Confirm your email address</h2>
  <p style="color:#555;margin:0 0 28px;font-size:14px;line-height:1.7;">
    Welcome to <strong>Lumi Tea</strong>! Enter the verification code below,
    or click the button to activate your account.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr><td style="background:#fce4ec;border-radius:12px;padding:28px;text-align:center;">
      <p style="color:#ad1457;margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Verification Code</p>
      <p style="color:${PINK};margin:0;font-size:44px;font-weight:700;letter-spacing:10px;font-family:'Courier New',Courier,monospace;">${token}</p>
      <p style="color:#c2185b;margin:10px 0 0;font-size:11px;">&#128337; Valid for 60 minutes &nbsp;&middot;&nbsp; Do not share this code</p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr><td align="center">
      <a href="${confirmUrl}"
         style="background:${PINK};color:#fff;text-decoration:none;padding:15px 44px;
                border-radius:50px;font-size:15px;font-weight:700;display:inline-block;">
        Confirm Email &rarr;
      </a>
    </td></tr>
  </table>
  <p style="color:#bbb;font-size:11px;text-align:center;line-height:1.6;">
    If you did not create a Lumi Tea account, please ignore this email.
  </p>
</td></tr>`);
}

function recoveryHtml(token: string, confirmUrl: string, email: string): string {
  return wrap(`
<tr><td style="padding:40px 36px 32px;">
  <h2 style="color:#111;margin:0 0 12px;font-size:20px;font-weight:700;">Reset your password</h2>
  <p style="color:#555;margin:0 0 28px;font-size:14px;line-height:1.7;">
    We received a request to reset the password for <strong>${email}</strong>.<br>
    Click the button below to choose a new password.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr><td align="center">
      <a href="${confirmUrl}"
         style="background:${PINK};color:#fff;text-decoration:none;padding:15px 44px;
                border-radius:50px;font-size:15px;font-weight:700;display:inline-block;">
        Reset Password &rarr;
      </a>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td style="background:#fff8e1;border-left:4px solid #ffc107;border-radius:8px;padding:14px 18px;">
      <p style="color:#795548;margin:0;font-size:12px;line-height:1.6;">
        &#9888; This link expires in <strong>60 minutes</strong>.
        If you did not request a reset, your account remains secure — ignore this email.
      </p>
    </td></tr>
  </table>
  <p style="color:#bbb;font-size:11px;text-align:center;line-height:1.6;">
    Button not working? Copy this URL into your browser:<br>
    <a href="${confirmUrl}" style="color:${PINK};word-break:break-all;font-size:10px;">${confirmUrl}</a>
  </p>
</td></tr>`);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: {
    user: { email: string };
    email_data: {
      token: string;
      token_hash: string;
      redirect_to: string;
      email_action_type: string;
      site_url: string;
    };
  };

  try {
    payload = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const { user, email_data } = payload;
  const { token, token_hash, redirect_to, email_action_type, site_url } = email_data;

  // Build confirmation URL (same as Supabase default)
  const baseUrl = site_url || 'https://lumitea.vercel.app';
  const confirmUrl = token_hash
    ? `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || baseUrl)}`
    : redirect_to || baseUrl;

  let subject: string;
  let html: string;

  switch (email_action_type) {
    case 'signup':
    case 'email_change':
      subject = 'Lumi Tea — Confirm your email address';
      html = confirmationHtml(token, confirmUrl);
      break;
    case 'recovery':
      subject = 'Lumi Tea — Reset your password';
      html = recoveryHtml(token, confirmUrl, user.email);
      break;
    case 'magiclink':
      subject = 'Lumi Tea — Your sign-in link';
      html = recoveryHtml(token, confirmUrl, user.email);
      break;
    default:
      subject = 'Lumi Tea — Verification';
      html = confirmationHtml(token, confirmUrl);
  }

  const result = await sendMail({
    to: user.email,
    subject,
    html,
  });

  if (!result.ok) {
    console.error('Mail error:', result.error);
    return new Response(JSON.stringify({ error: result.error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
