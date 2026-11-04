"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { mnt } from "@/lib/pricing";

const faq: [string, string][] = [
  ["Хүргэлт хэр удаан вэ?", "Улаанбаатар хотод энгийн хүргэлт 1 ба 3 ажлын хоногт, шуурхай хүргэлт 3 цагийн дотор (сонгосон дүүрэгт) хүрнэ. Орон нутагт 4 ажлын хоног."],
  ["QPay, SocialPay жинхэнэ төлбөр мөн үү?", "Үгүй. Энэ бол демо дэлгүүр тул төлбөрийн интерфейс бүгд дуурайлга бөгөөд ямар ч мөнгө шилжихгүй. Бодит QPay болон SocialPay системийг албан ёсны гэрээ, нэвтрэх эрхээр сүүлд холбоно."],
  ["Захиалгаа хэрхэн хянах вэ?", "Захиалгын дугаар болон утасны дугаараараа «Захиалга хянах» хуудаснаас харна. Бүртгэлтэй бол Миний бүртгэл хэсэгт бүх захиалга харагдана."],
  ["Бараагаа буцааж болох уу?", "Хүлээн авснаас хойш 14 хоногийн дотор, ашиглаагүй, сав баглаа боодолтой бол буцаана."],
  ["Купоныг хэрхэн ашиглах вэ?", "Сагс эсвэл захиалгын хуудсан дээр купон кодоо оруулаад «Хэрэглэх» товчийг дарна. Жишээ код: NIISLEL10."],
];

export function HelpBody() {
  const { delivery: d } = useStore();
  if (!d) return <div className="container-x py-16"><div className="skeleton h-64" /></div>;
  return (
<div className="container-x py-10 md:py-16">
      <h1 className="text-3xl md:text-5xl">Тусламж</h1>
      <section id="delivery" className="mt-10 scroll-mt-28">
        <h2 className="text-2xl">Хүргэлтийн үнэ</h2>
        <p className="mt-2 max-w-2xl text-[var(--text-2)]">{`${mnt(d.freeShippingThreshold)} дээш захиалгад Улаанбаатарт энгийн хүргэлт үнэгүй. Салбараас очиж авбал хүргэлтийн төлбөргүй.`}</p>
        <div className="card mt-5 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--text-2)]"><tr><th className="p-3">Дүүрэг</th><th className="p-3">Энгийн</th><th className="p-3">Шуурхай</th><th className="p-3">Хугацаа</th></tr></thead>
          <tbody className="divide-y divide-[var(--line)]">{d.districts.map((x) => <tr key={x.id}><td className="p-3 font-medium">{x.name}</td><td className="tabular p-3">{mnt(x.standardFee)}</td><td className="tabular p-3">{x.expressFee == null ? "Байхгүй" : mnt(x.expressFee)}</td><td className="p-3">{x.standardDays <= 1 ? "1 өдөр" : `${x.standardDays} өдөр`}</td></tr>)}</tbody></table></div>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl">Түгээмэл асуулт</h2>
        <div className="mt-5 grid max-w-3xl gap-3">{faq.map(([q, a]) => <details key={q} className="card group p-5"><summary className="cursor-pointer list-none font-semibold marker:hidden">{q}</summary><p className="mt-3 text-[var(--text-2)]">{a}</p></details>)}</div>
        <Link href="/track" className="btn btn-primary mt-8">Захиалга хянах</Link>
      </section>
    </div>
  
  );
}
