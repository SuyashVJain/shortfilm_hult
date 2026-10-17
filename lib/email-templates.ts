import "server-only";

/*
 * Branded HTML emails with plain-text fallbacks, themed like the site:
 * a dark cinema card with film-strip bars, the SHORT FILM / Competition
 * lockup and a ticket-stub code.
 *
 * Email-safe: table layout, inline CSS only, max width 600px, no external CSS,
 * no JavaScript, no web fonts, no images. Colours are set with bgcolor
 * attributes as well as CSS so Outlook and Gmail dark mode keep them.
 * Every dynamic value is escaped.
 */

export type Email = { subject: string; text: string; html: string };

const C = {
  page: "#050505", // site background
  strip: "#0B0B0B", // film strip
  panel: "#111111", // body panel
  cream: "#F2E8D5",
  muted: "#B5AC9E", // muted cream, ~8:1 on #111
  faint: "#8C8478", // footer text, ~5:1 on #050505
  red: "#E11D2E",
  line: "#2A2824", // cream at ~12% on #111
  ticket: "#1B1812", // dark ticket panel (survives Gmail dark mode)
  ticketLabel: "#F4A6AD", // light red-cream label on the ticket
  sprocket: "#CFC4AE", // film-strip holes, bright enough after dimming
};
const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "Arial, Helvetica, sans-serif";
// Heavy sans so Android (no Impact) falls back to something bold, not thin.
const DISPLAY = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";

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

// ---------------------------------------------------------------------------
// Building blocks

