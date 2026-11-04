"use client";
import { useState, type FormEvent } from "react";
import { BadgePercent, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { evaluateCoupon } from "@/lib/pricing";
import { Spinner } from "../ui/bits";

export function CouponBox({ subtotal, error: externalError }: { subtotal: number; error?: string }) {
  const { repo, appliedCoupon, setAppliedCoupon, toast } = useStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function apply(e: FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return setError("Купон кодоо оруулна уу.");
    setBusy(true);
    setError("");
    try {
      const coupon = await repo.findCoupon(c);
      const res = evaluateCoupon(coupon, subtotal);
      if (!res.ok) return setError(res.error);
      setAppliedCoupon(res.coupon.code);
      setCode("");
      toast(res.message);
    } catch {
      setError("Купон шалгах үед алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-4 py-3 text-sm" data-testid="coupon-applied">
        <span className="flex items-center gap-2 font-medium text-[var(--success)]"><BadgePercent className="size-4" />{`Купон ${appliedCoupon} хэрэглэгдсэн`}</span>
        <button type="button" onClick={() => setAppliedCoupon(null)} aria-label="Купон хасах" className="grid size-8 place-items-center rounded-full hover:bg-black/5"><X className="size-4" /></button>
        {externalError && <span className="sr-only">{externalError}</span>}
      </div>
    );
  }
  return (
    <form onSubmit={apply} noValidate>
      <label htmlFor="coupon" className="mb-1.5 block text-sm font-semibold">Купон код</label>
      <div className="flex gap-2">
        <input id="coupon" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }} placeholder="Жишээ: NIISLEL10" autoCapitalize="characters" aria-invalid={!!error} className="input !min-h-11 uppercase" data-testid="coupon-input" />
        <button className="btn btn-ghost !min-h-11" disabled={busy} data-testid="coupon-apply">{busy ? <Spinner className="size-4" /> : "Хэрэглэх"}</button>
      </div>
      {(error || externalError) && <p role="alert" className="mt-1.5 text-sm text-[var(--danger)]" data-testid="coupon-error">{error || externalError}</p>}
    </form>
  );
}
