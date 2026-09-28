import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { db } from "@/lib/db";

export const ROLES = ["PARTICIPANT", "JURY", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

const resend = new Resend(process.env.RESEND_API_KEY);
// Sender needs a verified Resend domain (open-questions D4).
const FROM = process.env.EMAIL_FROM || "Short Film Competition <onboarding@resend.dev>";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // Email OTP only. No passwords.
  emailAndPassword: { enabled: false },
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
  rateLimit: { enabled: true, window: 60, max: 10 },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp }) {
        const { error } = await resend.emails.send({
          from: FROM,
          to: email,
          subject: `Your code: ${otp}`,
          text: `Your Short Film Competition sign-in code is ${otp}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
        });
        if (error) throw new Error(`Could not send code: ${error.message}`);
      },
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
