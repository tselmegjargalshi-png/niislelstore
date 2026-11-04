import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div><p className="eyebrow">404</p><h1 className="mt-3 text-4xl">Хуудас олдсонгүй</h1><Link href="/" className="btn btn-primary mt-8">Нүүр хуудас</Link></div>
    </div>
  );
}
