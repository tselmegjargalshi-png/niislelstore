import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await verifySession((await cookies()).get(COOKIE)?.value);
  if (!s) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, email: s.email, role: s.role });
}
