"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { phoneSchema } from "@/lib/validation";
import { Field, Spinner } from "../ui/bits";
import { grantOrderAccess } from "./order-view";

export function TrackForm() {
  const { repo } = useStore();
  const router = useRouter();
  const [num, setNum] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<{ num?: string; phone?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = num.trim().toUpperCase();
    const pr = phoneSchema.safeParse(phone);
    const e2: typeof err = {};
    if (!/^NS\d{10}$/.test(n)) e2.num = "Захиалгын дугаар NS үсгээр эхэлж 10 цифр дагасан байна (жишээ: NS2611041873).";
    if (!pr.success) e2.phone = pr.error.issues[0].message;
    setErr(e2);
    if (e2.num || e2.phone || !pr.success) return;
    setBusy(true);
    const o = await repo.getOrder(n);
    setBusy(false);
    if (!o || o.contact.phone.replace(/\D/g, "").slice(-8) !== pr.data) return setErr({ form: "Захиалга олдсонгүй. Дугаар болон утсаа шалгана уу." });
    grantOrderAccess(o.number);
    router.push(`/order/${o.number}`);
  }
  return (
    <div className="container-x py-12 md:py-20">
      <form onSubmit={submit} noValidate className="card mx-auto max-w-lg p-6 md:p-9">
        <h1 className="text-3xl">Захиалга хянах</h1>
        <p className="mb-6 mt-2 text-sm text-[var(--text-2)]">Захиалгын дугаар болон захиалгад ашигласан утасны дугаараа оруулна уу.</p>
        <div className="grid gap-4">
          <Field label="Захиалгын дугаар" error={err.num} htmlFor="t-num"><input id="t-num" className="input uppercase" value={num} onChange={(e) => setNum(e.target.value)} placeholder="NS2611041873" aria-invalid={!!err.num} data-testid="track-number" /></Field>
          <Field label="Утасны дугаар" error={err.phone} htmlFor="t-phone"><input id="t-phone" className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!err.phone} data-testid="track-phone" /></Field>
        </div>
        {err.form && <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{err.form}</p>}
        <button className="btn btn-accent btn-block mt-6 !min-h-12" disabled={busy} data-testid="track-submit">{busy ? <Spinner className="size-4" /> : <><Search className="size-4" />Хянах</>}</button>
      </form>
    </div>
  );
}
