import { NextResponse, type NextRequest } from "next/server";

type Role = "PARTICIPANT" | "JURY" | "ADMIN";

const RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard", roles: ["PARTICIPANT"] },
  { prefix: "/jury", roles: ["JURY", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] },
];

const HOME: Record<Role, string> = { PARTICIPANT: "/dashboard", JURY: "/jury", ADMIN: "/admin" };

// First line of defence only. Pages and actions still call requireRole().
export async function middleware(req: NextRequest) {
  const rule = RULES.find((r) => req.nextUrl.pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  let session: { user?: { role?: Role } } | null;
  try {
    const res = await fetch(new URL("/api/auth/get-session", req.nextUrl.origin), {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });
    // Fail open on an error (e.g. 429/5xx): requireRole() in the page still
    // enforces access. Redirecting here would loop with /login.
    if (!res.ok) return NextResponse.next();
    session = (await res.json()) as { user?: { role?: Role } } | null;
  } catch {
    return NextResponse.next();
  }

  if (!session?.user) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const role = session.user.role ?? "PARTICIPANT";
  if (!rule.roles.includes(role)) return NextResponse.redirect(new URL(HOME[role], req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/jury/:path*", "/admin/:path*"],
};
