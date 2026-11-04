"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { newsletterSchema } from "@/lib/validation";
import { Spinner } from "./ui/bits";

export function Newsletter() {
  const { repo, toast } = useStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = newsletterSchema.safeParse({ email });
    if (!r.success) return setError(r.error.issues[0].message);
    setError("");
    setBusy(true);
    try {
      const res = await repo.subscribe_newsletter(r.data.email);
      setDone(true);
      toast(res === "exists" ? "Энэ имэйл аль хэдийн бүртгэлтэй байна." : "Амжилттай бүртгүүллээ. Баярлалаа!", res === "exists" ? "info" : "success");
    } catch {
      setError("Бүртгэх үед алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-[var(--ink)] text-[var(--on-ink)]">
      <div className="container-x grid gap-6 py-14 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <p className="eyebrow !text-[var(--gold)]">Мэдээлэл авах</p>
          <h2 className="mt-2 text-3xl md:text-4xl">Шинэ цуглуулга, урамшууллыг хамгийн түрүүнд мэд</h2>
          <p className="mt-3 max-w-md text-sm text-[var(--on-ink)]/70">Сард нэг удаа л имэйл илгээнэ. Бүртгүүлсэн даруйд анхны захиалгадаа NIISLEL10 кодоор 10% хөнгөлөлт аваарай.</p>
        </div>
        <form onSubmit={submit} noValidate className="grid gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="nl-email">Имэйл хаяг</label>
            <input id="nl-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Имэйл хаяг" aria-invalid={!!error}
              className="input !border-white/20 !bg-white/10 !text-[var(--on-ink)] placeholder:!text-white/50" />
            <button className="btn btn-accent sm:shrink-0" disabled={busy || done}>
              {busy ? <Spinner /> : done ? <><Check className="size-4" /> Бүртгэгдлээ</> : <>Бүртгүүлэх <ArrowRight className="size-4" /></>}
            </button>
          </div>
          {error && <p role="alert" className="text-sm text-[var(--gold)]">{error}</p>}
        </form>
      </div>
    </section>
  );
}
