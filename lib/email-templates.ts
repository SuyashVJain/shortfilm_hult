import "server-only";

/*
 * Branded HTML emails with plain-text fallbacks.
 * Email-safe: table layout, inline CSS only, max width 600px, no external CSS,
 * no JavaScript, no web fonts, no images. Every dynamic value is escaped.
 */

export type Email = { subject: string; text: string; html: string };

const C = { bg: "#050505", cream: "#F2E8D5", red: "#E11D2E", card: "#F8F3EA", ink: "#1A1A1A", muted: "#6B6459", line: "#E3DACB" };
const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "Arial, Helvetica, sans-serif";

/** Escape a value for safe inclusion in HTML text or attributes. */
export function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Absolute link into the site (dashboard etc.). */
export function siteUrl(path = "/") {
  const base = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Only http(s) links are ever placed in an href. */
function safeHref(url: string) {
  return /^https?:\/\//i.test(url) ? esc(url) : "#";
}

const p = (html: string) =>
  `<p style="margin:0 0 16px 0;font-family:${SANS};font-size:15px;line-height:24px;color:${C.ink};">${html}</p>`;

function codeBox(code: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 20px auto;">
  <tr><td style="border:2px solid ${C.ink};background:#FFFFFF;padding:16px 28px;font-family:'Courier New', Courier, monospace;font-size:32px;line-height:36px;font-weight:bold;letter-spacing:10px;color:${C.ink};text-align:center;">${esc(code)}</td></tr>
</table>`;
}

function button(label: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px 0;">
  <tr><td bgcolor="${C.red}" style="background:${C.red};">
    <a href="${safeHref(url)}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${esc(label)}</a>
  </td></tr>
</table>`;
}

function details(rows: [string, string][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px 0;border-top:1px solid ${C.line};">
${rows
  .map(
    ([k, v]) => `  <tr>
    <td style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.muted};width:40%;">${esc(k)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:15px;color:${C.ink};font-weight:bold;">${esc(v)}</td>
  </tr>`,
  )
  .join("\n")}
</table>`;
}

/** Shared layout: dark header with the SHORT FILM / Competition wordmark, cream card, muted footer. */
function layout(preheader: string, heading: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#EDE7DC;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#EDE7DC;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">
      <tr><td bgcolor="${C.bg}" style="background:${C.bg};padding:28px 32px 24px 32px;">
        <div style="font-family:Impact, 'Arial Narrow Bold', ${SANS};font-size:30px;line-height:32px;letter-spacing:2px;color:${C.cream};text-transform:uppercase;">SHORT FILM</div>
        <div style="font-family:${SERIF};font-style:italic;font-size:24px;line-height:28px;color:${C.red};margin-top:2px;">Competition</div>
      </td></tr>
      <tr><td bgcolor="${C.card}" style="background:${C.card};padding:32px 32px 12px 32px;">
        <h1 style="margin:0 0 18px 0;font-family:${SERIF};font-size:24px;line-height:30px;font-weight:normal;color:${C.ink};">${esc(heading)}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:20px 32px 8px 32px;font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};text-align:center;">
        Hult Prize @ SUAS, Symbiosis University of Applied Sciences, Indore<br>
        If you did not request this, ignore this email.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const FOOTER_TEXT =
  "\n\n--\nHult Prize @ SUAS, Symbiosis University of Applied Sciences, Indore\nIf you did not request this, ignore this email.";

// ---------------------------------------------------------------------------

export function signInCodeEmail(code: string): Email {
  return {
    subject: `Your code: ${code}`,
    text: `Your Short Film Competition code is ${code}.\n\nIt expires in 10 minutes.${FOOTER_TEXT}`,
    html: layout(
      `Your code is ${code}`,
      "Your sign-in code",
      p("Use this code to continue. It expires in 10 minutes.") + codeBox(code),
    ),
  };
}

export function passwordResetCodeEmail(code: string): Email {
  return {
    subject: `Your password reset code: ${code}`,
    text: `Your Short Film Competition password reset code is ${code}.\n\nIt expires in 10 minutes.${FOOTER_TEXT}`,
    html: layout(
      `Your password reset code is ${code}`,
      "Reset your password",
      p("Enter this code on the sign-in page to choose a new password. It expires in 10 minutes.") + codeBox(code),
    ),
  };
}

export function registrationReceivedEmail(v: { teamName: string; teamCode: string; eventTitle: string }): Email {
  const url = siteUrl("/dashboard");
  return {
    subject: `Registration received: ${v.teamCode}`,
    text:
      `Your team "${v.teamName}" is registered for the ${v.eventTitle}.\n\n` +
      `Team ID: ${v.teamCode}\nPayment: Needs review\n\n` +
      `The organisers will check your payment. You can already use your team dashboard:\n${url}${FOOTER_TEXT}`,
    html: layout(
      `Team ${v.teamCode} is registered`,
      "Registration received",
      p(`Your team <strong>${esc(v.teamName)}</strong> is registered for the ${esc(v.eventTitle)}.`) +
        details([
          ["Team ID", v.teamCode],
          ["Payment", "Needs review"],
        ]) +
        p("The organisers will check your payment. You can already use your team dashboard.") +
        button("Go to dashboard", url),
    ),
  };
}

export function paymentVerifiedEmail(v: { teamName: string; teamCode: string }): Email {
  const url = siteUrl("/dashboard");
  return {
    subject: `Payment verified: ${v.teamCode}`,
    text: `Your payment for team "${v.teamName}" (${v.teamCode}) is verified. Thank you.\n\nYour dashboard: ${url}${FOOTER_TEXT}`,
    html: layout(
      `Payment verified for ${v.teamCode}`,
      "Payment verified",
      p(`Your payment for team <strong>${esc(v.teamName)}</strong> (${esc(v.teamCode)}) is verified. Thank you.`) +
        button("Go to dashboard", url),
    ),
  };
}

export function paymentRejectedEmail(v: { teamName: string; teamCode: string; reason: string }): Email {
  const url = siteUrl("/dashboard");
  return {
    subject: `Payment needs attention: ${v.teamCode}`,
    text:
      `The organisers could not verify the payment for team "${v.teamName}" (${v.teamCode}).\n\n` +
      `Reason: ${v.reason}\n\nYou can resubmit your payment details from your dashboard:\n${url}${FOOTER_TEXT}`,
    html: layout(
      `Payment needs attention for ${v.teamCode}`,
      "Payment needs attention",
      p(`The organisers could not verify the payment for team <strong>${esc(v.teamName)}</strong> (${esc(v.teamCode)}).`) +
        details([["Reason", v.reason]]) +
        p("You can resubmit your payment details from your dashboard.") +
        button("Resubmit payment", url),
    ),
  };
}

/** For the dev preview route: sample data only. */
export const PREVIEWS: Record<string, () => Email> = {
  "sign-in-code": () => signInCodeEmail("482913"),
  "password-reset": () => passwordResetCodeEmail("305718"),
  "registration-received": () => registrationReceivedEmail({ teamName: "Frame by Frame", teamCode: "HP-SF-041", eventTitle: "Short Film Competition" }),
  "payment-verified": () => paymentVerifiedEmail({ teamName: "Frame by Frame", teamCode: "HP-SF-041" }),
  "payment-rejected": () =>
    paymentRejectedEmail({ teamName: "Frame by Frame", teamCode: "HP-SF-041", reason: "The UTR does not match the screenshot <test & escape>" }),
};
