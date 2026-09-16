import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetPasswordEmail(to, resetUrl) {
    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject: "Reset Password - Job Tracker",
        html: `
      <p>Kamu meminta reset password untuk akun Job Tracker kamu.</p>
      <p><a href="${resetUrl}">Klik di sini untuk reset password</a> (berlaku 30 menit).</p>
      <p>Kalau kamu tidak merasa meminta ini, abaikan saja email ini.</p>
    `,
    });
}

export { sendResetPasswordEmail };