import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Mail interface. Gmail SMTP today (about 500 emails/day cap); swap the
 * implementation here without touching callers.
 */
export type MailMessage = { to: string; subject: string; text: string; html?: string };

let transporter: Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error("Email is not configured: set SMTP_USER and SMTP_PASS (a Google app password).");
  }
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendMail({ to, subject, text, html }: MailMessage) {
  const from = process.env.EMAIL_FROM || `Short Film Competition <${process.env.SMTP_USER}>`;
  await getTransporter().sendMail({ from, to, subject, text, html });
}