/** A row of small cream "sprocket holes" on a dark strip. Percentage cells, so it never overflows on phones. */
function filmStrip(holes = 16) {
  const w = `${(100 / holes).toFixed(2)}%`;
  const cells = Array.from({ length: holes })
    .map(
      () =>
        `<td width="${w}" align="center" bgcolor="${C.strip}" style="width:${w};padding:7px 0;background:${C.strip};"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td width="12" height="8" bgcolor="${C.sprocket}" style="width:12px;height:8px;background:${C.sprocket};border-radius:1px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.strip}" style="background:${C.strip};table-layout:fixed;">
  <tr>${cells}</tr>
</table>`;
}

const p = (html: string) =>
  `<p style="margin:0 0 18px 0;font-family:${SANS};font-size:15px;line-height:24px;color:${C.cream};">${html}</p>`;

/**
 * Ticket stub: a DARK panel (Gmail dark mode inverts light blocks) with a cream
 * border and perforated (dashed) cream sides. Label and digits each sit in their
 * own <td> with bgcolor + inline colours, and no nested backgrounds.
 */
function ticket(code: string, label = "Admit one") {
  const edge = `border-left:2px dashed ${C.cream};border-right:2px dashed ${C.cream};`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="${C.ticket}" style="margin:6px auto 24px auto;background:${C.ticket};border-top:2px solid ${C.cream};border-bottom:2px solid ${C.cream};">
  <tr>
    <td align="center" bgcolor="${C.ticket}" style="background:${C.ticket};color:${C.ticketLabel};${edge}padding:14px 34px 2px 34px;font-family:${SANS};font-size:10px;line-height:14px;letter-spacing:4px;text-transform:uppercase;font-weight:bold;">${esc(label)}</td>
  </tr>
  <tr>
    <td align="center" bgcolor="${C.ticket}" style="background:${C.ticket};color:${C.cream};${edge}padding:4px 34px 16px 34px;font-family:${MONO};font-size:34px;line-height:40px;font-weight:bold;letter-spacing:10px;">${esc(code)}</td>
  </tr>
</table>`;
}

function button(label: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px 0;">
  <tr><td bgcolor="${C.red}" style="background:${C.red};">
    <a href="${safeHref(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${esc(label)}</a>
  </td></tr>
</table>`;
}

function details(rows: [string, string][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;border-top:1px solid ${C.line};">
${rows
  .map(
    ([k, v]) => `  <tr>
    <td style="padding:11px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};width:38%;">${esc(k)}</td>
    <td style="padding:11px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:15px;color:${C.cream};font-weight:bold;">${esc(v)}</td>
  </tr>`,
  )
  .join("\n")}
</table>`;
}

/** Shared layout: dark page, film-strip header with the lockup, charcoal panel, film-strip footer. */
function layout(preheader: string, heading: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(heading)}</title>
</head>
<body bgcolor="${C.page}" style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page};">
  <tr><td align="center" style="padding:24px 10px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="width:100%;max-width:600px;background:${C.page};">
      <tr><td>${filmStrip()}</td></tr>
      <tr><td bgcolor="${C.page}" style="background:${C.page};padding:30px 32px 26px 32px;">
        <div style="font-family:${DISPLAY};font-weight:900;font-size:34px;line-height:40px;letter-spacing:5px;color:${C.cream};text-transform:uppercase;"><b style="font-weight:900;">SHORT FILM</b></div>
        <div style="font-family:${SERIF};font-style:italic;font-size:32px;line-height:34px;color:${C.red};margin:-2px 0 0 26px;">Competition</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 0 26px;"><tr><td width="150" height="3" bgcolor="${C.red}" style="width:150px;height:3px;background:${C.red};font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <div style="margin-top:18px;font-family:${SANS};font-size:10px;line-height:14px;letter-spacing:2.5px;text-transform:uppercase;color:${C.muted};">Real Stories <span style="color:${C.red};">|</span> Brighter Tomorrows</div>
      </td></tr>
      <tr><td>${filmStrip()}</td></tr>
      <tr><td bgcolor="${C.panel}" style="background:${C.panel};padding:34px 32px 14px 32px;">
        <h1 style="margin:0 0 16px 0;font-family:${SERIF};font-size:28px;line-height:34px;font-weight:normal;color:${C.cream};">${esc(heading)}</h1>
        ${body}
      </td></tr>
      <tr><td>${filmStrip()}</td></tr>
      <tr><td bgcolor="${C.page}" style="background:${C.page};padding:18px 32px 8px 32px;font-family:${SANS};font-size:12px;line-height:19px;color:${C.faint};text-align:left;">
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
  "\n\n--\nShort Film Competition · Real Stories | Brighter Tomorrows\nHult Prize @ SUAS, Symbiosis University of Applied Sciences, Indore\nIf you did not request this, ignore this email.";

// ---------------------------------------------------------------------------
// Templates

export function signInCodeEmail(code: string): Email {
  return {
    subject: `Your Short Film Competition code: ${code}`,
    text: `Lights, camera, almost there. Your Short Film Competition code is ${code}.\n\nIt expires in 10 minutes.${FOOTER_TEXT}`,
    html: layout(
      `Your code is ${code}`,
      "Your sign-in code",
      p("Lights, camera, almost there. Here is your code. It expires in 10 minutes.") + ticket(code),
    ),
  };
}

export function passwordResetCodeEmail(code: string): Email {
  return {
    subject: `Your Short Film Competition reset code: ${code}`,
    text: `Time for a retake. Your Short Film Competition password reset code is ${code}.\n\nIt expires in 10 minutes.${FOOTER_TEXT}`,
    html: layout(
      `Your password reset code is ${code}`,
      "Reset your password",
      p("Time for a retake. Enter this code on the sign-in page to choose a new password. It expires in 10 minutes.") +
        ticket(code, "Reset code"),
    ),
  };
}

export function registrationReceivedEmail(v: { teamName: string; teamCode: string; eventTitle: string }): Email {
  const url = siteUrl("/dashboard");
  return {
    subject: `You're registered: ${v.teamCode} · Short Film Competition`,
    text:
      `Your team "${v.teamName}" is on the call sheet for the ${v.eventTitle}.\n\n` +
      `Team ID: ${v.teamCode}\nPayment: Needs review\n\n` +
      `The organisers will check your payment. You can already use your team dashboard:\n${url}${FOOTER_TEXT}`,
    html: layout(
      `Team ${v.teamCode} is registered`,
      "Registration received",
      p(`Your team <strong>${esc(v.teamName)}</strong> is on the call sheet for the ${esc(v.eventTitle)}.`) +
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
    subject: `Payment verified: ${v.teamCode} · Short Film Competition`,
    text: `That's a wrap on payment. Your payment for team "${v.teamName}" (${v.teamCode}) is verified. Thank you.\n\nYour dashboard: ${url}${FOOTER_TEXT}`,
    html: layout(
      `Payment verified for ${v.teamCode}`,
      "Payment verified",
      p(`That&rsquo;s a wrap on payment. Your payment for team <strong>${esc(v.teamName)}</strong> is verified. Thank you.`) +
        details([
          ["Team ID", v.teamCode],
          ["Payment", "Verified"],
        ]) +
        button("Go to dashboard", url),
    ),
  };
}

export function paymentRejectedEmail(v: { teamName: string; teamCode: string; reason: string }): Email {
  const url = siteUrl("/dashboard");
  return {
    subject: `Payment needs attention: ${v.teamCode} · Short Film Competition`,
    text:
      `One more take needed. The organisers could not verify the payment for team "${v.teamName}" (${v.teamCode}).\n\n` +
      `Reason: ${v.reason}\n\nYou can resubmit your payment details from your dashboard:\n${url}${FOOTER_TEXT}`,
    html: layout(
      `Payment needs attention for ${v.teamCode}`,
      "Payment needs attention",
      p(`One more take needed. The organisers could not verify the payment for team <strong>${esc(v.teamName)}</strong>.`) +
        details([
          ["Team ID", v.teamCode],
          ["Reason", v.reason],
        ]) +
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
