"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, MapPin, PackageSearch, Phone, Printer } from "lucide-react";
import { useStore } from "@/lib/store";
import { mnt } from "@/lib/pricing";
import { METHOD_LABEL, PAYMENT_LABEL, PAYMENT_TONE, SHIP_LABEL, STATUS_LABEL, STATUS_TONE, fmtDate, useOrder } from "@/lib/use-order";
import { phoneSchema } from "@/lib/validation";
import { ProductPicture } from "../product-art";
import { EmptyState, Field } from "../ui/bits";
import { SummaryRows } from "../cart/summary";
import { PaymentPanel } from "./payment-panel";
import { Timeline } from "./tracking";
import type { Order } from "@/lib/types";

const ACCESS_KEY = "niislel:order-access";
export function grantOrderAccess(number: string) {
  try {
    const l: string[] = JSON.parse(sessionStorage.getItem(ACCESS_KEY) ?? "[]");
    if (!l.includes(number)) sessionStorage.setItem(ACCESS_KEY, JSON.stringify([...l, number]));
  } catch { /* ignore */ }
}
function hasAccess(number: string) {
  try { return (JSON.parse(sessionStorage.getItem(ACCESS_KEY) ?? "[]") as string[]).includes(number); } catch { return false; }
}

function Verify({ order, onOk }: { order: Order; onOk: () => void }) {
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    const r = phoneSchema.safeParse(phone);
    if (!r.success) return setErr(r.error.issues[0].message);
    const norm = order.contact.phone.replace(/\D/g, "").slice(-8);
    if (r.data !== norm) return setErr("Утасны дугаар захиалгатай таарахгүй байна.");
    grantOrderAccess(order.number);
    onOk();
  }
  return (
    <form onSubmit={submit} noValidate className="card mx-auto max-w-md p-6">
      <h2 className="text-lg font-semibold">Баталгаажуулалт</h2>
      <p className="mb-4 mt-1 text-sm text-[var(--text-2)]">Захиалгын мэдээллийг харахын тулд захиалгад ашигласан утасны дугаараа оруулна уу.</p>
      <Field label="Утасны дугаар" error={err} htmlFor="v-phone"><input id="v-phone" className="input" inputMode="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErr(""); }} aria-invalid={!!err} data-testid="verify-phone" /></Field>
      <button className="btn btn-primary btn-block mt-4" data-testid="verify-submit">Харах</button>
    </form>
  );
}

