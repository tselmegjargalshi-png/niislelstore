import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { discountPercent, mnt } from "@/lib/pricing";

export function Price({ price, compareAt, size = "md" }: { price: number; compareAt?: number | null; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={`${cls} tabular font-semibold`}>{mnt(price)}</span>
      {compareAt && compareAt > price ? <span className="tabular text-sm text-[var(--text-3)] line-through">{mnt(compareAt)}</span> : null}
    </span>
  );
}

export function DiscountBadge({ price, compareAt }: { price: number; compareAt?: number | null }) {
  const p = discountPercent(price, compareAt);
  return p ? <span className="badge badge-accent">{`${p}% хямдрал`}</span> : null;
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-2)]" aria-label={`Үнэлгээ ${rating} 5 оноос`}>
      <Star className="size-3.5 fill-[var(--gold)] text-[var(--gold)]" />
      <span className="tabular font-semibold text-[var(--text)]">{rating.toFixed(1)}</span>
      {count != null && <span>{`(${count})`}</span>}
    </span>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--text-3)]">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="max-w-sm text-sm text-[var(--text-2)]">{text}</p>}
      {action}
    </div>
  );
}

export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <span className="field-error" role="alert">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-2xl md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className = "size-5" }: { className?: string }) {
  return <span className={`${className} inline-block animate-spin rounded-full border-2 border-current border-t-transparent`} aria-hidden="true" />;
}
