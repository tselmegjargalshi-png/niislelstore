"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus, Search, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAdminData } from "@/lib/use-admin-data";
import { mnt } from "@/lib/pricing";
import { STATUS_LABEL, STATUS_TONE, fmtDate } from "@/lib/use-order";
import { RepositoryError } from "@/lib/data/repository";
import { EmptyState } from "../ui/bits";
import { PageHeader, useAdmin } from "./admin-ui";

export function AdminCustomers() {
  const d = useAdminData();
  const [q, setQ] = useState("");
  const rows = useMemo(() => (d?.customers ?? []).map((c) => {
    const os = d!.orders.filter((o) => o.customerId === c.id);
    return { c, n: os.length, spent: os.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.pricing.total, 0), last: os[0]?.createdAt };
  }).filter(({ c }) => { const s = q.trim().toLocaleLowerCase("mn"); return !s || `${c.name} ${c.email} ${c.phone}`.toLocaleLowerCase("mn").includes(s); }).sort((a, b) => b.spent - a.spent), [d, q]);
  return (
    <>
      <PageHeader title="Харилцагч" subtitle={d ? `Нийт ${d.customers.length} бүртгэлтэй харилцагч` : undefined} />
      <label className="relative mb-4 block max-w-md"><span className="sr-only">Хайх</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-3)]" /><input className="input !pl-10" placeholder="Нэр, имэйл, утсаар хайх" value={q} onChange={(e) => setQ(e.target.value)} data-testid="admin-customer-search" /></label>
      {!d ? <div className="skeleton h-80" /> : rows.length === 0 ? <EmptyState icon={<Users className="size-7" />} title="Харилцагч олдсонгүй" /> : (
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm" data-testid="customers-table">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--text-2)]"><tr><th className="p-3 font-semibold">Харилцагч</th><th className="p-3 font-semibold">Утас</th><th className="p-3 text-right font-semibold">Захиалга</th><th className="p-3 text-right font-semibold">Нийт худалдан авалт</th><th className="p-3 font-semibold">Сүүлийн захиалга</th></tr></thead>
          <tbody className="divide-y divide-[var(--line)]">{rows.map(({ c, n, spent, last }) => <tr key={c.id} className="hover:bg-[var(--surface-2)]/60"><td className="p-3"><Link href={`/admin/customers/${c.id}`} className="font-semibold text-[var(--accent)] hover:underline">{c.name}</Link><p className="text-xs text-[var(--text-3)]">{c.email}</p></td><td className="p-3 text-[var(--text-2)]">{c.phone}</td><td className="tabular p-3 text-right">{n}</td><td className="tabular p-3 text-right font-semibold">{mnt(spent)}</td><td className="p-3 text-[var(--text-2)]">{last ? fmtDate(last) : "-"}</td></tr>)}</tbody>
        </table></div></div>
      )}
    </>
  );
}

