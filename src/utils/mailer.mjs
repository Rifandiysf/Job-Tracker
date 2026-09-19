import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetPasswordEmail(to, resetUrl) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your JobFin password",
    html: resetPasswordTemplate(resetUrl),
  });
}

function resetPasswordTemplate(resetUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#05f2bf; padding:28px 32px; text-align:center;">
                            <span style="font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.02em;">JobFin</span>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px 32px 24px;">
                            <h1 style="margin:0 0 16px; font-size:20px; font-weight:600; color:#111827;">
                                Reset your password
                            </h1>
                            <p style="margin:0 0 16px; font-size:14px; line-height:22px; color:#4b5563;">
                                We received a request to reset the password for your JobFin account. Click the button below to choose a new password.
                            </p>

                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                                <tr>
                                    <td style="border-radius:8px; background-color:#05f2bf;">
                                        <a
                                            href="${resetUrl}"
                                            target="_blank"
                                            style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:8px;"
                                        >
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 16px; font-size:13px; line-height:20px; color:#6b7280;">
                                This link will expire in <strong>30 minutes</strong>. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
                            </p>

                            <p style="margin:24px 0 0; font-size:12px; line-height:18px; color:#9ca3af;">
                                If the button above doesn't work, copy and paste this link into your browser:
                                <br />
                                <a href="${resetUrl}" style="color:#2563eb; word-break:break-all;">${resetUrl}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:20px 32px; background-color:#f9fafb; border-top:1px solid #e5e7eb; text-align:center;">
                            <p style="margin:0; font-size:11px; color:#9ca3af;">
                                &copy; ${new Date().getFullYear()} JobFin. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

export { sendResetPasswordEmail };