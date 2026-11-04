import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SITE, DEMO_NOTICE } from "@/lib/site";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--surface-2)] pb-24 md:pb-0">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-[var(--text-2)]">{SITE.tagline}. Монгол гар урчууд, үйлдвэрлэгчдийн шилдэг бүтээлийг нэг дор цуглуулсан онлайн дэлгүүр.</p>
        </div>
        <nav aria-label="Дэлгүүр">
          <h3 className="mb-3 text-sm font-semibold">Дэлгүүр</h3>
          <ul className="grid gap-0.5 text-sm text-[var(--text-2)] [&_a]:inline-block [&_a]:py-2">
            <li><Link href="/products" className="hover:text-[var(--text)]">Бүх бараа</Link></li>
            <li><Link href="/products?category=cashmere" className="hover:text-[var(--text)]">Ноолуур</Link></li>
            <li><Link href="/products?sale=1" className="hover:text-[var(--text)]">Хямдрал</Link></li>
            <li><Link href="/products?sort=new" className="hover:text-[var(--text)]">Шинэ бараа</Link></li>
          </ul>
        </nav>
        <nav aria-label="Тусламж">
          <h3 className="mb-3 text-sm font-semibold">Тусламж</h3>
          <ul className="grid gap-0.5 text-sm text-[var(--text-2)] [&_a]:inline-block [&_a]:py-2">
            <li><Link href="/track" className="hover:text-[var(--text)]">Захиалга хянах</Link></li>
            <li><Link href="/help" className="hover:text-[var(--text)]">Хүргэлт, төлбөр</Link></li>
            <li><Link href="/account" className="hover:text-[var(--text)]">Миний бүртгэл</Link></li>
            <li><Link href="/admin" className="hover:text-[var(--text)]">Админ (демо)</Link></li>
          </ul>
        </nav>
        <address className="grid gap-1 text-sm [&_a]:py-1.5 not-italic text-[var(--text-2)]">
          <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">Холбоо барих</h3>
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-start gap-2 hover:text-[var(--text)]"><Phone className="mt-0.5 size-4 shrink-0" />{SITE.phone}</a>
          <a href={`mailto:${SITE.email}`} className="flex items-start gap-2 hover:text-[var(--text)]"><Mail className="mt-0.5 size-4 shrink-0" />{SITE.email}</a>
          <span className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{SITE.address}</span>
          <span className="flex items-start gap-2"><Clock className="mt-0.5 size-4 shrink-0" />{SITE.hours}</span>
        </address>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-[var(--text-3)] md:flex-row md:items-center md:justify-between">
          <p>{`© ${new Date().getFullYear()} ${SITE.name}. Бүх эрх хуулиар хамгаалагдсан.`}</p>
          <p className="max-w-xl md:text-right">{DEMO_NOTICE}</p>
        </div>
      </div>
    </footer>
  );
}
