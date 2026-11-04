import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/admin-auth";
import { can } from "@/lib/admin-roles";

/** Админ эрхтэй хэсгүүд (ажилтан хандаж болохгүй). Сервер талд албадан хэрэгжинэ. */
const ADMIN_ONLY = ["/admin/marketing", "/admin/delivery", "/admin/categories", "/admin/products/new"];
const isAdminOnly = (p: string) => ADMIN_ONLY.some((x) => p === x || p.startsWith(`${x}/`)) || /^\/admin\/products\/[^/]+$/.test(p);

/** /admin/* хуудсуудыг (нэвтрэх хуудсаас бусад) гарын үсэгтэй session cookie-гүй бол нэвтрэх рүү чиглүүлнэ. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const session = await verifySession(req.cookies.get(COOKIE)?.value);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  if (isAdminOnly(pathname) && !can(session.role, "marketing")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "?denied=1";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
