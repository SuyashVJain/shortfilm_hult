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
        await sendMail({
          to: email,
          subject: `Your code: ${otp}`,
          text: `Your Short Film Competition code is ${otp}.\n\nIt expires in 10 minutes.\n\nIf you did not request this, ignore it.`,
        });
      },
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
