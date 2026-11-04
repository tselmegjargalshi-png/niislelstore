import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid place-items-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Хуудас олдсонгүй</h1>
      <p className="mt-3 max-w-md text-[var(--text-2)]">Таны хайсан хуудас байхгүй эсвэл зөөгдсөн байна.</p>
      <div className="mt-8 flex gap-3"><Link href="/" className="btn btn-primary">Нүүр хуудас</Link><Link href="/products" className="btn btn-ghost">Бараа үзэх</Link></div>
    </div>
  );
}
