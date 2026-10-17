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
  // Local testing only: skip sending entirely (never set this in production).
  if (process.env.EMAIL_DRY_RUN === "1") return;
  await getTransporter().sendMail({ from: fromAddress(), to, subject, text, html });
}

const DISPLAY_NAME = "Short Film Competition";

/**
 * Always send as "Short Film Competition <address>". EMAIL_FROM may be a bare
 * address or "Name <address>"; only its address is used. Falls back to SMTP_USER.
 */
function fromAddress() {
  const raw = (process.env.EMAIL_FROM || "").trim();
  const address = raw.match(/<([^>]+)>/)?.[1]?.trim() || (raw.includes("@") ? raw : "") || process.env.SMTP_USER || "";
  return { name: DISPLAY_NAME, address };
}