export function OrderView({ number, isNew }: { number: string; isNew: boolean }) {
  const { customer, ready } = useStore();
  const order = useOrder(number);
  const [ok, setOk] = useState(false);
  useEffect(() => { if (isNew) grantOrderAccess(number); setOk(hasAccess(number)); }, [number, isNew]);

  if (!ready || order === undefined) return <div className="container-x py-12"><div className="skeleton h-10 w-64" /><div className="skeleton mt-8 h-80" /></div>;
  if (order === null) return <div className="container-x py-12"><EmptyState icon={<PackageSearch className="size-7" />} title="Захиалга олдсонгүй" text={`${number} дугаартай захиалга байхгүй байна. Дугаараа дахин шалгана уу.`} action={<Link href="/track" className="btn btn-primary mt-2">Дахин хайх</Link>} /></div>;
  const owner = !!customer && order.customerId === customer.id;
  if (!owner && !ok) return <div className="container-x py-12"><Verify order={order} onOk={() => setOk(true)} /></div>;

  const addr = order.shipping.method === "pickup" ? order.shipping.detail : [order.shipping.city, order.shipping.district, order.shipping.khoroo, order.shipping.detail].filter(Boolean).join(", ");
  return (
    <div className="container-x py-8 md:py-12">
      {isNew && (
        <div className="anim-rise mb-8 rounded-3xl bg-[var(--success-soft)] p-6 text-center md:p-10" data-testid="confirmation">
          <CheckCircle2 className="anim-pop mx-auto size-14 text-[var(--success)]" />
          <h1 className="mt-4 text-3xl md:text-4xl">Захиалга баярлалаа!</h1>
          <p className="mt-2 text-[var(--text-2)]">Таны захиалгыг хүлээн авлаа. Захиалгын дугаар:</p>
          <p className="display tabular mt-1 text-3xl font-semibold tracking-wide" data-testid="order-number">{order.number}</p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--text-2)]">{`Баталгаажуулах мэдээллийг ${order.contact.email} хаягт илгээнэ (демо дэлгүүр тул бодит имэйл явахгүй).`}</p>
        </div>
      )}
      {!isNew && <h1 className="mb-6 text-3xl md:text-4xl">{`Захиалга ${order.number}`}</h1>}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className={`badge ${STATUS_TONE[order.status]}`} data-testid="order-status">{STATUS_LABEL[order.status]}</span>
        <span className={`badge ${PAYMENT_TONE[order.payment.status]}`} data-testid="payment-status">{PAYMENT_LABEL[order.payment.status]}</span>
        <span className="text-sm text-[var(--text-3)]">{fmtDate(order.createdAt)}</span>
        <button onClick={() => window.print()} className="btn btn-ghost btn-sm ml-auto print:hidden"><Printer className="size-4" />Хэвлэх</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="grid gap-6">
          {order.payment.status !== "paid" && order.status !== "cancelled" && <PaymentPanel order={order} />}
          {order.payment.status === "paid" && order.payment.method !== "cod" && <PaymentPanel order={order} />}
          <section className="card p-5 md:p-7"><h2 className="mb-5 text-lg font-semibold">Захиалгын явц</h2><Timeline order={order} /></section>
          <section className="card p-5 md:p-7">
            <h2 className="mb-4 text-lg font-semibold">Бараа</h2>
            <ul className="divide-y divide-[var(--line)]" data-testid="order-items">
              {order.items.map((it, i) => (
                <li key={i} className="flex gap-4 py-3">
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg"><ProductPicture image={it.image} kind={it.art} className="size-full" /></div>
                  <div className="min-w-0 flex-1 text-sm"><p className="font-medium">{it.name}</p><p className="text-xs text-[var(--text-3)]">{[it.color, it.size, `${it.quantity} ширхэг`].filter(Boolean).join(" · ")}</p></div>
                  <p className="tabular text-sm font-semibold">{mnt(it.unitPrice * it.quantity)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="grid h-fit gap-6">
          <section className="card p-5 md:p-6"><h2 className="mb-4 text-lg font-semibold">Төлбөрийн дүн</h2><SummaryRows pricing={order.pricing} couponCode={order.couponCode} /><p className="mt-4 text-xs text-[var(--text-3)]">{`Төлбөр: ${METHOD_LABEL[order.payment.method]}${order.payment.simulated ? " (демо)" : ""}`}</p></section>
          <section className="card p-5 md:p-6 text-sm">
            <h2 className="mb-3 text-lg font-semibold">Хүргэлт</h2>
            <p className="font-medium">{SHIP_LABEL[order.shipping.method]}</p>
            <p className="mt-1 text-[var(--text-2)]">{order.shipping.estimate}</p>
            <p className="mt-3 flex gap-2 text-[var(--text-2)]"><MapPin className="mt-0.5 size-4 shrink-0" />{addr}</p>
            {order.shipping.notes && <p className="mt-2 text-[var(--text-3)]">{`Тайлбар: ${order.shipping.notes}`}</p>}
            <p className="mt-3 flex gap-2 text-[var(--text-2)]"><Phone className="mt-0.5 size-4 shrink-0" />{`${order.contact.name}, ${order.contact.phone}`}</p>
          </section>
          <Link href="/products" className="btn btn-ghost print:hidden">Дэлгүүр хэсэх</Link>
        </aside>
      </div>
    </div>
  );
}