export function AdminCustomerDetail({ id }: { id: string }) {
  const d = useAdminData();
  if (!d) return <div className="skeleton h-80" />;
  const c = d.customers.find((x) => x.id === id);
  if (!c) return <EmptyState icon={<Users className="size-7" />} title="Харилцагч олдсонгүй" action={<Link href="/admin/customers" className="btn btn-primary mt-2">Жагсаалт руу</Link>} />;
  const os = d.orders.filter((o) => o.customerId === c.id);
  const spent = os.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.pricing.total, 0);
  return (
    <>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--text)]"><ArrowLeft className="size-4" />Бүх харилцагч</Link>
      <PageHeader title={c.name} subtitle={`Бүртгүүлсэн: ${new Date(c.createdAt).toLocaleDateString("mn-MN")}`} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="grid h-fit gap-6">
          <section className="card p-5 text-sm"><h2 className="mb-3 font-semibold">Холбоо барих</h2><p>{c.email}</p><p className="text-[var(--text-2)]">{c.phone}</p><p className="mt-3 text-xs text-[var(--text-3)]">{c.marketingOptIn ? "Маркетингийн имэйл авахыг зөвшөөрсөн" : "Маркетингийн имэйл авахыг зөвшөөрөөгүй"}</p></section>
          <section className="card p-5 text-sm"><h2 className="mb-3 font-semibold">Хаягууд</h2>{c.addresses.length === 0 ? <p className="text-[var(--text-2)]">Хадгалсан хаяг алга.</p> : <ul className="grid gap-3">{c.addresses.map((a) => <li key={a.id}><b>{a.label}</b>{a.isDefault && <span className="badge badge-gold ml-2">Үндсэн</span>}<p className="text-[var(--text-2)]">{[a.city, a.district, a.khoroo, a.detail].filter(Boolean).join(", ")}</p></li>)}</ul>}</section>
          <div className="grid grid-cols-2 gap-3"><div className="card p-4"><p className="text-xs text-[var(--text-2)]">Захиалга</p><p className="display tabular text-xl font-semibold">{os.length}</p></div><div className="card p-4"><p className="text-xs text-[var(--text-2)]">Худалдан авалт</p><p className="display tabular text-xl font-semibold">{mnt(spent)}</p></div></div>
        </div>
        <section className="card p-5"><h2 className="mb-4 font-semibold">Худалдан авалтын түүх</h2>
          {os.length === 0 ? <p className="text-sm text-[var(--text-2)]">Захиалга алга.</p> : <ul className="divide-y divide-[var(--line)]">{os.map((o) => <li key={o.id}><Link href={`/admin/orders/${o.number}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-[var(--accent)]"><span><b className="tabular">{o.number}</b><span className="block text-xs text-[var(--text-3)]">{fmtDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} бараа</span></span><span className="text-right"><span className="tabular block font-semibold">{mnt(o.pricing.total)}</span><span className={`badge ${STATUS_TONE[o.status]}`}>{STATUS_LABEL[o.status]}</span></span></Link></li>)}</ul>}
        </section>
      </div>
    </>
  );
}

const REASON: Record<string, string> = { order: "Захиалга", cancel: "Цуцлалт", manual: "Гараар засвар", restock: "Нөөц нэмсэн", create: "Анхны нөөц" };

export function AdminInventory() {
  const { products, repo, toast, ready } = useStore();
  const { email } = useAdmin();
  const d = useAdminData();
  const [q, setQ] = useState("");
  const [only, setOnly] = useState(false);
  const [qty, setQty] = useState<Record<string, string>>({});
  const list = products.filter((p) => (!only || p.stock <= p.lowStockThreshold) && (!q.trim() || `${p.name} ${p.sku}`.toLocaleLowerCase("mn").includes(q.trim().toLocaleLowerCase("mn"))));

  async function adjust(id: string, sign: 1 | -1) {
    const n = Math.floor(Number(qty[id] ?? "1"));
    if (!Number.isFinite(n) || n <= 0) return toast("Тоо ширхэгийг зөв оруулна уу.", "error");
    try { await repo.adjustStock(id, sign * n, sign > 0 ? "restock" : "manual", undefined, email); toast(sign > 0 ? `${n} ширхэг нэмлээ.` : `${n} ширхэг хаслаа.`); }
    catch (e) { toast(e instanceof RepositoryError ? e.message : "Алдаа гарлаа.", "error"); }
  }
  return (
    <>
      <PageHeader title="Нөөцийн удирдлага" subtitle="Үлдэгдэл засах, нөөцийн хөдөлгөөнийг хянах." />
      <div className="mb-4 flex flex-wrap items-center gap-3"><label className="relative min-w-60 flex-1 sm:max-w-md"><span className="sr-only">Хайх</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-3)]" /><input className="input !pl-10" placeholder="Нэр эсвэл SKU кодоор хайх" value={q} onChange={(e) => setQ(e.target.value)} /></label><label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={only} onChange={(e) => setOnly(e.target.checked)} />Зөвхөн нөөц багатай</label></div>
      {!ready ? <div className="skeleton h-80" /> : (
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm" data-testid="inventory-table">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--text-2)]"><tr><th className="p-3 font-semibold">Бүтээгдэхүүн</th><th className="p-3 text-right font-semibold">Үлдэгдэл</th><th className="p-3 font-semibold">Засах</th></tr></thead>
          <tbody className="divide-y divide-[var(--line)]">{list.map((p) => (
            <tr key={p.id} data-testid="inventory-row" data-sku={p.sku}><td className="p-3"><p className="font-medium">{p.name}</p><p className="text-xs text-[var(--text-3)]">{p.sku}</p></td>
              <td className="p-3 text-right"><span className={`badge ${p.stock === 0 ? "badge-danger" : p.stock <= p.lowStockThreshold ? "badge-warn" : "badge-success"} tabular !text-sm`} data-testid="stock-value">{p.stock}</span></td>
              <td className="p-3"><div className="flex items-center gap-1.5"><button className="btn btn-ghost !size-10 !p-0" aria-label="Хасах" onClick={() => adjust(p.id, -1)}><Minus className="size-4" /></button><input aria-label="Тоо ширхэг" inputMode="numeric" className="input !min-h-10 !w-16 text-center" value={qty[p.id] ?? "1"} onChange={(e) => setQty({ ...qty, [p.id]: e.target.value.replace(/\D/g, "") })} /><button className="btn btn-ghost !size-10 !p-0" aria-label="Нэмэх" onClick={() => adjust(p.id, 1)} data-testid="stock-add"><Plus className="size-4" /></button></div></td></tr>))}</tbody>
        </table></div></div>
      )}
      <h2 className="mb-3 mt-10 text-lg font-semibold">Сүүлийн хөдөлгөөн</h2>
      <div className="card divide-y divide-[var(--line)]" data-testid="movements">
        {(d?.inventory ?? []).slice(0, 15).map((m) => { const p = products.find((x) => x.id === m.productId); return <div key={m.id} className="flex items-center justify-between gap-3 p-3 text-sm"><div className="min-w-0"><p className="truncate font-medium">{p?.name ?? "Устгагдсан бараа"}</p><p className="text-xs text-[var(--text-3)]">{`${REASON[m.reason]}${m.reference ? ` ${m.reference}` : ""} · ${fmtDate(m.at)}${m.by ? ` · ${m.by}` : ""}`}</p></div><div className="text-right"><p className={`tabular font-semibold ${m.delta < 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</p><p className="tabular text-xs text-[var(--text-3)]">{`үлдэгдэл ${m.stockAfter}`}</p></div></div>; })}
      </div>
    </>
  );
}
