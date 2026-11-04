"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Banknote, Building2, Check, CreditCard, Lock, MapPin, ShoppingBag, Smartphone, Store, Truck, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { mnt, quoteDelivery } from "@/lib/pricing";
import { useQuote } from "@/lib/use-quote";
import { PROVINCES, UB_DISTRICTS } from "@/lib/data/seed";
import { checkoutSchema, fieldErrors, type FieldErrors } from "@/lib/validation";
import { generateOrderNumber } from "@/lib/order-number";
import { getProvider, paymentMeta } from "@/lib/payments/registry";
import { RepositoryError } from "@/lib/data/repository";
import type { DeliveryMethod, OrderItem, PaymentMethod } from "@/lib/types";
import { ProductPicture } from "../product-art";
import { EmptyState, Field, Spinner } from "../ui/bits";
import { CouponBox } from "../cart/coupon-box";
import { SummaryRows } from "../cart/summary";
import { SHIP_KEY } from "../cart/cart-page";

const payIcon: Record<PaymentMethod, typeof CreditCard> = { qpay: Smartphone, socialpay: CreditCard, bank: Building2, cod: Banknote };

export function Checkout() {
  const { ready, customer, repo, delivery, clearCart, appliedCoupon, toast, cart } = useStore();
  const router = useRouter();
  const [f, setF] = useState({ name: "", phone: "", email: "", city: "Улаанбаатар", district: "", khoroo: "", detail: "", notes: "" });
  const [method, setMethod] = useState<DeliveryMethod>("standard");
  const [pickupPointId, setPickupPointId] = useState("pk1");
  const [payment, setPayment] = useState<PaymentMethod>("qpay");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const placed = useRef(false);
  const prefilled = useRef(false);

  const q = useQuote({ method, city: f.city, district: f.district });

  useEffect(() => {
    if (!ready || prefilled.current) return;
    prefilled.current = true;
    let ship: { district?: string; method?: string } | null = null;
    try { ship = JSON.parse(localStorage.getItem(SHIP_KEY) ?? "null"); } catch { /* ignore */ }
    const a = customer?.addresses.find((x) => x.isDefault) ?? customer?.addresses[0];
    setF((s) => ({
      ...s,
      name: customer?.name ?? s.name, phone: customer?.phone ?? s.phone, email: customer?.email ?? s.email,
      city: a?.city ?? s.city, district: a?.district || ship?.district || s.district, khoroo: a?.khoroo ?? s.khoroo, detail: a?.detail ?? s.detail,
    }));
    if (ship?.method === "express") setMethod("express");
  }, [ready, customer]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF((s) => ({ ...s, [k]: e.target.value, ...(k === "city" ? { district: "" } : {}) }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  if (!ready || !q || !delivery) return <div className="container-x py-12"><div className="skeleton h-10 w-48" /><div className="skeleton mt-8 h-96 w-full" /></div>;
  if (q.lines.length === 0 && !placed.current) {
    return <div className="container-x py-12"><EmptyState icon={<ShoppingBag className="size-7" />} title="Сагс хоосон байна" text="Захиалга хийхийн өмнө сагсандаа бараа нэмнэ үү." action={<Link href="/products" className="btn btn-primary mt-2">Дэлгүүр үзэх</Link>} /></div>;
  }

  const isUB = f.city === "Улаанбаатар";
  const sub = q.pricing.subtotal - q.pricing.couponDiscount;
  const free = q.coupon?.ok ? q.coupon.freeShipping : false;
  const opts = (["standard", "express", "pickup"] as const).map((m) => ({
    m, quote: quoteDelivery(delivery, { method: m, city: f.city, district: f.district, subtotalAfterDiscount: sub, freeShipping: free }),
  }));
  const meta: Record<DeliveryMethod, { title: string; icon: typeof Truck }> = { standard: { title: "Энгийн хүргэлт", icon: Truck }, express: { title: "Шуурхай хүргэлт", icon: Zap }, pickup: { title: "Салбараас очиж авах", icon: Store } };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !q || !delivery) return;
    setFormError("");
    const parsed = checkoutSchema.safeParse({ ...f, method, pickupPointId, payment });
    if (!parsed.success) {
      const er = fieldErrors(parsed.error);
      setErrors(er);
      setFormError("Маягтын тодорхойгүй талбарыг засна уу.");
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    if (!q.delivery.available) { setFormError(q.delivery.reason ?? "Хүргэлтийн сонголт боломжгүй байна."); return; }
    if (q.coupon && !q.coupon.ok) { setFormError(q.coupon.error); return; }
    const v = parsed.data;
    setBusy(true);
    try {
      const number = generateOrderNumber();
      const provider = getProvider(v.payment);
      const intent = await provider.createIntent({ orderNumber: number, amount: q.pricing.total, description: `Нийслэл Стор ${number}`, customerPhone: v.phone });
      const items: OrderItem[] = q.lines.map(({ line, product: p }) => ({
        productId: p.id, name: p.name, sku: p.sku, art: p.art, image: p.images[0], color: line.color, size: line.size,
        unitPrice: p.price, compareAtPrice: p.compareAtPrice, quantity: line.quantity,
      }));
      const pk = delivery.pickupPoints.find((x) => x.id === v.pickupPointId);
      const order = await repo.placeOrder({
        order: {
          number, customerId: customer?.id ?? null, contact: { name: v.name, phone: v.phone, email: v.email },
          shipping: {
            method: v.method, city: v.method === "pickup" ? "Улаанбаатар" : v.city, district: v.method === "pickup" ? "" : v.district, khoroo: v.khoroo,
            detail: v.method === "pickup" ? (pk?.address ?? "") : v.detail, notes: v.notes, pickupPointId: v.method === "pickup" ? v.pickupPointId : undefined,
            estimate: q.delivery.estimate, fee: q.pricing.deliveryFee,
          },
          items, pricing: q.pricing, couponCode: q.coupon?.ok ? q.coupon.coupon.code : null,
          payment: { method: v.payment, status: v.payment === "cod" ? "unpaid" : "awaiting", provider: intent.provider, reference: intent.reference, simulated: intent.simulated, paidAt: null },
        },
      });
      placed.current = true;
      clearCart();
      toast(`Захиалга ${order.number} амжилттай үүслээ.`);
      router.replace(`/order/${order.number}?new=1`);
    } catch (err) {
      const msg = err instanceof RepositoryError ? err.message : "Захиалга үүсгэх үед алдаа гарлаа. Дахин оролдоно уу.";
      setFormError(msg);
      toast(msg, "error");
      setBusy(false);
    }
  }

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl">Захиалга баталгаажуулах</h1>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]" data-testid="checkout-form">
        <div className="grid gap-6">
          {/* 1. Холбоо барих */}
          <section className="card p-5 md:p-7" aria-labelledby="s1">
            <h2 id="s1" className="mb-5 flex items-center gap-3 text-lg font-semibold"><span className="grid size-7 place-items-center rounded-full bg-[var(--ink)] text-sm text-[var(--on-ink)]">1</span>Захиалагчийн мэдээлэл</h2>
            {!customer && <p className="mb-4 rounded-xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-2)]">Бүртгэлтэй юу? <Link href="/account/login?next=/checkout" className="font-semibold text-[var(--accent)] underline">Нэвтрэх</Link>. Нэвтрэхгүйгээр ч захиалж болно.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Овог нэр" error={errors.name} htmlFor="name"><input id="name" className="input" autoComplete="name" value={f.name} onChange={set("name")} aria-invalid={!!errors.name} data-testid="f-name" /></Field>
              <Field label="Утасны дугаар" error={errors.phone} htmlFor="phone" hint="8 оронтой, жишээ: 99112233"><input id="phone" className="input" inputMode="tel" autoComplete="tel-national" value={f.phone} onChange={set("phone")} aria-invalid={!!errors.phone} data-testid="f-phone" /></Field>
              <div className="sm:col-span-2"><Field label="Имэйл" error={errors.email} htmlFor="email"><input id="email" type="email" className="input" inputMode="email" autoComplete="email" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} data-testid="f-email" /></Field></div>
            </div>
          </section>

          {/* 2. Хүргэлт */}
          <section className="card p-5 md:p-7" aria-labelledby="s2">
            <h2 id="s2" className="mb-5 flex items-center gap-3 text-lg font-semibold"><span className="grid size-7 place-items-center rounded-full bg-[var(--ink)] text-sm text-[var(--on-ink)]">2</span>Хүргэлт</h2>
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Хүргэлтийн төрөл">
              {opts.map(({ m, quote }) => {
                const Icon = meta[m].icon;
                const on = method === m;
                const disabled = m === "express" && !quote.available && !!quote.reason && quote.reason !== "Дүүргээ сонгоно уу.";
                return (
                  <button key={m} type="button" role="radio" aria-checked={on} disabled={disabled} onClick={() => setMethod(m)} data-testid={`ship-${m}`}
                    className={`relative rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-[var(--ink)] bg-[var(--surface-2)]" : "border-[var(--line)] hover:border-[var(--line-strong)]"}`}>
                    <Icon className="mb-2 size-5 text-[var(--accent)]" />
                    <p className="text-sm font-semibold">{meta[m].title}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-2)]">{quote.available ? quote.estimate : (quote.reason ?? "Дүүргээ сонгоно уу")}</p>
                    <p className="tabular mt-2 text-sm font-semibold">{quote.available ? (quote.fee === 0 ? "Үнэгүй" : mnt(quote.fee)) : "-"}</p>
                    {on && <Check className="absolute right-3 top-3 size-4" />}
                  </button>
                );
              })}
            </div>

            {method === "pickup" ? (
              <div className="mt-5 grid gap-3" role="radiogroup" aria-label="Салбар">
                {errors.pickupPointId && <p role="alert" className="field-error">{errors.pickupPointId}</p>}
                {delivery.pickupPoints.map((pk) => (
                  <label key={pk.id} className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 ${pickupPointId === pk.id ? "border-[var(--ink)]" : "border-[var(--line)]"}`}>
                    <input type="radio" name="pickup" className="mt-1 accent-[var(--accent)]" checked={pickupPointId === pk.id} onChange={() => setPickupPointId(pk.id)} />
                    <span className="text-sm"><b className="flex items-center gap-1.5"><MapPin className="size-4 text-[var(--accent)]" />{pk.name}</b><span className="mt-1 block text-[var(--text-2)]">{pk.address}</span><span className="block text-[var(--text-3)]">{pk.hours}</span></span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Хот, аймаг" htmlFor="city" error={errors.city}><select id="city" className="select" value={f.city} onChange={set("city")} data-testid="f-city"><option>Улаанбаатар</option>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>
                {isUB ? (
                  <Field label="Дүүрэг" htmlFor="district" error={errors.district}><select id="district" className="select" value={f.district} onChange={set("district")} aria-invalid={!!errors.district} data-testid="f-district"><option value="">Сонгоно уу</option>{UB_DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
                ) : (
                  <Field label="Сум, баг" htmlFor="district"><input id="district" className="input" value={f.district} onChange={set("district")} placeholder="Сумын нэр" /></Field>
                )}
                <Field label="Хороо, хороолол" htmlFor="khoroo"><input id="khoroo" className="input" value={f.khoroo} onChange={set("khoroo")} placeholder="Жишээ: 3 дугаар хороо" /></Field>
                <div className="sm:col-span-2"><Field label="Дэлгэрэнгүй хаяг" htmlFor="detail" error={errors.detail}><input id="detail" className="input" autoComplete="street-address" value={f.detail} onChange={set("detail")} placeholder="Байр, орц, давхар, тоот" aria-invalid={!!errors.detail} data-testid="f-detail" /></Field></div>
                <div className="sm:col-span-2"><Field label="Хүргэлтийн нэмэлт тайлбар (заавал биш)" htmlFor="notes" error={errors.notes} hint="Жишээ: орцны код, хүргэлтийн цаг"><textarea id="notes" className="textarea" value={f.notes} onChange={set("notes")} /></Field></div>
              </div>
            )}
          </section>

          {/* 3. Төлбөр */}
          <section className="card p-5 md:p-7" aria-labelledby="s3">
            <h2 id="s3" className="mb-2 flex items-center gap-3 text-lg font-semibold"><span className="grid size-7 place-items-center rounded-full bg-[var(--ink)] text-sm text-[var(--on-ink)]">3</span>Төлбөрийн хэлбэр</h2>
            <p className="mb-5 rounded-xl bg-[var(--warn-soft)] px-4 py-3 text-sm text-[var(--warn)]"><b>Демо төлбөр.</b> QPay, SocialPay нь жинхэнэ банк, төлбөрийн системтэй холбогдоогүй бөгөөд ямар ч мөнгө шилжихгүй.</p>
            <div className="grid gap-3" role="radiogroup" aria-label="Төлбөрийн хэлбэр">
              {paymentMeta.map((m) => {
                const Icon = payIcon[m.id];
                return (
                  <label key={m.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${payment === m.id ? "border-[var(--ink)] bg-[var(--surface-2)]" : "border-[var(--line)] hover:border-[var(--line-strong)]"}`}>
                    <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} className="size-5 accent-[var(--accent)]" data-testid={`pay-${m.id}`} />
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--surface-3)]"><Icon className="size-5" /></span>
                    <span className="min-w-0 flex-1"><b className="flex items-center gap-2 text-sm">{m.label}{m.badge && <span className="badge badge-warn">{m.badge}</span>}</b><span className="block text-xs text-[var(--text-2)]">{m.description}</span></span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Хураангуй */}
        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card p-5 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Таны захиалга</h2>
            <ul className="mb-5 max-h-72 divide-y divide-[var(--line)] overflow-y-auto" data-testid="checkout-lines">
              {q.lines.map(({ line, product: p }) => (
                <li key={line.key} className="flex gap-3 py-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg"><ProductPicture image={p.images[0]} kind={p.art} color={p.colors.find((c) => c.name === line.color)?.hex ?? p.colors[0]?.hex} className="size-full" /><span className="absolute -right-0 -top-0 grid min-w-5 place-items-center rounded-bl-lg bg-[var(--ink)] px-1 text-[11px] font-bold text-[var(--on-ink)]">{line.quantity}</span></div>
                  <div className="min-w-0 flex-1 text-sm"><p className="line-clamp-2 font-medium">{p.name}</p><p className="text-xs text-[var(--text-3)]">{[line.color, line.size].filter(Boolean).join(" · ")}</p></div>
                  <p className="tabular text-sm font-semibold">{mnt(p.price * line.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="mb-5"><CouponBox subtotal={q.pricing.subtotal} error={q.coupon && !q.coupon.ok ? q.coupon.error : undefined} /></div>
            <SummaryRows pricing={q.pricing} couponCode={appliedCoupon} deliveryLabel={q.delivery.available ? undefined : "Тооцоолох боломжгүй"} />
            {q.delivery.available && <p className="mt-3 flex items-center gap-2 text-xs text-[var(--text-2)]"><Truck className="size-4" />{`Хүргэлт: ${q.delivery.estimate}`}</p>}
            {formError && <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]" data-testid="form-error">{formError}</p>}
            <button className="btn btn-accent btn-block mt-5 !min-h-13" disabled={busy || cart.length === 0} data-testid="place-order">{busy ? <><Spinner className="size-4" /> Боловсруулж байна</> : <>Захиалга өгөх · {mnt(q.pricing.total)}</>}</button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--text-3)]"><Lock className="size-3.5" />Демо захиалга: бодит гүйлгээ хийгдэхгүй</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
