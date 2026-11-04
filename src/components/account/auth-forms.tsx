"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Info } from "lucide-react";
import { useStore } from "@/lib/store";
import { loginSchema, registerSchema, fieldErrors, type FieldErrors } from "@/lib/validation";
import { RepositoryError } from "@/lib/data/repository";
import { DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD } from "@/lib/data/seed";
import { Field, Spinner } from "../ui/bits";
import { Logo } from "../logo";

function safeNext(n: string | null) { return n && n.startsWith("/") && !n.startsWith("//") ? n : "/account"; }

export function LoginForm() {
  const { repo, toast } = useStore();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [v, setV] = useState({ email: "", password: "" });
  const [er, setEr] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = loginSchema.safeParse(v);
    if (!r.success) return setEr(fieldErrors(r.error));
    setBusy(true); setEr({});
    try { await repo.login(r.data.email, r.data.password); toast("Тавтай морил!"); router.replace(next); }
    catch (err) { setEr({ _: err instanceof RepositoryError ? err.message : "Нэвтрэх үед алдаа гарлаа." }); setBusy(false); }
  }
  return (
    <div className="container-x py-12 md:py-20">
      <form onSubmit={submit} noValidate className="card mx-auto max-w-md p-6 md:p-9" data-testid="login-form">
        <div className="mb-6"><Logo /></div>
        <h1 className="text-3xl">Нэвтрэх</h1>
        <div className="mt-4 flex gap-2 rounded-xl bg-[var(--info-soft)] p-3 text-xs text-[var(--info)]"><Info className="mt-0.5 size-4 shrink-0" /><p>Демо нэвтрэлт: хөтчийн санах ойд хадгалагдана. Туршиж үзэх бүртгэл: <button type="button" className="font-semibold underline" onClick={() => setV({ email: DEMO_CUSTOMER_EMAIL, password: DEMO_CUSTOMER_PASSWORD })}>{`${DEMO_CUSTOMER_EMAIL} / ${DEMO_CUSTOMER_PASSWORD}`}</button></p></div>
        <div className="mt-5 grid gap-4">
          <Field label="Имэйл" error={er.email} htmlFor="l-email"><input id="l-email" type="email" autoComplete="email" className="input" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} aria-invalid={!!er.email} data-testid="login-email" /></Field>
          <Field label="Нууц үг" error={er.password} htmlFor="l-pass"><input id="l-pass" type="password" autoComplete="current-password" className="input" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} aria-invalid={!!er.password} data-testid="login-password" /></Field>
        </div>
        {er._ && <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{er._}</p>}
        <button className="btn btn-primary btn-block mt-6 !min-h-12" disabled={busy} data-testid="login-submit">{busy ? <Spinner className="size-4" /> : "Нэвтрэх"}</button>
        <p className="mt-5 text-center text-sm text-[var(--text-2)]">Бүртгэлгүй юу? <Link href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-[var(--accent)] underline">Бүртгүүлэх</Link></p>
      </form>
    </div>
  );
}

export function RegisterForm() {
  const { repo, toast } = useStore();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [er, setEr] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => { setV({ ...v, [k]: e.target.value }); setEr({ ...er, [k]: "" }); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = registerSchema.safeParse(v);
    if (!r.success) return setEr(fieldErrors(r.error));
    setBusy(true); setEr({});
    try { await repo.register({ name: r.data.name, email: r.data.email, phone: r.data.phone, password: r.data.password }); toast("Бүртгэл амжилттай үүслээ."); router.replace(next); }
    catch (err) { setEr({ _: err instanceof RepositoryError ? err.message : "Бүртгэх үед алдаа гарлаа." }); setBusy(false); }
  }
  return (
    <div className="container-x py-12 md:py-20">
      <form onSubmit={submit} noValidate className="card mx-auto max-w-md p-6 md:p-9" data-testid="register-form">
        <div className="mb-6"><Logo /></div>
        <h1 className="text-3xl">Бүртгүүлэх</h1>
        <p className="mt-2 text-sm text-[var(--text-2)]">Захиалгаа хянах, хаягаа хадгалах, хадгалсан бараагаа бүх төхөөрөмжөөс харахад хэрэгтэй.</p>
        <div className="mt-5 grid gap-4">
          <Field label="Овог нэр" error={er.name} htmlFor="r-name"><input id="r-name" autoComplete="name" className="input" value={v.name} onChange={set("name")} aria-invalid={!!er.name} data-testid="reg-name" /></Field>
          <Field label="Имэйл" error={er.email} htmlFor="r-email"><input id="r-email" type="email" autoComplete="email" className="input" value={v.email} onChange={set("email")} aria-invalid={!!er.email} data-testid="reg-email" /></Field>
          <Field label="Утасны дугаар" error={er.phone} htmlFor="r-phone"><input id="r-phone" inputMode="tel" autoComplete="tel-national" className="input" value={v.phone} onChange={set("phone")} aria-invalid={!!er.phone} data-testid="reg-phone" /></Field>
          <Field label="Нууц үг" error={er.password} htmlFor="r-pass" hint="Дор хаяж 8 тэмдэгт"><input id="r-pass" type="password" autoComplete="new-password" className="input" value={v.password} onChange={set("password")} aria-invalid={!!er.password} data-testid="reg-password" /></Field>
          <Field label="Нууц үг давтах" error={er.confirm} htmlFor="r-conf"><input id="r-conf" type="password" autoComplete="new-password" className="input" value={v.confirm} onChange={set("confirm")} aria-invalid={!!er.confirm} data-testid="reg-confirm" /></Field>
        </div>
        {er._ && <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{er._}</p>}
        <button className="btn btn-accent btn-block mt-6 !min-h-12" disabled={busy} data-testid="reg-submit">{busy ? <Spinner className="size-4" /> : "Бүртгэл үүсгэх"}</button>
        <p className="mt-5 text-center text-sm text-[var(--text-2)]">Бүртгэлтэй юу? <Link href="/account/login" className="font-semibold text-[var(--accent)] underline">Нэвтрэх</Link></p>
      </form>
    </div>
  );
}
