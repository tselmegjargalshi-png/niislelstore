export const SITE = {
  name: "Нийслэл Стор",
  latin: "Niislel Store",
  tagline: "Монгол чанар, нийслэлийн хэв маяг",
  description:
    "Нийслэл Стор: ноолуур, арьс шир, гэр ахуй, гоо сайхан, байгалийн хүнс зэрэг Монгол чанарын бүтээгдэхүүнийг Улаанбаатарт хүргэнэ. QPay, SocialPay төлбөрийн демо загвартай.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  phone: "7700 1234",
  email: "hello@niislelstore.example",
  address: "Сүхбаатар дүүрэг, 1 дүгээр хороо, Олимпийн гудамж 12, Улаанбаатар",
  hours: "Өдөр бүр 10:00 цагаас 21:00 цаг хүртэл",
} as const;

export const DEMO_NOTICE =
  "Энэ бол демо дэлгүүр. Бүтээгдэхүүн, захиалга, төлбөр бүгд жишээ бөгөөд бодит гүйлгээ хийгдэхгүй.";
