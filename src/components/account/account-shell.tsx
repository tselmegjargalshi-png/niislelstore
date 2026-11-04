"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Heart, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import { useStore } from "@/lib/store";

const nav = [
  { href: "/account", label: "Профайл", icon: User },
  { href: "/account/orders", label: "Захиалгууд", icon: Package },
  { href: "/account/addresses", label: "Хаягууд", icon: MapPin },
  { href: "/account/wishlist", label: "Хадгалсан", icon: Heart },
  { href: "/account/settings", label: "Тохиргоо", icon: Settings },
];

export function AccountShell({ children }: { children: ReactNode }) {
  const { ready, customer, repo, toast } = useStore();
  const path = usePathname();
  const router = useRouter();
  const isAuthPage = path === "/account/login" || path === "/account/register";
  const guestOk = path === "/account/wishlist";

  useEffect(() => {
    if (ready && !customer && !isAuthPage && !guestOk) router.replace(`/account/login?next=${encodeURIComponent(path)}`);
  }, [ready, customer, isAuthPage, guestOk, path, router]);

  if (isAuthPage) return <>{children}</>;
  if (!ready || (!customer && !guestOk)) return <div className="container-x py-12"><div className="skeleton h-10 w-56" /><div className="skeleton mt-6 h-64" /></div>;

  return (
    <div className="container-x py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Миний бүртгэл</p><h1 className="mt-1 text-3xl md:text-4xl">{customer ? `Сайн байна уу, ${customer.name.split(" ").slice(-1)[0]}` : "Хадгалсан бараа"}</h1></div>
        {customer && <button className="btn btn-ghost btn-sm" onClick={async () => { await repo.logout(); toast("Системээс гарлаа.", "info"); router.push("/"); }} data-testid="logout"><LogOut className="size-4" />Гарах</button>}
      </div>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <nav aria-label="Бүртгэлийн цэс" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:grid md:content-start md:px-0">
          {nav.filter((n) => customer || n.href === "/account/wishlist").map((n) => {
            const on = n.href === "/account" ? path === n.href : path.startsWith(n.href);
            return <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium ${on ? "bg-[var(--ink)] text-[var(--on-ink)]" : "text-[var(--text-2)] hover:bg-[var(--surface-2)]"}`}><n.icon className="size-4" />{n.label}</Link>;
          })}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
