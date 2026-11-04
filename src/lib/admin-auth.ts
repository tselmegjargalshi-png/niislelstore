/**
 * Админ нэвтрэлт (server талд, Edge болон Node хоёрт ажиллана: Web Crypto ашиглана).
 *
 * - Нэвтрэх мэдээлэл ЗӨВХӨН server орчны хувьсагчаас (ADMIN_EMAIL/ADMIN_PASSWORD, STAFF_*) уншигдана.
 * - Session нь HMAC SHA-256 гарын үсэгтэй, HttpOnly, SameSite=Lax cookie. Нууц түлхүүр SESSION_SECRET.
 * - Демо горимд (NEXT_PUBLIC_DEMO_MODE=true) ба орчны хувьсагч тохируулаагүй үед л нийтэд мэдэгдэж буй
 *   демо бүртгэл ажиллана. Production-д заавал өөрийн утгуудыг тохируулна уу (README харна уу).
 */
import { type AdminRole } from "./admin-roles";
export type { AdminRole };
export interface AdminSession { email: string; role: AdminRole; exp: number }

export const COOKIE = "niislel_admin";
export const SESSION_TTL_S = 60 * 60 * 8;

import { DEMO_ADMIN, DEMO_STAFF } from "./admin-roles";

export const isDemoMode = () => process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (isDemoMode()) return "demo-only-secret-change-me-in-production-0123456789";
  throw new Error("SESSION_SECRET (дор хаяж 32 тэмдэгт) тохируулаагүй байна.");
}

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function key() {
  return crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(s: Omit<AdminSession, "exp">): Promise<string> {
  const payload: AdminSession = { ...s, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const p = JSON.parse(new TextDecoder().decode(fromB64url(body))) as AdminSession;
    if (!p.exp || p.exp < Date.now() / 1000 || (p.role !== "admin" && p.role !== "staff")) return null;
    return p;
  } catch {
    return null;
  }
}

/** Тогтмол хугацаанд харьцуулах (timing attack-аас сэргийлнэ). */
export function safeEqual(a: string, b: string): boolean {
  const A = enc.encode(a), B = enc.encode(b);
  let diff = A.length ^ B.length;
  for (let i = 0; i < Math.max(A.length, B.length); i++) diff |= (A[i] ?? 0) ^ (B[i] ?? 0);
  return diff === 0;
}

export function checkCredentials(email: string, password: string): AdminRole | null {
  const e = email.trim().toLowerCase();
  const pairs: [AdminRole, string | undefined, string | undefined][] = [
    ["admin", process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD],
    ["staff", process.env.STAFF_EMAIL, process.env.STAFF_PASSWORD],
  ];
  let found: AdminRole | null = null;
  for (const [role, em, pw] of pairs) {
    if (em && pw && safeEqual(e, em.trim().toLowerCase()) && safeEqual(password, pw)) found = role;
  }
  if (!found && isDemoMode() && !process.env.ADMIN_EMAIL) {
    if (safeEqual(e, DEMO_ADMIN.email) && safeEqual(password, DEMO_ADMIN.password)) found = "admin";
    else if (safeEqual(e, DEMO_STAFF.email) && safeEqual(password, DEMO_STAFF.password)) found = "staff";
  }
  return found;
}

