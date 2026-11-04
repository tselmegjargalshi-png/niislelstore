"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Info, ShieldCheck } from "lucide-react";
import { DEMO_ADMIN, DEMO_STAFF } from "@/lib/admin-roles";
import { Field, Spinner } from "../ui/bits";
import { Logo } from "../logo";

export function AdminLogin() {
  const router = useRouter();
  const n = useSearchParams().get("next");
  const next = n && n.startsWith("/admin") && !n.startsWith("//") ? n : "/admin";
  const [v, setV] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!v.email || !v.password) return setErr("Имэйл болон нууц үгээ оруулна уу.");
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error ?? "Нэвтрэх үед алдаа гарлаа."); setBusy(false); return; }
      router.replace(next);
    } catch { setErr("Сервертэй холбогдож чадсангүй. Дахин оролдоно уу."); setBusy(false); }
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--ink)] p-4">
      <form onSubmit={submit} noValidate className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-7 shadow-[var(--shadow-lg)] md:p-10" data-testid="admin-login-form">
        <Logo />
        <h1 className="mt-8 flex items-center gap-2 text-2xl"><ShieldCheck className="size-6 text-[var(--accent)]" />Админ нэвтрэх</h1>
        <p className="mt-1 text-sm text-[var(--text-2)]">Зөвхөн эрх бүхий ажилтнуудад зориулсан.</p>
        {demo && (
          <div className="mt-5 grid gap-1.5 rounded-xl bg-[var(--info-soft)] p-3 text-xs text-[var(--info)]">
            <p className="flex items-center gap-1.5 font-semibold"><Info className="size-4" />Демо горим</p>
            <button type="button" className="text-left underline" onClick={() => setV({ email: DEMO_ADMIN.email, password: DEMO_ADMIN.password })} data-testid="fill-admin">{`Админ: ${DEMO_ADMIN.email}`}</button>
            <button type="button" className="text-left underline" onClick={() => setV({ email: DEMO_STAFF.email, password: DEMO_STAFF.password })} data-testid="fill-staff">{`Ажилтан: ${DEMO_STAFF.email}`}</button>
          </div>
        )}
        <div className="mt-6 grid gap-4">
          <Field label="Имэйл" htmlFor="a-email"><input id="a-email" type="email" autoComplete="username" className="input" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} data-testid="admin-email" /></Field>
          <Field label="Нууц үг" htmlFor="a-pass"><input id="a-pass" type="password" autoComplete="current-password" className="input" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} data-testid="admin-password" /></Field>
        </div>
        {err && <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]" data-testid="admin-error">{err}</p>}
        <button className="btn btn-primary btn-block mt-6 !min-h-12" disabled={busy} data-testid="admin-submit">{busy ? <Spinner className="size-4" /> : "Нэвтрэх"}</button>
      </form>
    </div>
  );
}
