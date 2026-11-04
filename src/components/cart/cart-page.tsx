"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { mnt } from "@/lib/pricing";
import { useQuote } from "@/lib/use-quote";
import { UB_DISTRICTS } from "@/lib/data/seed";
import { ProductPicture } from "../product-art";
import { EmptyState } from "../ui/bits";
import { CouponBox } from "./coupon-box";
import { SummaryRows } from "./summary";

export const SHIP_KEY = "niislel:ship";

export function CartPage() {
  const { ready, setQuantity, removeFromCart, appliedCoupon, setAppliedCoupon } = useStore();
  const [district, setDistrict] = useState("Сүхбаатар");
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const q = useQuote({ method, city: "Улаанбаатар", district });

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(SHIP_KEY) ?? "null"); if (s?.district) setDistrict(s.district); if (s?.method === "express") setMethod("express"); } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem(SHIP_KEY, JSON.stringify({ district, method })); } catch { /* ignore */ } }, [district, method]);

  if (!ready || !q) return <div className="container-x py-12"><div className="skeleton h-10 w-48" /><div className="skeleton mt-8 h-64 w-full" /></div>;
  const lines = q.lines;
  const couponErr = q.coupon && !q.coupon.ok ? q.coupon.error : undefined;

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl">Миний сагс</h1>
      {lines.length === 0 ? (
        <div className="mt-8"><EmptyState icon={<ShoppingBag className="size-7" />} title="Сагс хоосон байна" text="Дэлгүүрээс таалагдсан бараагаа сонгоод сагсандаа нэмээрэй." action={<Link href="/products" className="btn btn-primary mt-2">Дэлгүүр үзэх</Link>} /></div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <ul className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 md:px-6" data-testid="cart-page-lines">
            {lines.map(({ line, product: p }) => {
              const color = p.colors.find((c) => c.name === line.color);
              const over = line.quantity > p.stock;
              return (
                <li key={line.key} className="flex gap-4 py-5">
                  <Link href={`/products/${p.slug}`} className="size-24 shrink-0 overflow-hidden rounded-xl md:size-28"><ProductPicture image={p.images[0]} kind={p.art} color={color?.hex ?? p.colors[0]?.hex} alt={p.name} className="size-full" /></Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div><Link href={`/products/${p.slug}`} className="font-medium hover:text-[var(--accent)]">{p.name}</Link><p className="mt-0.5 text-sm text-[var(--text-3)]">{[line.color, line.size].filter(Boolean).join(" · ")}</p></div>
                      <button onClick={() => removeFromCart(line.key)} aria-label={`${p.name} сагснаас хасах`} className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--text-3)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"><Trash2 className="size-4" /></button>
                    </div>
                    {over && <p className="mt-1 text-sm font-medium text-[var(--danger)]" role="alert">{`Үлдэгдэл ${p.stock} ширхэг байна. Тоог багасгана уу.`}</p>}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="inline-flex items-center rounded-full border border-[var(--line-strong)]">
                        <button className="grid size-10 place-items-center" aria-label="Нэгээр хасах" onClick={() => line.quantity > 1 ? setQuantity(line.key, line.quantity - 1) : removeFromCart(line.key)}><Minus className="size-4" /></button>
                        <span className="tabular w-8 text-center font-semibold" data-testid="page-qty">{line.quantity}</span>
                        <button className="grid size-10 place-items-center" aria-label="Нэгээр нэмэх" onClick={() => setQuantity(line.key, line.quantity + 1)}><Plus className="size-4" /></button>
                      </div>
                      <div className="text-right"><p className="tabular font-semibold" data-testid="line-total">{mnt(p.price * line.quantity)}</p>{line.quantity > 1 && <p className="tabular text-xs text-[var(--text-3)]">{`${mnt(p.price)} x ${line.quantity}`}</p>}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="card h-fit p-5 md:p-6 lg:sticky lg:top-28">
            <h2 className="mb-5 text-lg font-semibold">Захиалгын дүн</h2>
            <div className="mb-5 grid gap-3 rounded-xl bg-[var(--surface-2)] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold"><Truck className="size-4 text-[var(--accent)]" />Хүргэлтийн тооцоо</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="sr-only" htmlFor="cart-district">Дүүрэг</label>
                <select id="cart-district" value={district} onChange={(e) => setDistrict(e.target.value)} className="select !min-h-10 text-sm" data-testid="cart-district">{UB_DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
                <label className="sr-only" htmlFor="cart-method">Хүргэлтийн төрөл</label>
                <select id="cart-method" value={method} onChange={(e) => setMethod(e.target.value as "standard" | "express")} className="select !min-h-10 text-sm"><option value="standard">Энгийн</option><option value="express">Шуурхай</option></select>
              </div>
              <p className="text-xs text-[var(--text-2)]">{q.delivery.available ? q.delivery.estimate : q.delivery.reason}</p>
            </div>
            <div className="mb-5"><CouponBox subtotal={q.pricing.subtotal} error={couponErr} /></div>
            {appliedCoupon && couponErr && <button className="mb-3 text-sm underline" onClick={() => setAppliedCoupon(null)}>Хүчингүй купоныг хасах</button>}
            <SummaryRows pricing={q.pricing} couponCode={q.coupon?.ok ? q.coupon.coupon.code : null} deliveryLabel={q.delivery.available ? undefined : "Тооцоолох боломжгүй"} />
            <Link href="/checkout" className="btn btn-accent btn-block mt-6 !min-h-12" data-testid="go-checkout">Захиалга баталгаажуулах</Link>
            <Link href="/products" className="mt-3 block text-center text-sm text-[var(--text-2)] underline-offset-4 hover:underline">Дэлгүүр хэсэх</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
