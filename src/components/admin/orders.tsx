"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Search, ShoppingBag, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAdminData } from "@/lib/use-admin-data";
import { mnt } from "@/lib/pricing";
import { METHOD_LABEL, PAYMENT_LABEL, PAYMENT_TONE, SHIP_LABEL, STATUS_LABEL, STATUS_TONE, fmtDate, flowFor, useOrder } from "@/lib/use-order";
import { RepositoryError } from "@/lib/data/repository";
import type { OrderStatus } from "@/lib/types";
import { EmptyState, Field, Spinner } from "../ui/bits";
import { ProductPicture } from "../product-art";
import { Timeline } from "../order/tracking";
import { SummaryRows } from "../cart/summary";
import { Modal, PageHeader, useAdmin } from "./admin-ui";

export function AdminOrders() {
  const d = useAdminData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [pay, setPay] = useState("");
  const list = useMemo(() => (d?.orders ?? []).filter((o) => {
    if (status && o.status !== status) return false;
    if (pay && o.payment.status !== pay) return false;
    const s = q.trim().toLocaleLowerCase("mn");
    return !s || `${o.number} ${o.contact.name} ${o.contact.phone} ${o.contact.email}`.toLocaleLowerCase("mn").includes(s);
  }), [d, q, status, pay]);
  const counts = useMemo(() => { const m: Record<string, number> = {}; (d?.orders ?? []).forEach((o) => (m[o.status] = (m[o.status] ?? 0) + 1)); return m; }, [d]);

  return (
    <>
      <PageHeader title="Захиалга" subtitle={d ? `Нийт ${d.orders.length} захиалга` : undefined} />
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Төлөвөөр шүүх">
        {([["", "Бүгд"], ...Object.entries(STATUS_LABEL)] as [string, string][]).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={status === k} onClick={() => setStatus(k as OrderStatus | "")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${status === k ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]" : "border-[var(--line-strong)] bg-[var(--surface)] hover:bg-[var(--surface-3)]"}`} data-testid={`tab-${k || "all"}`}>{l}{k ? ` (${counts[k] ?? 0})` : ""}</button>
        ))}
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_220px]">
        <label className="relative"><span className="sr-only">Хайх</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-3)]" /><input className="input !pl-10" placeholder="Дугаар, нэр, утас, имэйлээр хайх" value={q} onChange={(e) => setQ(e.target.value)} data-testid="admin-order-search" /></label>
        <select className="select" aria-label="Төлбөрийн төлөв" value={pay} onChange={(e) => setPay(e.target.value)}><option value="">Бүх төлбөр</option>{Object.entries(PAYMENT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </div>
      {!d ? <div className="skeleton h-80" /> : list.length === 0 ? <EmptyState icon={<ShoppingBag className="size-7" />} title="Захиалга олдсонгүй" text="Шүүлтүүрээ өөрчилнө үү." /> : (
        <div className="card overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm" data-testid="orders-table">
            <thead className="border-b border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--text-2)]"><tr><th className="p-3 font-semibold">Захиалга</th><th className="p-3 font-semibold">Харилцагч</th><th className="p-3 font-semibold">Хүргэлт</th><th className="p-3 font-semibold">Төлбөр</th><th className="p-3 text-right font-semibold">Дүн</th><th className="p-3 font-semibold">Төлөв</th></tr></thead>
            <tbody className="divide-y divide-[var(--line)]">
              {list.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--surface-2)]/60" data-testid="admin-order-row">
                  <td className="p-3"><Link href={`/admin/orders/${o.number}`} className="font-semibold tabular text-[var(--accent)] hover:underline">{o.number}</Link><p className="text-xs text-[var(--text-3)]">{fmtDate(o.createdAt)}</p></td>
                  <td className="p-3"><p className="font-medium">{o.contact.name}</p><p className="text-xs text-[var(--text-3)]">{o.contact.phone}</p></td>
                  <td className="p-3 text-[var(--text-2)]">{SHIP_LABEL[o.shipping.method]}<p className="text-xs text-[var(--text-3)]">{o.shipping.district || o.shipping.city}</p></td>
                  <td className="p-3"><p className="text-[var(--text-2)]">{METHOD_LABEL[o.payment.method]}</p><span className={`badge ${PAYMENT_TONE[o.payment.status]}`}>{PAYMENT_LABEL[o.payment.status]}</span></td>
                  <td className="tabular p-3 text-right font-semibold">{mnt(o.pricing.total)}</td>
                  <td className="p-3"><span className={`badge ${STATUS_TONE[o.status]}`}>{STATUS_LABEL[o.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div></div>
      )}
    </>
  );
}

export function AdminOrderDetail({ number }: { number: string }) {
  const { repo, toast, ready } = useStore();
  const { email } = useAdmin();
  const order = useOrder(number);
  const [busy, setBusy] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  if (!ready || order === undefined) return <div className="skeleton h-96" />;
  if (order === null) return <EmptyState icon={<ShoppingBag className="size-7" />} title="Захиалга олдсонгүй" action={<Link href="/admin/orders" className="btn btn-primary mt-2">Жагсаалт руу</Link>} />;
  const flow = flowFor(order.shipping.method);
  const idx = flow.indexOf(order.status);
  const next = order.status !== "cancelled" && idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  const actionLabel: Partial<Record<OrderStatus, string>> = { confirmed: "Баталгаажуулах", processing: "Бэлтгэж эхлэх", shipped: "Хүргэлтэд гаргах", ready: "Очиж авахад бэлэн болгох", delivered: "Хүргэгдсэн гэж тэмдэглэх" };

  async function go(s: OrderStatus, note?: string) {
    setBusy(true); setErr("");
    try { await repo.updateOrderStatus(order!.number, s, note, email); toast(`Төлөв: ${STATUS_LABEL[s]}`); setCancel(false); setReason(""); }
    catch (e) { const m = e instanceof RepositoryError ? e.message : "Төлөв өөрчлөхөд алдаа гарлаа."; setErr(m); toast(m, "error"); }
    finally { setBusy(false); }
  }
  async function markPaid() {
    setBusy(true);
    try { await repo.updatePaymentStatus(order!.number, "paid"); toast("Төлбөр баталгаажлаа."); } catch { toast("Алдаа гарлаа.", "error"); } finally { setBusy(false); }
  }
  const closed = order.status === "cancelled" || order.status === "delivered";
  const addr = order.shipping.method === "pickup" ? order.shipping.detail : [order.shipping.city, order.shipping.district, order.shipping.khoroo, order.shipping.detail].filter(Boolean).join(", ");

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--text)]"><ArrowLeft className="size-4" />Бүх захиалга</Link>
      <PageHeader title={`Захиалга ${order.number}`} subtitle={fmtDate(order.createdAt)} actions={<><span className={`badge ${STATUS_TONE[order.status]} !text-sm`} data-testid="admin-order-status">{STATUS_LABEL[order.status]}</span><span className={`badge ${PAYMENT_TONE[order.payment.status]} !text-sm`} data-testid="admin-payment-status">{PAYMENT_LABEL[order.payment.status]}</span></>} />
      {err && <p role="alert" className="mb-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{err}</p>}

      {!closed && (
        <div className="card mb-6 flex flex-wrap items-center gap-3 p-4 md:p-5" data-testid="order-actions">
          <p className="mr-auto text-sm font-semibold">Үйлдэл</p>
          {next && <button className="btn btn-primary" disabled={busy} onClick={() => go(next)} data-testid="advance-status">{busy ? <Spinner className="size-4" /> : <Check className="size-4" />}{actionLabel[next] ?? STATUS_LABEL[next]}</button>}
          {order.payment.status !== "paid" && order.payment.status !== "refunded" && <button className="btn btn-ghost" disabled={busy} onClick={markPaid} data-testid="mark-paid">Төлбөр хүлээн авсан</button>}
          <button className="btn btn-danger" disabled={busy} onClick={() => setCancel(true)} data-testid="cancel-order"><X className="size-4" />Цуцлах</button>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <section className="card p-5 md:p-6"><h2 className="mb-4 font-semibold">Бараа</h2>
            <ul className="divide-y divide-[var(--line)]">{order.items.map((it, i) => <li key={i} className="flex gap-3 py-3"><div className="size-14 shrink-0 overflow-hidden rounded-lg"><ProductPicture image={it.image} kind={it.art} className="size-full" /></div><div className="min-w-0 flex-1 text-sm"><p className="font-medium">{it.name}</p><p className="text-xs text-[var(--text-3)]">{[it.sku, it.color, it.size].filter(Boolean).join(" · ")}</p></div><div className="text-right text-sm"><p className="tabular font-semibold">{mnt(it.unitPrice * it.quantity)}</p><p className="tabular text-xs text-[var(--text-3)]">{`${it.quantity} x ${mnt(it.unitPrice)}`}</p></div></li>)}</ul>
          </section>
          <section className="card p-5 md:p-6"><h2 className="mb-4 font-semibold">Явц</h2><Timeline order={order} /></section>
        </div>
        <aside className="grid h-fit gap-6">
          <section className="card p-5 md:p-6"><h2 className="mb-4 font-semibold">Төлбөр</h2><SummaryRows pricing={order.pricing} couponCode={order.couponCode} /><p className="mt-4 text-xs text-[var(--text-3)]">{`${METHOD_LABEL[order.payment.method]}${order.payment.simulated ? " (демо)" : ""} · Лавлах код: ${order.payment.reference}`}</p></section>
          <section className="card p-5 text-sm md:p-6"><h2 className="mb-3 font-semibold">Харилцагч</h2><p className="font-medium">{order.contact.name}</p><p className="text-[var(--text-2)]">{order.contact.phone}</p><p className="text-[var(--text-2)]">{order.contact.email}</p>{order.customerId ? <Link href={`/admin/customers/${order.customerId}`} className="mt-2 inline-block font-semibold text-[var(--accent)]">Профайл харах</Link> : <p className="mt-2 text-xs text-[var(--text-3)]">Зочин хэрэглэгч</p>}</section>
          <section className="card p-5 text-sm md:p-6"><h2 className="mb-3 font-semibold">Хүргэлт</h2><p className="font-medium">{SHIP_LABEL[order.shipping.method]}</p><p className="text-[var(--text-2)]">{order.shipping.estimate}</p><p className="mt-2 text-[var(--text-2)]">{addr}</p>{order.shipping.notes && <p className="mt-2 rounded-lg bg-[var(--surface-2)] p-2 text-[var(--text-2)]">{order.shipping.notes}</p>}</section>
        </aside>
      </div>
      {cancel && (
        <Modal title="Захиалга цуцлах" onClose={() => setCancel(false)}>
          <p className="mb-4 text-sm text-[var(--text-2)]">Цуцалсан захиалгын бараа нөөцөд буцаж нэмэгдэнэ. Төлөгдсөн бол буцаалттай гэж тэмдэглэнэ.</p>
          <Field label="Цуцлах шалтгаан" htmlFor="c-reason"><input id="c-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Жишээ: Харилцагчийн хүсэлтээр" data-testid="cancel-reason" /></Field>
          <div className="mt-6 flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setCancel(false)}>Болих</button><button className="btn !bg-[var(--danger)] !text-white" disabled={busy} onClick={() => go("cancelled", reason.trim() || "Админ цуцалсан")} data-testid="confirm-cancel">Захиалга цуцлах</button></div>
        </Modal>
      )}
    </>
  );
}
