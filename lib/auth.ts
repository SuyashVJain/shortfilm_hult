import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export { ROLES, type Role } from "@/lib/roles";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // Email + password sign-in (scrypt hashing, stored on the account table).
  // Accounts are only ever CREATED through the email code (registration), so
  // public password sign-up is disabled; a password is then set on the account.
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  // 30-day sessions, refreshed at most once a day while in use (sliding).
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "PARTICIPANT",
        input: false, // never settable from the client
      },
    },
  },
  // Per-IP limits. Campus Wi-Fi puts many students behind one IP, so the
  // general limit is generous and only code sending/verifying is tight.
  // Session reads are never limited: middleware checks the session on every
  // protected page, and a 429 there caused redirect loops.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/get-session": false,
      "/email-otp/send-verification-otp": { window: 60, max: 20 },
      "/sign-in/email-otp": { window: 60, max: 30 },
      "/sign-in/email": { window: 60, max: 30 },
      "/email-otp/request-password-reset": { window: 60, max: 20 },
      "/email-otp/reset-password": { window: 60, max: 30 },
      "/change-password": { window: 60, max: 10 },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      // Codes are for first sign-up, sign-in by code, and password reset.
      async sendVerificationOTP({ email, otp, type }) {
        await sendMail(
          type === "forget-password"
            ? {
                to: email,
                subject: `Your password reset code: ${otp}`,
                text: `Your Short Film Competition password reset code is ${otp}.\n\nIt expires in 10 minutes.\n\nIf you did not request this, ignore it.`,
              }
            : {
                to: email,
                subject: `Your code: ${otp}`,
                text: `Your Short Film Competition code is ${otp}.\n\nIt expires in 10 minutes.\n\nIf you did not request this, ignore it.`,
              },
        );
      },
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
