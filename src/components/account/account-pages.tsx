"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Heart, MapPin, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { mnt } from "@/lib/pricing";
import { addressSchema, emailSchema, fieldErrors, nameSchema, phoneSchema, type FieldErrors } from "@/lib/validation";
import { RepositoryError } from "@/lib/data/repository";
import { PROVINCES, UB_DISTRICTS } from "@/lib/data/seed";
import { STATUS_LABEL, STATUS_TONE, PAYMENT_LABEL, PAYMENT_TONE, fmtDate } from "@/lib/use-order";
import type { Address, Order } from "@/lib/types";
import { EmptyState, Field, Spinner } from "../ui/bits";
import { ProductCard } from "../product-card";
import { ProductPicture } from "../product-art";

const uid = () => `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function ProfilePage() {
  const { customer, repo, toast } = useStore();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [v, setV] = useState({ name: "", email: "", phone: "" });
  const [er, setEr] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (customer) { setV({ name: customer.name, email: customer.email, phone: customer.phone }); void repo.listOrders({ customerId: customer.id }).then(setOrders); } }, [customer?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!customer) return null;

  async function save(e: FormEvent) {
    e.preventDefault();
    const n = nameSchema.safeParse(v.name), m = emailSchema.safeParse(v.email), p = phoneSchema.safeParse(v.phone);
    const errs: FieldErrors = {};
    if (!n.success) errs.name = n.error.issues[0].message;
    if (!m.success) errs.email = m.error.issues[0].message;
    if (!p.success) errs.phone = p.error.issues[0].message;
    setEr(errs);
    if (!n.success || !m.success || !p.success) return;
    setBusy(true);
    try { await repo.updateCustomer({ ...customer!, name: n.data, email: m.data, phone: p.data }); toast("Профайл шинэчлэгдлээ."); }
    catch (err) { setEr({ email: err instanceof RepositoryError ? err.message : "Хадгалах үед алдаа гарлаа." }); }
    finally { setBusy(false); }
  }
  const spent = (orders ?? []).filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.pricing.total, 0);
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Захиалга", String(orders?.length ?? "-")], ["Нийт худалдан авалт", orders ? mnt(spent) : "-"], ["Бүртгүүлсэн", new Date(customer.createdAt).toLocaleDateString("mn-MN")]].map(([k, val]) => (
          <div key={k} className="card p-5"><p className="text-sm text-[var(--text-2)]">{k}</p><p className="display tabular mt-1 text-2xl font-semibold">{val}</p></div>
        ))}
      </div>
      <form onSubmit={save} noValidate className="card p-5 md:p-7" data-testid="profile-form">
        <h2 className="mb-5 text-lg font-semibold">Хувийн мэдээлэл</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Овог нэр" error={er.name} htmlFor="p-name"><input id="p-name" className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} aria-invalid={!!er.name} data-testid="profile-name" /></Field>
          <Field label="Утасны дугаар" error={er.phone} htmlFor="p-phone"><input id="p-phone" className="input" inputMode="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} aria-invalid={!!er.phone} /></Field>
          <div className="sm:col-span-2"><Field label="Имэйл" error={er.email} htmlFor="p-email"><input id="p-email" type="email" className="input" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} aria-invalid={!!er.email} /></Field></div>
        </div>
        <button className="btn btn-primary mt-5" disabled={busy} data-testid="profile-save">{busy ? <Spinner className="size-4" /> : "Хадгалах"}</button>
      </form>
    </div>
  );
}

export function OrdersPage() {
  const { customer, repo } = useStore();
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    if (!customer) return;
    const load = () => repo.listOrders({ customerId: customer.id }).then(setOrders);
    void load();
    return repo.subscribe(() => void load());
  }, [customer, repo]);
  if (!customer) return null;
  if (!orders) return <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-28" />)}</div>;
  if (!orders.length) return <EmptyState icon={<Package className="size-7" />} title="Захиалга одоогоор алга" text="Анхны захиалгаа өгөөд энд явцыг нь хянаарай." action={<Link href="/products" className="btn btn-primary mt-2">Дэлгүүр үзэх</Link>} />;
  return (
    <ul className="grid gap-4" data-testid="orders-list">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/order/${o.number}`} className="card block p-5 transition hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-md)]" data-testid="order-row">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-semibold tabular">{o.number}</p><p className="text-xs text-[var(--text-3)]">{fmtDate(o.createdAt)}</p></div>
              <div className="flex flex-wrap gap-1.5"><span className={`badge ${STATUS_TONE[o.status]}`}>{STATUS_LABEL[o.status]}</span><span className={`badge ${PAYMENT_TONE[o.payment.status]}`}>{PAYMENT_LABEL[o.payment.status]}</span></div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-3">{o.items.slice(0, 4).map((it, i) => <div key={i} className="size-12 overflow-hidden rounded-lg border-2 border-[var(--surface)]"><ProductPicture image={it.image} kind={it.art} className="size-full" /></div>)}</div>
              <p className="flex-1 text-sm text-[var(--text-2)]">{`${o.items.reduce((s, i) => s + i.quantity, 0)} бараа`}</p>
              <p className="tabular font-semibold">{mnt(o.pricing.total)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const emptyAddr = { label: "Гэр", city: "Улаанбаатар", district: "", khoroo: "", detail: "" };

export function AddressesPage() {
  const { customer, repo, toast } = useStore();
  const [editing, setEditing] = useState<(typeof emptyAddr & { id?: string }) | null>(null);
  const [er, setEr] = useState<FieldErrors>({});
  if (!customer) return null;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const r = addressSchema.safeParse(editing);
    const errs = r.success ? {} : fieldErrors(r.error);
    if (editing.city === "Улаанбаатар" && !editing.district) errs.district = "Дүүргээ сонгоно уу.";
    setEr(errs);
    if (!r.success || errs.district) return;
    const list: Address[] = [...customer!.addresses];
    const a: Address = { ...r.data, id: editing.id ?? uid(), isDefault: editing.id ? !!list.find((x) => x.id === editing.id)?.isDefault : list.length === 0 };
    const next = editing.id ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a];
    await repo.updateCustomer({ ...customer!, addresses: next });
    toast("Хаяг хадгалагдлаа."); setEditing(null);
  }
  const setDefault = async (id: string) => { await repo.updateCustomer({ ...customer, addresses: customer.addresses.map((a) => ({ ...a, isDefault: a.id === id })) }); toast("Үндсэн хаяг солигдлоо."); };
  const del = async (id: string) => {
    let next = customer.addresses.filter((a) => a.id !== id);
    if (next.length && !next.some((a) => a.isDefault)) next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
    await repo.updateCustomer({ ...customer, addresses: next }); toast("Хаяг устгагдлаа.", "info");
  };

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Хадгалсан хаягууд</h2>{!editing && <button className="btn btn-primary btn-sm" onClick={() => { setEr({}); setEditing({ ...emptyAddr }); }} data-testid="add-address"><Plus className="size-4" />Хаяг нэмэх</button>}</div>
      {editing && (
        <form onSubmit={save} noValidate className="card p-5 md:p-7" data-testid="address-form">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Хаягийн нэр" error={er.label} htmlFor="a-label"><input id="a-label" className="input" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} aria-invalid={!!er.label} /></Field>
            <Field label="Хот, аймаг" htmlFor="a-city"><select id="a-city" className="select" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value, district: "" })}><option>Улаанбаатар</option>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>
            {editing.city === "Улаанбаатар" ? <Field label="Дүүрэг" error={er.district} htmlFor="a-dist"><select id="a-dist" className="select" value={editing.district} onChange={(e) => setEditing({ ...editing, district: e.target.value })} aria-invalid={!!er.district}><option value="">Сонгоно уу</option>{UB_DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></Field> : <Field label="Сум, баг" htmlFor="a-dist"><input id="a-dist" className="input" value={editing.district} onChange={(e) => setEditing({ ...editing, district: e.target.value })} /></Field>}
            <Field label="Хороо" htmlFor="a-kh"><input id="a-kh" className="input" value={editing.khoroo} onChange={(e) => setEditing({ ...editing, khoroo: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Дэлгэрэнгүй хаяг" error={er.detail} htmlFor="a-det"><input id="a-det" className="input" value={editing.detail} onChange={(e) => setEditing({ ...editing, detail: e.target.value })} aria-invalid={!!er.detail} data-testid="addr-detail" /></Field></div>
          </div>
          <div className="mt-5 flex gap-2"><button className="btn btn-primary" data-testid="addr-save">Хадгалах</button><button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Болих</button></div>
        </form>
      )}
      {customer.addresses.length === 0 && !editing ? <EmptyState icon={<MapPin className="size-7" />} title="Хадгалсан хаяг алга" text="Хаягаа хадгалбал дараагийн захиалга илүү хурдан болно." /> : (
        <ul className="grid gap-3 sm:grid-cols-2" data-testid="address-list">
          {customer.addresses.map((a) => (
            <li key={a.id} className="card p-5 text-sm">
              <div className="mb-2 flex items-center justify-between"><b className="flex items-center gap-2"><MapPin className="size-4 text-[var(--accent)]" />{a.label}</b>{a.isDefault && <span className="badge badge-gold">Үндсэн</span>}</div>
              <p className="text-[var(--text-2)]">{[a.city, a.district, a.khoroo, a.detail].filter(Boolean).join(", ")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => { setEr({}); setEditing({ id: a.id, label: a.label, city: a.city, district: a.district, khoroo: a.khoroo, detail: a.detail }); }}><Pencil className="size-3.5" />Засах</button>
                {!a.isDefault && <button className="btn btn-ghost btn-sm" onClick={() => setDefault(a.id)}>Үндсэн болгох</button>}
                <button className="btn btn-danger btn-sm" onClick={() => del(a.id)} aria-label={`${a.label} хаягийг устгах`}><Trash2 className="size-3.5" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WishlistPage() {
  const { ready, wishlist, products } = useStore();
  if (!ready) return <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton aspect-[4/5]" />)}</div>;
  const items = wishlist.map((id) => products.find((p) => p.id === id && p.visible)).filter((p): p is NonNullable<typeof p> => !!p);
  if (!items.length) return <EmptyState icon={<Heart className="size-7" />} title="Хадгалсан бараа алга" text="Бараан дээрх зүрхэн тэмдгийг дарж дараа авахаар хадгална." action={<Link href="/products" className="btn btn-primary mt-2">Дэлгүүр үзэх</Link>} />;
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6" data-testid="wishlist-grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}

export function SettingsPage() {
  const { customer, repo, toast } = useStore();
  const [p, setP] = useState({ current: "", next: "", confirm: "" });
  const [er, setEr] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  if (!customer) return null;
  async function change(e: FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!p.current) errs.current = "Одоогийн нууц үгээ оруулна уу.";
    if (p.next.length < 8) errs.next = "Шинэ нууц үг дор хаяж 8 тэмдэгт байх ёстой.";
    if (p.next !== p.confirm) errs.confirm = "Нууц үг таарахгүй байна.";
    setEr(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try { await repo.changePassword(customer!.id, p.current, p.next); toast("Нууц үг солигдлоо."); setP({ current: "", next: "", confirm: "" }); }
    catch (err) { setEr({ current: err instanceof RepositoryError ? err.message : "Алдаа гарлаа." }); }
    finally { setBusy(false); }
  }
  return (
    <div className="grid gap-6">
      <form onSubmit={change} noValidate className="card p-5 md:p-7">
        <h2 className="mb-5 text-lg font-semibold">Нууц үг солих</h2>
        <div className="grid max-w-md gap-4">
          <Field label="Одоогийн нууц үг" error={er.current} htmlFor="s-cur"><input id="s-cur" type="password" className="input" autoComplete="current-password" value={p.current} onChange={(e) => setP({ ...p, current: e.target.value })} aria-invalid={!!er.current} /></Field>
          <Field label="Шинэ нууц үг" error={er.next} htmlFor="s-new"><input id="s-new" type="password" className="input" autoComplete="new-password" value={p.next} onChange={(e) => setP({ ...p, next: e.target.value })} aria-invalid={!!er.next} /></Field>
          <Field label="Шинэ нууц үг давтах" error={er.confirm} htmlFor="s-conf"><input id="s-conf" type="password" className="input" autoComplete="new-password" value={p.confirm} onChange={(e) => setP({ ...p, confirm: e.target.value })} aria-invalid={!!er.confirm} /></Field>
        </div>
        <button className="btn btn-primary mt-5" disabled={busy}>{busy ? <Spinner className="size-4" /> : "Нууц үг солих"}</button>
      </form>
      <section className="card p-5 md:p-7">
        <h2 className="mb-2 text-lg font-semibold">Мэдэгдэл</h2>
        <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={customer.marketingOptIn} onChange={async (e) => { await repo.updateCustomer({ ...customer, marketingOptIn: e.target.checked }); toast("Тохиргоо хадгалагдлаа."); }} />Шинэ бараа, урамшууллын мэдээг имэйлээр авах</label>
      </section>
      <section className="card p-5 md:p-7">
        <h2 className="mb-2 text-lg font-semibold">Демо өгөгдөл</h2>
        <p className="mb-4 text-sm text-[var(--text-2)]">Бүх демо өгөгдөл (бараа, захиалга, хэрэглэгч) энэ хөтчид хадгалагдсан. Анхны байдалд нь сэргээж болно.</p>
        <button className="btn btn-danger" onClick={async () => { if (confirm("Бүх демо өгөгдлийг анхны байдалд нь сэргээх үү? Таны захиалга, бүртгэл устна.")) { await repo.logout(); await repo.resetDemo(); toast("Демо өгөгдөл сэргээгдлээ.", "info"); } }} data-testid="reset-demo">Демо өгөгдөл сэргээх</button>
      </section>
    </div>
  );
}
