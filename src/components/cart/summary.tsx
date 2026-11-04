import { mnt } from "@/lib/pricing";
import type { Pricing } from "@/lib/types";

export function SummaryRows({ pricing, deliveryLabel, couponCode }: { pricing: Pricing; deliveryLabel?: string; couponCode?: string | null }) {
  const Row = ({ k, v, tone, id }: { k: string; v: string; tone?: string; id?: string }) => (
    <div className="flex items-baseline justify-between gap-4 text-sm"><dt className="text-[var(--text-2)]">{k}</dt><dd data-testid={id} className={`tabular font-medium ${tone ?? ""}`}>{v}</dd></div>
  );
  return (
    <dl className="grid gap-2.5">
      <Row k="Барааны дүн" v={mnt(pricing.subtotal)} id="sum-subtotal" />
      {pricing.itemSavings > 0 && <Row k="Барааны хямдралаар хэмнэсэн" v={mnt(pricing.itemSavings)} tone="text-[var(--text-3)]" id="sum-savings" />}
      {pricing.couponDiscount > 0 && <Row k={`Купоны хөнгөлөлт${couponCode ? ` (${couponCode})` : ""}`} v={`−${mnt(pricing.couponDiscount)}`} tone="text-[var(--success)]" id="sum-discount" />}
      <Row k="Хүргэлт" v={deliveryLabel ?? (pricing.deliveryFee === 0 ? "Үнэгүй" : mnt(pricing.deliveryFee))} id="sum-delivery" />
      <div className="mt-1 flex items-baseline justify-between border-t border-[var(--line)] pt-4"><dt className="font-semibold">Нийт төлөх дүн</dt><dd className="tabular display text-2xl font-semibold" data-testid="sum-total">{mnt(pricing.total)}</dd></div>
    </dl>
  );
}
