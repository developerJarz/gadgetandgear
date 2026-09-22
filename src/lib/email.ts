import nodemailer from "nodemailer";

// ─── Brevo (Sendinblue) SMTP Transport ───
// Brevo free tier: 300 emails/day, no domain verification needed for SMTP.
// Get credentials at: https://app.brevo.com/settings/keys/smtp

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

// Sender info from environment variables
const FROM_NAME = process.env.SMTP_FROM_NAME || "Gadget & Gear BD";
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "";
const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

export async function sendOTPEmail(email: string, otp: string, name?: string) {
  const recipientName = name ? name.trim() : "Valued Customer";

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - Gadget & Gear BD</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 540px; margin: 30px auto; background: #111827; border: 1px solid #1f2937; border-radius: 24px; padding: 40px 32px; text-align: center; }
    .logo-badge { display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #ffffff; font-weight: bold; font-size: 14px; padding: 6px 16px; border-radius: 9999px; margin-bottom: 20px; letter-spacing: 0.05em; }
    h1 { font-size: 24px; font-weight: 800; margin: 0 0 10px; color: #f9fafb; }
    p { font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px; }
    .otp-box { background: #1e293b; border: 2px dashed #38bdf8; border-radius: 16px; padding: 20px; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; }
    .expire-note { font-size: 12px; color: #64748b; margin-top: 8px; }
    .footer { font-size: 11px; color: #6b7280; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-badge">GADGET &amp; GEAR BD</div>
    <h1>Verify Your Account</h1>
    <p>Hi <strong>${recipientName}</strong>,<br>Thank you for signing up with Gadget &amp; Gear BD. Please use the verification code below to complete your registration:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="expire-note">This code will expire in <strong>10 minutes</strong>.</div>
    </div>
    
    <p>If you did not request this verification code, you can safely ignore this email.</p>
    
    <div class="footer">
      &copy; ${new Date().getFullYear()} Gadget &amp; Gear BD. Bangladesh's premier tech store.<br>
      Dhaka, Bangladesh
    </div>
  </div>
</body>
</html>
  `;

  try {
    console.log(`[Email] Sending OTP to ${email} via Brevo SMTP...`);

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: `${otp} is your Gadget & Gear BD verification code`,
      html: emailHtml,
    });

    console.log(`[Email] ✅ OTP sent successfully! MessageId: ${info.messageId}`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error("[Email] ❌ Brevo SMTP send error:", error.message || error);
    return { success: false, error: error.message };
  }
}
