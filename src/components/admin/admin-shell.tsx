"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Boxes, ExternalLink, LayoutDashboard, LogOut, Megaphone, Menu, Package, ShoppingBag, Tags, Truck, Users, X } from "lucide-react";
import { can, type AdminRole } from "@/lib/admin-roles";
import { AdminCtx } from "./admin-ui";
import { Logo } from "../logo";
import { useStore } from "@/lib/store";

const nav = [
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard, perm: "dashboard" },
  { href: "/admin/orders", label: "Захиалга", icon: ShoppingBag, perm: "orders" },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: Package, perm: "dashboard" },
  { href: "/admin/inventory", label: "Нөөц", icon: Boxes, perm: "inventory" },
  { href: "/admin/categories", label: "Ангилал", icon: Tags, perm: "categories" },
  { href: "/admin/customers", label: "Харилцагч", icon: Users, perm: "customers" },
  { href: "/admin/marketing", label: "Маркетинг", icon: Megaphone, perm: "marketing" },
  { href: "/admin/delivery", label: "Хүргэлт", icon: Truck, perm: "delivery" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<{ email: string; role: AdminRole } | null>(null);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const { ready } = useStore();

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return router.replace(`/admin/login?next=${encodeURIComponent(path)}`);
      const j = await r.json();
      setMe({ email: j.email, role: j.role });
    }).catch(() => router.replace("/admin/login"));
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setOpen(false), [path]);

  if (!me || !ready) return <div className="grid min-h-dvh place-items-center"><div className="skeleton h-10 w-48" /></div>;
  const items = nav.filter((n) => can(me.role, n.perm));
  const matches = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));
  const forbidden = path !== "/admin" && !items.some((n) => matches(n.href));

  const Nav = (
    <nav className="grid gap-1" aria-label="Админ цэс">
      {items.map((n) => {
        const on = matches(n.href);
        return <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${on ? "bg-[var(--ink)] text-[var(--on-ink)]" : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"}`}><n.icon className="size-[18px]" />{n.label}</Link>;
      })}
    </nav>
  );

  return (
    <AdminCtx.Provider value={me}>
      <div className="min-h-dvh bg-[var(--surface-2)] lg:grid lg:grid-cols-[264px_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-[var(--line)] bg-[var(--surface)] p-5 lg:flex">
          <Link href="/admin" className="mb-1"><Logo /></Link>
          <p className="mb-6 mt-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]"><BarChart3 className="size-3.5" />Удирдлага</p>
          {Nav}
          <div className="mt-auto grid gap-3 border-t border-[var(--line)] pt-4 text-sm">
            <Link href="/" target="_blank" className="flex items-center gap-2 text-[var(--text-2)] hover:text-[var(--text)]"><ExternalLink className="size-4" />Дэлгүүр харах</Link>
            <div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="truncate font-medium">{me.email}</p><span className={`badge ${me.role === "admin" ? "badge-ink" : "badge-info"}`}>{me.role === "admin" ? "Админ" : "Ажилтан"}</span></div>
              <button aria-label="Гарах" className="grid size-10 place-items-center rounded-full hover:bg-[var(--surface-2)]" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); }} data-testid="admin-logout"><LogOut className="size-4" /></button></div>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur lg:hidden">
            <button onClick={() => setOpen(true)} aria-label="Цэс нээх" className="grid size-10 place-items-center rounded-full hover:bg-[var(--surface-2)]"><Menu className="size-5" /></button>
            <Logo />
            <span className="size-10" />
          </header>
          {open && (
            <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
              <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--surface)] p-5" style={{ animation: "slide-in .25s both" }}>
                <div className="mb-6 flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} aria-label="Хаах" className="grid size-9 place-items-center rounded-full hover:bg-[var(--surface-2)]"><X className="size-5" /></button></div>
                {Nav}
                <div className="mt-auto grid gap-3 border-t border-[var(--line)] pt-4 text-sm"><Link href="/" className="text-[var(--text-2)]">Дэлгүүр харах</Link><button className="btn btn-ghost btn-sm" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); }}>Гарах</button></div>
              </aside>
            </div>
          )}
          <main className="mx-auto max-w-[1280px] p-4 md:p-8">
            {!forbidden && typeof window !== "undefined" && window.location.search.includes("denied=1") && <p role="alert" className="mb-5 rounded-xl bg-[var(--warn-soft)] px-4 py-3 text-sm font-medium text-[var(--warn)]">Хандах эрхгүй: энэ хэсэг зөвхөн админд нээлттэй.</p>}
            {forbidden ? <div className="card p-10 text-center"><h1 className="text-2xl">Хандах эрхгүй</h1><p className="mt-2 text-[var(--text-2)]">Таны эрх (ажилтан) энэ хэсгийг үзэх боломжгүй. Админтай холбогдоно уу.</p><Link href="/admin" className="btn btn-primary mt-5">Хяналтын самбар руу</Link></div> : children}
          </main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
}
