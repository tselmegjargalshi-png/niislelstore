"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Heart, Home, LayoutGrid, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Logo } from "./logo";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  return (
    <button
      type="button"
      aria-label={dark ? "Цайвар горим" : "Харанхуй горим"}
      className="grid size-11 place-items-center rounded-full hover:bg-[var(--surface-2)]"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.dataset.theme = next ? "dark" : "light";
        try { localStorage.setItem("niislel:theme", next ? "dark" : "light"); } catch { /* ignore */ }
      }}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

export function Header() {
  const { categories, banners, cartCount, setCartOpen, wishlist, customer } = useStore();
  const router = useRouter();
  const path = usePathname();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const strip = banners.find((b) => b.placement === "strip" && b.active);

  useEffect(() => { setMenu(false); setSearchOpen(false); }, [path]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
    setSearchOpen(false);
  };

  return (
    <>
      {strip && (
        <div className="bg-[var(--ink)] text-[var(--on-ink)]">
          <div className="container-x flex min-h-9 items-center justify-center gap-3 py-1.5 text-center text-xs">
            <span>{strip.title}</span>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center gap-2 md:h-[72px] md:gap-6">
          <button className="grid size-11 place-items-center rounded-full hover:bg-[var(--surface-2)] md:hidden" aria-label="Цэс нээх" onClick={() => setMenu(true)}>
            <Menu className="size-5" />
          </button>
          <Link href="/" aria-label="Нийслэл Стор нүүр хуудас" className="mr-auto md:mr-0"><Logo /></Link>

          <nav className="ml-4 mr-auto hidden items-center gap-1 md:flex" aria-label="Үндсэн цэс">
            <Link href="/products" className="rounded-full px-3.5 py-2 text-sm font-medium hover:bg-[var(--surface-2)]">Бүх бараа</Link>
            {categories.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/products?category=${c.slug}`} className="rounded-full px-3.5 py-2 text-sm font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">{c.name}</Link>
            ))}
            <Link href="/products?sale=1" className="rounded-full px-3.5 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]">Хямдрал</Link>
          </nav>

          <form onSubmit={submit} role="search" className="ml-auto hidden max-w-xs flex-1 xl:block">
            <label className="relative block">
              <span className="sr-only">Бараа хайх</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-3)]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Бараа хайх" className="input !min-h-10 rounded-full !pl-10" />
            </label>
          </form>

          <div className="flex items-center">
            <button className="grid size-11 place-items-center rounded-full hover:bg-[var(--surface-2)] xl:hidden" aria-label="Хайх" onClick={() => setSearchOpen((v) => !v)}><Search className="size-5" /></button>
            <span className="hidden md:block"><ThemeToggle /></span>
            <Link href="/account/wishlist" aria-label="Хадгалсан бараа" className="relative hidden size-11 place-items-center rounded-full hover:bg-[var(--surface-2)] sm:grid">
              <Heart className="size-5" />
              {wishlist.length > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold leading-4 text-[var(--on-accent)]">{wishlist.length}</span>}
            </Link>
            <Link href={customer ? "/account" : "/account/login"} aria-label="Миний бүртгэл" className="hidden size-11 place-items-center rounded-full hover:bg-[var(--surface-2)] md:grid"><User className="size-5" /></Link>
            <button type="button" onClick={() => setCartOpen(true)} aria-label={`Сагс, ${cartCount} бараа`} className="relative grid size-11 place-items-center rounded-full hover:bg-[var(--surface-2)]" data-testid="cart-button">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && <span key={cartCount} data-testid="cart-count" className="anim-pop absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold leading-[18px] text-[var(--on-accent)]">{cartCount}</span>}
            </button>
          </div>
        </div>
        {searchOpen && (
          <form onSubmit={submit} role="search" className="container-x pb-3 xl:hidden">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Бараа хайх" className="input rounded-full" aria-label="Бараа хайх" />
          </form>
        )}
      </header>

      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" style={{ animation: "fade-in .2s both" }} onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-[var(--bg)] p-5" style={{ animation: "slide-in .25s both" }}>
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button onClick={() => setMenu(false)} aria-label="Хаах" className="grid size-10 place-items-center rounded-full hover:bg-[var(--surface-2)]"><X className="size-5" /></button>
            </div>
            <nav className="grid gap-1 text-lg" aria-label="Гар утасны цэс">
              <Link href="/products" className="rounded-xl px-3 py-3 font-semibold hover:bg-[var(--surface-2)]">Бүх бараа</Link>
              {categories.map((c) => <Link key={c.id} href={`/products?category=${c.slug}`} className="rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">{c.name}</Link>)}
              <Link href="/products?sale=1" className="rounded-xl px-3 py-3 font-semibold text-[var(--accent)]">Хямдрал</Link>
              <hr className="my-2 border-[var(--line)]" />
              <Link href="/track" className="rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">Захиалга хянах</Link>
              <Link href="/help" className="rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">Тусламж, хүргэлт</Link>
              <Link href="/account/wishlist" className="rounded-xl px-3 py-3 hover:bg-[var(--surface-2)]">Хадгалсан бараа</Link>
            </nav>
            <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-4 text-sm text-[var(--text-2)]">
              <span>Харагдах байдал</span><ThemeToggle />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/** Гар утасны доод навигаци: нэг гараар хэрэглэхэд тохиромжтой. */
export function MobileTabBar() {
  const path = usePathname();
  const { cartCount, setCartOpen, customer } = useStore();
  const Item = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (
    <Link href={href} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-[var(--accent)]" : "text-[var(--text-2)]"}`} aria-current={active ? "page" : undefined}>
      {icon}{label}
    </Link>
  );
  return (
    <nav aria-label="Доод цэс" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--line)] bg-[var(--bg)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <Item href="/" icon={<Home className="size-5" />} label="Нүүр" active={path === "/"} />
      <Item href="/products" icon={<LayoutGrid className="size-5" />} label="Бараа" active={path.startsWith("/products")} />
      <button type="button" onClick={() => setCartOpen(true)} className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-[var(--text-2)]">
        <span className="relative"><ShoppingBag className="size-5" />{cartCount > 0 && <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold leading-4 text-[var(--on-accent)]">{cartCount}</span>}</span>
        Сагс
      </button>
      <Item href="/account/wishlist" icon={<Heart className="size-5" />} label="Хадгалсан" active={path.startsWith("/account/wishlist")} />
      <Item href={customer ? "/account" : "/account/login"} icon={<User className="size-5" />} label="Бүртгэл" active={path.startsWith("/account") && !path.startsWith("/account/wishlist")} />
    </nav>
  );
}
