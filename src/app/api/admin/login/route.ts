import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE, SESSION_TTL_S, checkCredentials, signSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().trim().email().max(120), password: z.string().min(1).max(200) });

// Энгийн IP тус бүрийн оролдлогын хязгаар (нэг instance дотор). Production-д Vercel Firewall / Upstash ашиглана.
const attempts = new Map<string, { n: number; reset: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.reset > now && a.n >= 8) return NextResponse.json({ error: "Хэт олон оролдлого хийлээ. 10 минутын дараа дахин оролдоно уу." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Имэйл болон нууц үгээ зөв оруулна уу." }, { status: 400 });

  const role = checkCredentials(parsed.data.email, parsed.data.password);
  if (!role) {
    attempts.set(ip, { n: (a && a.reset > now ? a.n : 0) + 1, reset: a && a.reset > now ? a.reset : now + 10 * 60_000 });
    return NextResponse.json({ error: "Имэйл эсвэл нууц үг буруу байна." }, { status: 401 });
  }
  attempts.delete(ip);
  const token = await signSession({ email: parsed.data.email.toLowerCase(), role });
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_TTL_S });
  return res;
}
