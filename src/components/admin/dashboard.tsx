"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAdminData } from "@/lib/use-admin-data";
import { mnt } from "@/lib/pricing";
import { STATUS_LABEL, STATUS_TONE, fmtDate } from "@/lib/use-order";
import { PageHeader, Stat } from "./admin-ui";
import type { Order } from "@/lib/types";

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function RevenueChart({ data }: { data: { label: string; value: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 720, H = 220, P = { l: 8, r: 8, t: 16, b: 28 };
  const bw = (W - P.l - P.r) / data.length;
  const h = hover != null ? data[hover] : null;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Сүүлийн 14 хоногийн орлогын график">
        {[0.25, 0.5, 0.75, 1].map((t) => <line key={t} x1={P.l} x2={W - P.r} y1={P.t + (H - P.t - P.b) * (1 - t)} y2={P.t + (H - P.t - P.b) * (1 - t)} stroke="var(--line)" strokeDasharray="3 4" />)}
        {data.map((d, i) => {
          const bh = ((H - P.t - P.b) * d.value) / max;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.label}: ${mnt(d.value)}, ${d.orders} захиалга`}>
              <rect x={P.l + i * bw} y={0} width={bw} height={H} fill="transparent" />
              <rect x={P.l + i * bw + bw * 0.18} y={H - P.b - bh} width={bw * 0.64} height={Math.max(bh, d.value ? 2 : 0)} rx="4" fill={hover === i ? "var(--accent)" : "var(--ink)"} opacity={hover == null || hover === i ? 1 : 0.35} />
              {i % 2 === 0 && <text x={P.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--text-3)">{d.label}</text>}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 min-h-6 text-sm" aria-live="polite">{h ? <span><b>{h.label}</b>: <span className="tabular">{mnt(h.value)}</span>, {h.orders} захиалга</span> : <span className="text-[var(--text-3)]">Баганын дээр очиж дэлгэрэнгүйг үзнэ үү</span>}</div>
    </div>
  );
}

export function Dashboard() {
  const { products, categories } = useStore();
  const d = useAdminData();
  const m = useMemo(() => {
    if (!d) return null;
    const live = d.orders.filter((o) => o.status !== "cancelled");
    const revenue = live.reduce((s, o) => s + o.pricing.total, 0);
    const paid = live.filter((o) => o.payment.status === "paid").reduce((s, o) => s + o.pricing.total, 0);
    const days: { label: string; value: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000);
      const k = dayKey(dt);
      const day = live.filter((o) => dayKey(new Date(o.createdAt)) === k);
      days.push({ label: `${dt.getMonth() + 1}/${dt.getDate()}`, value: day.reduce((s, o) => s + o.pricing.total, 0), orders: day.length });
    }
    const status = (Object.keys(STATUS_LABEL) as Order["status"][]).map((s) => ({ s, n: d.orders.filter((o) => o.status === s).length }));
    const sold = new Map<string, { name: string; qty: number; rev: number }>();
    live.forEach((o) => o.items.forEach((i) => { const x = sold.get(i.productId) ?? { name: i.name, qty: 0, rev: 0 }; x.qty += i.quantity; x.rev += i.quantity * i.unitPrice; sold.set(i.productId, x); }));
    const catRev = categories.map((c) => ({ c, rev: live.reduce((s, o) => s + o.items.filter((i) => products.find((p) => p.id === i.productId)?.categoryId === c.id).reduce((a, i) => a + i.unitPrice * i.quantity, 0), 0) })).sort((a, b) => b.rev - a.rev);
    return { revenue, paid, days, status, top: [...sold.values()].sort((a, b) => b.rev - a.rev).slice(0, 5), pending: d.orders.filter((o) => o.status === "pending").length, catRev, avg: live.length ? revenue / live.length : 0 };
  }, [d, products, categories]);

  if (!d || !m) return <div className="grid gap-4"><div className="skeleton h-10 w-64" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-24" />)}</div></div>;
  const low = products.filter((p) => p.stock <= p.lowStockThreshold).sort((a, b) => a.stock - b.stock).slice(0, 6);
  const maxCat = Math.max(1, ...m.catRev.map((c) => c.rev));

  return (
    <>
      <PageHeader title="Хяналтын самбар" subtitle="Дэлгүүрийн ерөнхий үзүүлэлт, сүүлийн 14 хоногийн борлуулалт." />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3" data-testid="kpis">
        <Stat label="Нийт борлуулалт" value={mnt(m.revenue)} hint={`Төлөгдсөн: ${mnt(m.paid)}`} />
        <Stat label="Нийт захиалга" value={String(d.orders.length)} hint={`Дундаж: ${mnt(m.avg)}`} />
        <Stat label="Хүлээгдэж буй захиалга" value={String(m.pending)} tone={m.pending ? "text-[var(--warn)]" : ""} hint="Баталгаажуулах шаардлагатай" />
        <Stat label="Бүтээгдэхүүн" value={String(products.length)} hint={`${products.filter((p) => p.visible).length} харагдаж байна`} />
        <Stat label="Харилцагч" value={String(d.customers.length)} />
        <Stat label="Нөөц багатай" value={String(products.filter((p) => p.stock <= p.lowStockThreshold).length)} tone={low.length ? "text-[var(--danger)]" : ""} hint="5 ширхэг ба түүнээс бага" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card p-5"><h2 className="mb-4 flex items-center gap-2 font-semibold"><TrendingUp className="size-4 text-[var(--accent)]" />Орлого, сүүлийн 14 хоног</h2><RevenueChart data={m.days} /></section>
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Захиалгын төлөв</h2>
          <ul className="grid gap-2.5">{m.status.map(({ s, n }) => <li key={s} className="flex items-center justify-between text-sm"><span className={`badge ${STATUS_TONE[s]}`}>{STATUS_LABEL[s]}</span><span className="tabular font-semibold">{n}</span></li>)}</ul>
        </section>
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Ангиллаар борлуулалт</h2>
          <ul className="grid gap-3">{m.catRev.map(({ c, rev }) => <li key={c.id} className="text-sm"><div className="mb-1 flex justify-between"><span>{c.name}</span><span className="tabular text-[var(--text-2)]">{mnt(rev)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--ink)]" style={{ width: `${(rev / maxCat) * 100}%` }} /></div></li>)}</ul>
        </section>
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Шилдэг бүтээгдэхүүн</h2>
          <ol className="grid gap-3 text-sm">{m.top.map((t, i) => <li key={t.name} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-[var(--surface-3)] text-xs font-bold">{i + 1}</span><span className="min-w-0 flex-1 truncate">{t.name}</span><span className="tabular text-[var(--text-2)]">{`${t.qty} ш`}</span></li>)}</ol>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Сүүлийн захиалгууд</h2><Link href="/admin/orders" className="text-sm font-semibold text-[var(--accent)]">Бүгд</Link></div>
          <ul className="divide-y divide-[var(--line)]">{d.orders.slice(0, 6).map((o) => <li key={o.id}><Link href={`/admin/orders/${o.number}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-[var(--accent)]"><span><b className="tabular">{o.number}</b><span className="block text-xs text-[var(--text-3)]">{`${o.contact.name} · ${fmtDate(o.createdAt)}`}</span></span><span className="text-right"><span className="tabular block font-semibold">{mnt(o.pricing.total)}</span><span className={`badge ${STATUS_TONE[o.status]}`}>{STATUS_LABEL[o.status]}</span></span></Link></li>)}</ul>
        </section>
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4 text-[var(--warn)]" />Нөөц багатай</h2><Link href="/admin/inventory" className="text-sm font-semibold text-[var(--accent)]">Нөөц удирдах</Link></div>
          {low.length === 0 ? <p className="text-sm text-[var(--text-2)]">Нөөц багатай бараа байхгүй.</p> : <ul className="divide-y divide-[var(--line)]">{low.map((p) => <li key={p.id} className="flex items-center justify-between py-3 text-sm"><span className="truncate pr-3">{p.name}</span><span className={`badge ${p.stock === 0 ? "badge-danger" : "badge-warn"}`}>{p.stock === 0 ? "Дууссан" : `${p.stock} ширхэг`}</span></li>)}</ul>}
        </section>
      </div>
    </>
  );
}
