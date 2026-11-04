"use client";
import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Copy, Smartphone } from "lucide-react";
import { useStore } from "@/lib/store";
import { mnt } from "@/lib/pricing";
import type { Order } from "@/lib/types";
import { providers } from "@/lib/payments/registry";
import { DemoQR } from "./demo-qr";
import { Spinner } from "../ui/bits";

export function PaymentPanel({ order }: { order: Order }) {
  const { repo, toast } = useStore();
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(15 * 60);
  const m = order.payment.method;
  useEffect(() => { const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);

  if (order.status === "cancelled") return null;
  if (order.payment.status === "paid") {
    return <div className="flex items-center gap-3 rounded-2xl bg-[var(--success-soft)] p-5 text-[var(--success)]"><CheckCircle2 className="size-6" /><div><p className="font-semibold">Төлбөр төлөгдсөн (демо)</p><p className="text-sm opacity-80">{`Лавлах код: ${order.payment.reference}`}</p></div></div>;
  }
  if (m === "cod") {
    return <div className="rounded-2xl bg-[var(--surface-2)] p-5 text-sm"><p className="font-semibold">Бэлнээр төлнө</p><p className="mt-1 text-[var(--text-2)]">{`Бараагаа хүлээн авахдаа ${mnt(order.pricing.total)} төгрөгийг хүргэлтийн ажилтанд өгнө.`}</p></div>;
  }

  async function paid() {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 900)); // банкны хариу хүлээж буйг дуурайна
      await repo.updatePaymentStatus(order.number, "paid");
      toast("Демо төлбөр амжилттай бүртгэгдлээ.");
    } catch { toast("Төлбөрийг бүртгэх үед алдаа гарлаа.", "error"); } finally { setBusy(false); }
  }
  const copy = (t: string) => { void navigator.clipboard?.writeText(t); toast("Хууллаа."); };
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");

  if (m === "bank") {
    return (
      <div className="rounded-2xl border border-[var(--line)] p-5">
        <p className="flex items-center gap-2 font-semibold"><Building2 className="size-5 text-[var(--accent)]" />Дансаар шилжүүлэх</p>
        <p className="mt-2 rounded-lg bg-[var(--warn-soft)] px-3 py-2 text-xs text-[var(--warn)]">Демо данс. Энэ дансанд мөнгө шилжүүлэх ХЭРЭГГҮЙ.</p>
        <dl className="mt-4 grid gap-2 text-sm">
          {[["Банк", "Жишээ банк (демо)"], ["Дансны дугаар", "0000 0000 00"], ["Хүлээн авагч", "Нийслэл Стор ХХК (демо)"], ["Гүйлгээний утга", order.number], ["Дүн", mnt(order.pricing.total)]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-2"><dt className="text-[var(--text-2)]">{k}</dt><dd className="flex items-center gap-2 font-semibold tabular">{v}{(k === "Гүйлгээний утга" || k === "Дансны дугаар") && <button onClick={() => copy(v)} aria-label="Хуулах" className="text-[var(--text-3)] hover:text-[var(--text)]"><Copy className="size-4" /></button>}</dd></div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-[var(--text-2)]">Шилжүүлгийг админ шалгаад төлбөрийг баталгаажуулна.</p>
      </div>
    );
  }
  const qr = m === "qpay";
  return (
    <div className="rounded-2xl border border-[var(--line)] p-5 md:p-6" data-testid="payment-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold"><Smartphone className="size-5 text-[var(--accent)]" />{qr ? "QPay төлбөр" : "SocialPay төлбөр"}</p>
        <span className="badge badge-warn">ДЕМО, бодит гүйлгээ биш</span>
      </div>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="mx-auto"><DemoQR value={order.payment.reference + order.number} /></div>
        <div className="text-sm">
          <p className="text-[var(--text-2)]">{qr ? "Банкны аппаараа QR кодыг уншуулж төлнө." : "SocialPay аппаа нээж төлбөрөө баталгаажуулна."}</p>
          <p className="tabular display mt-2 text-3xl font-semibold">{mnt(order.pricing.total)}</p>
          <p className="mt-1 text-[var(--text-3)]">{`Хүчинтэй хугацаа: ${mm}:${ss}`}</p>
          <p className="mt-1 text-xs text-[var(--text-3)]">{`Лавлах код: ${order.payment.reference}`}</p>
          {qr && <ul className="mt-3 flex flex-wrap gap-1.5">{["Хаан банк", "Худалдаа хөгжлийн банк", "Голомт банк", "Төрийн банк", "М банк"].map((b) => <li key={b} className="badge badge-muted">{b}</li>)}</ul>}
        </div>
      </div>
      <button className="btn btn-primary btn-block mt-5 !min-h-12" onClick={paid} disabled={busy || left === 0} data-testid="simulate-pay">{busy ? <><Spinner className="size-4" /> Төлбөр шалгаж байна</> : left === 0 ? "Хугацаа дууссан" : "Төлбөр төлсөн гэж демо хийх"}</button>
      <p className="mt-2 text-center text-xs text-[var(--text-3)]">{`Энэ товч нь ${qr ? "QPay" : "SocialPay"} системийн төлбөр баталгаажсан мэдэгдлийг дуурайна. Бодит интеграцид банк өөрөө төлбөрийг баталгаажуулна.`}</p>
      <span className="hidden">{providers[m].label}</span>
    </div>
  );
}
