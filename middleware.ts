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

  const res = await fetch(new URL("/api/auth/get-session", req.nextUrl.origin), {
    headers: { cookie: req.headers.get("cookie") ?? "" },
  });
  const session = res.ok ? ((await res.json()) as { user?: { role?: Role } } | null) : null;

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
