"use client";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cartKey, useCartLines, useStore } from "@/lib/store";
import { lineSubtotal, mnt } from "@/lib/pricing";
import { ProductPicture } from "./product-art";
import { EmptyState } from "./ui/bits";

export function CartDrawer() {
  const { cartOpen, setCartOpen, setQuantity, removeFromCart, delivery } = useStore();
  const lines = useCartLines();
  const subtotal = useMemo(() => lineSubtotal(lines.map(({ line, product }) => ({ unitPrice: product.price, quantity: line.quantity }))), [lines]);
  const threshold = delivery?.freeShippingThreshold ?? 0;

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;
  const remaining = Math.max(0, threshold - subtotal);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Сагс">
      <div className="absolute inset-0 bg-black/50" style={{ animation: "fade-in .2s both" }} onClick={() => setCartOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--bg)] shadow-[var(--shadow-lg)]" style={{ animation: "slide-in .28s cubic-bezier(.2,.8,.3,1) both" }}>
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 className="text-lg font-semibold">{`Миний сагс (${lines.reduce((s, l) => s + l.line.quantity, 0)})`}</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Хаах" className="grid size-10 place-items-center rounded-full hover:bg-[var(--surface-2)]"><X className="size-5" /></button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 items-center p-5">
            <div className="w-full">
              <EmptyState icon={<ShoppingBag className="size-7" />} title="Сагс хоосон байна" text="Танд таалагдсан бараагаа сагсандаа нэмээрэй."
                action={<Link href="/products" onClick={() => setCartOpen(false)} className="btn btn-primary mt-2">Дэлгүүр үзэх</Link>} />
            </div>
          </div>
        ) : (
          <>
            {threshold > 0 && (
              <div className="border-b border-[var(--line)] bg-[var(--gold-soft)] px-5 py-3 text-sm">
                {remaining > 0 ? <p>{`Дахин ${mnt(remaining)} нэмбэл Улаанбаатарт хүргэлт үнэгүй.`}</p> : <p className="font-medium text-[var(--success)]">Танд үнэгүй хүргэлт олгогдлоо.</p>}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--gold)] transition-all" style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }} /></div>
              </div>
            )}
            <ul className="flex-1 divide-y divide-[var(--line)] overflow-y-auto px-5">
              {lines.map(({ line, product: p }) => {
                const color = p.colors.find((c) => c.name === line.color);
                return (
                  <li key={cartKey(line.productId, line.color, line.size)} className="flex gap-3 py-4" data-testid="cart-line">
                    <Link href={`/products/${p.slug}`} onClick={() => setCartOpen(false)} className="size-20 shrink-0 overflow-hidden rounded-xl">
                      <ProductPicture image={p.images[0]} kind={p.art} color={color?.hex ?? p.colors[0]?.hex} alt={p.name} className="size-full" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link href={`/products/${p.slug}`} onClick={() => setCartOpen(false)} className="line-clamp-2 text-sm font-medium">{p.name}</Link>
                        <button onClick={() => removeFromCart(line.key)} aria-label={`${p.name} сагснаас хасах`} className="text-[var(--text-3)] hover:text-[var(--danger)]"><Trash2 className="size-4" /></button>
                      </div>
                      <p className="text-xs text-[var(--text-3)]">{[line.color, line.size].filter(Boolean).join(" · ")}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-full border border-[var(--line-strong)]">
                          <button className="grid size-9 place-items-center" aria-label="Нэгээр хасах" onClick={() => line.quantity > 1 ? setQuantity(line.key, line.quantity - 1) : removeFromCart(line.key)}><Minus className="size-3.5" /></button>
                          <span className="tabular w-7 text-center text-sm font-medium" data-testid="line-qty">{line.quantity}</span>
                          <button className="grid size-9 place-items-center" aria-label="Нэгээр нэмэх" onClick={() => setQuantity(line.key, line.quantity + 1)}><Plus className="size-3.5" /></button>
                        </div>
                        <span className="tabular text-sm font-semibold">{mnt(p.price * line.quantity)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-[var(--line)] bg-[var(--surface)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="mb-1 flex items-center justify-between text-sm"><span className="text-[var(--text-2)]">Дүн</span><span className="tabular text-lg font-semibold" data-testid="drawer-subtotal">{mnt(subtotal)}</span></div>
              <p className="mb-4 text-xs text-[var(--text-3)]">Хүргэлт, купоны хөнгөлөлтийг дараагийн алхамд тооцно.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={() => setCartOpen(false)} className="btn btn-ghost">Сагс үзэх</Link>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn btn-accent" data-testid="drawer-checkout">Захиалах</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
