import { PREVIEWS } from "@/lib/email-templates";

// Dev-only: /api/dev/email-preview?template=sign-in-code[&format=text]
// Returns 404 in production. Sample data only; never sends anything.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const name = url.searchParams.get("template") ?? "";
  const make = PREVIEWS[name];
  if (!make) {
    const list = Object.keys(PREVIEWS)
      .map((k) => `<li><a href="?template=${k}">${k}</a> · <a href="?template=${k}&format=text">text</a></li>`)
      .join("");
    return new Response(`<!doctype html><meta charset="utf-8"><title>Email previews</title><ul>${list}</ul>`, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  const email = make();
  if (url.searchParams.get("format") === "text") {
    return new Response(`Subject: ${email.subject}\n\n${email.text}`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return new Response(email.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
