/**
 * Нийслэл Стор: жишээ каталог (демо өгөгдөл).
 * Бүх нэр, тайлбар Монгол хэлээр. Үг хооронд зураас хэрэглэхгүй (tests/unit/copy.test.ts шалгана).
 */
import type { ArtKind, Category, ColorOption, Product, ProductTag, Spec } from "../types";

export const categories: Category[] = [
  { id: "cat-cashmere", slug: "cashmere", name: "Ноолуур", description: "Говийн ямааны цэвэр ноолуураар нэхсэн дулаан, зөөлөн цуглуулга.", tone: "#E9E1D6", art: "sweater", sort: 1 },
  { id: "cat-apparel", slug: "apparel", name: "Хувцас", description: "Хотын хэмнэлд тохирсон, үндэсний хээ шингэсэн орчин үеийн хувцас.", tone: "#DCE2EA", art: "jacket", sort: 2 },
  { id: "cat-leather", slug: "leather", name: "Арьс ширэн эдлэл", description: "Монгол арьсаар гараар оёсон цүнх, түрийвч, гутал.", tone: "#E6D9CB", art: "tote", sort: 3 },
  { id: "cat-home", slug: "home", name: "Гэр ахуй", description: "Эсгий, шаазан, байгалийн лаагаар гэрээ дулаацуулаарай.", tone: "#E3E6DD", art: "vase", sort: 4 },
  { id: "cat-beauty", slug: "beauty", name: "Гоо сайхан", description: "Чацаргана, тэмээний сүү, арц зэрэг Монгол түүхий эдтэй арчилгаа.", tone: "#F0E4E0", art: "dropper", sort: 5 },
  { id: "cat-gourmet", slug: "gourmet", name: "Хүнс ба цай", description: "Монгол оронд үйлдвэрлэсэн байгалийн бүтээгдэхүүн, бэлэгт тохиромжтой.", tone: "#EFE6D2", art: "honey", sort: 6 },
  { id: "cat-accessories", slug: "accessories", name: "Гоёл чимэглэл", description: "Мөнгөн эдлэл, торгон алчуур, тэмдэглэлийн дэвтэр.", tone: "#E4E1EC", art: "bracelet", sort: 7 },
];

const C = {
  oat: { name: "Овъёос", hex: "#D9CBB5" },
  camel: { name: "Тэмээн шар", hex: "#B98A5A" },
  charcoal: { name: "Нүүрсэн саарал", hex: "#3E4045" },
  ink: { name: "Шөнийн хөх", hex: "#1F2C4C" },
  ivory: { name: "Зааны яс", hex: "#EFE7DA" },
  rust: { name: "Зосон улаан", hex: "#A5482E" },
  sage: { name: "Хээрийн ногоон", hex: "#7E8C6E" },
  sky: { name: "Тэнгэр хөх", hex: "#6F8FB8" },
  rose: { name: "Цайвар ягаан", hex: "#D8A9A0" },
  black: { name: "Хар", hex: "#1C1C1E" },
  cognac: { name: "Коньяк", hex: "#8A4B26" },
  tan: { name: "Шаргал", hex: "#C29261" },
  white: { name: "Цагаан", hex: "#F4F1EA" },
  celadon: { name: "Хөх ногоон", hex: "#8FB3A6" },
  amber: { name: "Хув", hex: "#D69A3A" },
  silver: { name: "Мөнгөлөг", hex: "#C9CCD1" },
  gold: { name: "Алтлаг", hex: "#C8A15A" },
  plum: { name: "Нил ягаан", hex: "#5B3A55" },
  green: { name: "Чацаргана", hex: "#E08A2E" },
} satisfies Record<string, ColorOption>;

interface Def {
  slug: string;
  name: string;
  cat: string;
  art: ArtKind;
  price: number;
  compareAt?: number;
  colors: ColorOption[];
  sizes?: string[];
  stock: number;
  tags?: ProductTag[];
  short: string;
  description: string;
  highlights: string[];
  specs: Spec[];
  rating: number;
  reviews: number;
  sold: number;
  ageDays: number;
}

const APPAREL = ["XS", "S", "M", "L", "XL"];

const defs: Def[] = [
  /* ── Ноолуур ── */
  {
    slug: "tal-cashmere-sweater", name: "Ноолууран цамц Тал", cat: "cat-cashmere", art: "sweater",
    price: 329000, compareAt: 389000, colors: [C.oat, C.camel, C.charcoal, C.ink], sizes: APPAREL, stock: 42,
    tags: ["featured", "bestseller"], rating: 4.9, reviews: 128, sold: 640, ageDays: 120,
    short: "100% говийн ноолуур, сул загвар, 12 гейжийн нэхээс.",
    description: "Говийн ямааны хамгийн нарийн ширхэгтэй ноолуураар Улаанбаатарт нэхсэн Тал цамц нь хөнгөн мөртлөө гайхалтай дулаан. Сул тайрдас нь өдөр тутмын хувцаслалтаас эхлээд албан ёсны уулзалтад ч зохицно.",
    highlights: ["Ширхэгийн нарийн 15.5 микрон", "Хүзүү, ханцуйндаа давхар нэхээстэй", "Хувцас хадгалах даавуун уут бэлэгтэй"],
    specs: [{ label: "Материал", value: "100% ноолуур" }, { label: "Нэхээс", value: "12 гейж" }, { label: "Үйлдвэрлэсэн", value: "Улаанбаатар" }, { label: "Арчилгаа", value: "Гараар хүйтэн усаар угаана" }],
  },
  {
    slug: "manan-cashmere-scarf", name: "Ноолууран ороолт Манан", cat: "cat-cashmere", art: "scarf",
    price: 159000, compareAt: 189000, colors: [C.ivory, C.camel, C.sky, C.rust], stock: 64,
    tags: ["bestseller"], rating: 4.8, reviews: 96, sold: 820, ageDays: 200,
    short: "Том хэмжээтэй, захдаа сэвсгэр үзүүртэй ороолт.",
    description: "Өглөөний манан шиг хөнгөн Манан ороолт нь 200 см урттай тул мөрөө нөмрөх, хүзүүндээ ороох аль алинд тохиромжтой. Бэлгийн хайрцагтай хүргэгдэнэ.",
    highlights: ["200 × 70 см", "Сойзоор зөөлрүүлсэн гадаргуу", "Бэлгийн хайрцагтай"],
    specs: [{ label: "Материал", value: "100% ноолуур" }, { label: "Хэмжээ", value: "200 × 70 см" }, { label: "Жин", value: "180 г" }],
  },
  {
    slug: "uvul-cashmere-beanie", name: "Ноолууран малгай Өвөл", cat: "cat-cashmere", art: "beanie",
    price: 89000, colors: [C.charcoal, C.oat, C.rust, C.ink], stock: 85,
    tags: ["new"], rating: 4.7, reviews: 41, sold: 210, ageDays: 9,
    short: "Сүлжмэл хээтэй, эргүүлж өмсөх захтай малгай.",
    description: "Өвлийн хүйтэнд толгой, чихийг бүрэн дулаацуулах зузаан сүлжмэл малгай. Эргүүлдэг зах нь салхинаас хамгаална.",
    highlights: ["Давхар зузаан эргүүлэг", "Сунамтгай, нэг хэмжээ", "Загатнахгүй"],
    specs: [{ label: "Материал", value: "100% ноолуур" }, { label: "Хэмжээ", value: "Нэг хэмжээ" }],
  },
  {
    slug: "khangai-cashmere-coat", name: "Ноолууран пальто Хангай", cat: "cat-cashmere", art: "coat",
    price: 1290000, compareAt: 1490000, colors: [C.camel, C.charcoal, C.ivory], sizes: ["S", "M", "L"], stock: 8,
    tags: ["featured"], rating: 5, reviews: 23, sold: 64, ageDays: 60,
    short: "Ноолуур ба ноосон холимог, урт загварын пальто.",
    description: "Хангай пальто нь ноолуур 70%, мериносын ноос 30% бүхий зузаан даавуугаар хийгдсэн. Торгон доторлогоо, гар оёдлын товчтой урт загвар нь өвлийн хамгийн дэгжин сонголт.",
    highlights: ["Торгон доторлогоо", "Гараар оёсон эвэр товч", "Хязгаарлагдмал тоогоор"],
    specs: [{ label: "Материал", value: "70% ноолуур, 30% меринос" }, { label: "Урт", value: "Өвдөгнөөс доош" }, { label: "Арчилгаа", value: "Зөвхөн хими цэвэрлэгээ" }],
  },
  {
    slug: "dulaan-cashmere-blanket", name: "Ноолууран хөнжил Дулаан", cat: "cat-cashmere", art: "blanket",
    price: 459000, colors: [C.oat, C.charcoal, C.sage], stock: 15,
    tags: ["featured"], rating: 4.9, reviews: 37, sold: 112, ageDays: 150,
    short: "Буйдан, орны хөнжил. Хээтэй хүрээтэй.",
    description: "Гэрийнхээ дулаан булангийн гол чимэглэл болох Дулаан хөнжил нь уламжлалт өлзий хээгээр хүрээлэгдсэн. Үеэс үед уламжлах чанартай.",
    highlights: ["130 × 180 см", "Хоёр талдаа хэрэглэж болно", "Даавуун хадгалах уутай"],
    specs: [{ label: "Материал", value: "100% ноолуур" }, { label: "Хэмжээ", value: "130 × 180 см" }, { label: "Жин", value: "1.1 кг" }],
  },
  {
    slug: "aya-cashmere-socks", name: "Ноолууран оймс Аяа", cat: "cat-cashmere", art: "socks",
    price: 39000, compareAt: 49000, colors: [C.oat, C.rose, C.charcoal], sizes: ["36/38", "39/41", "42/44"], stock: 0,
    rating: 4.6, reviews: 58, sold: 430, ageDays: 300,
    short: "Гэртээ өмсөх зөөлөн, дулаан оймс.",
    description: "Нимгэн хэрнээ дулаан Аяа оймс нь ноолуур, нейлоны холимог тул удаан эдэлгээтэй. Гэрийн шаахайтай хослуулахад тохиромжтой.",
    highlights: ["Өсгий, хуруундаа бэхжүүлэлттэй", "Хоёр хос багц"],
    specs: [{ label: "Материал", value: "80% ноолуур, 20% нейлон" }, { label: "Багц", value: "2 хос" }],
  },
  {
    slug: "saruul-cashmere-gloves", name: "Ноолууран бээлий Саруул", cat: "cat-cashmere", art: "gloves",
    price: 69000, colors: [C.camel, C.black, C.ivory], sizes: ["S", "M", "L"], stock: 3,
    tags: ["new"], rating: 4.5, reviews: 12, sold: 48, ageDays: 6,
    short: "Мэдрэгчтэй дэлгэцэнд ажилладаг хуруутай бээлий.",
    description: "Утсаа гаргалгүйгээр ашиглах мэдрэгч хуруутай, ноолууран бээлий. Бугуйндаа сунамтгай хавчаартай.",
    highlights: ["Мэдрэгч дэлгэцийн хуруу", "Сунамтгай бугуйвч"],
    specs: [{ label: "Материал", value: "95% ноолуур, 5% эластан" }],
  },

  /* ── Хувцас ── */
  {
    slug: "modern-deel-jacket", name: "Дээл загварын хүрэм Модерн", cat: "cat-apparel", art: "jacket",
    price: 289000, compareAt: 349000, colors: [C.ink, C.rust, C.black], sizes: APPAREL, stock: 26,
    tags: ["featured", "new"], rating: 4.8, reviews: 34, sold: 150, ageDays: 14,
    short: "Энгэрээ зөрүүлсэн дээлийн хэлбэр, хотын загвар.",
    description: "Монгол дээлийн зөрүү энгэр, туузан товчийг орчин үеийн богино хүрэмтэй хослуулсан бүтээл. Ус нэвтрүүлэхгүй гадар, дулаан доторлогоотой.",
    highlights: ["Уламжлалт туузан товч", "Ус нэвтрүүлэхгүй гадар", "Дотор халаастай"],
    specs: [{ label: "Гадар", value: "Хөвөн, полиэстер холимог" }, { label: "Доторлогоо", value: "Хөнгөн дулаалгатай" }, { label: "Үйлдвэрлэсэн", value: "Улаанбаатар" }],
  },
  {
    slug: "khurd-linen-shirt", name: "Маалинган цамц Хурд", cat: "cat-apparel", art: "shirt",
    price: 119000, colors: [C.white, C.sky, C.sage], sizes: APPAREL, stock: 48,
    tags: ["new"], rating: 4.6, reviews: 22, sold: 95, ageDays: 4,
    short: "Агаар нэвтрүүлдэг, зуны маалинган цамц.",
    description: "Зуны халуун өдрүүдэд зориулсан Хурд цамц нь 100% маалингаар хийгдсэн, зөөлөн угаалгатай. Хүзүүвчгүй, монгол захтай.",
    highlights: ["Монгол зах", "Урьдчилан угааж зөөлрүүлсэн"],
    specs: [{ label: "Материал", value: "100% маалинга" }, { label: "Арчилгаа", value: "30° угаана" }],
  },
  {
    slug: "steppe-wool-vest", name: "Тэмээний ноосон хантааз Говь", cat: "cat-apparel", art: "sweater",
    price: 179000, compareAt: 219000, colors: [C.camel, C.oat], sizes: APPAREL, stock: 19,
    rating: 4.7, reviews: 31, sold: 120, ageDays: 90,
    short: "Тэмээний ноосон, ханцуйгүй дулаан хантааз.",
    description: "Тэмээний ноос нь хөнгөн бөгөөд дулаан хадгалах чадвар өндөр. Говь хантааз нь цамцан дээр давхарлан өмсөхөд төгс.",
    highlights: ["Тэмээний цэвэр ноос", "Хөнгөн жинтэй"],
    specs: [{ label: "Материал", value: "100% тэмээний ноос" }],
  },
  {
    slug: "city-overshirt", name: "Хөвөн хүрэм Хот", cat: "cat-apparel", art: "jacket",
    price: 159000, colors: [C.sage, C.charcoal, C.tan], sizes: APPAREL, stock: 33,
    rating: 4.5, reviews: 18, sold: 77, ageDays: 45,
    short: "Зузаан хөвөн даавуун, хоёр халаастай хүрэм цамц.",
    description: "Хаврын сэрүүн өдрүүдэд цамцан дээрээ өмсөх Хот хүрэм нь зузаан хөвөн даавуугаар хийгдсэн, хоёр том энгэрийн халаастай.",
    highlights: ["Зузаан хөвөн твил", "Металл товч"],
    specs: [{ label: "Материал", value: "100% хөвөн" }],
  },

  /* ── Арьс ширэн эдлэл ── */
  {
    slug: "gobi-leather-tote", name: "Арьсан цүнх Говь", cat: "cat-leather", art: "tote",
    price: 349000, compareAt: 429000, colors: [C.cognac, C.black, C.tan], stock: 14,
    tags: ["featured", "bestseller"], rating: 4.9, reviews: 74, sold: 310, ageDays: 180,
    short: "Үхрийн арьсан, том багтаамжтай гар цүнх.",
    description: "Монгол үхрийн ширийг ургамлын аргаар идээлж, гараар оёсон Говь цүнх нь 14 инчийн зөөврийн компьютер багтаана. Хэрэглэх тусам өнгө нь гүнзгийрч, илүү үзэсгэлэнтэй болно.",
    highlights: ["Ургамлын идээлгэтэй арьс", "Дотор цахилгаантай халаас", "14 инчийн компьютер багтана"],
    specs: [{ label: "Материал", value: "Үхрийн арьс" }, { label: "Хэмжээ", value: "38 × 32 × 12 см" }, { label: "Баталгаа", value: "2 жил" }],
  },
  {
    slug: "khan-leather-wallet", name: "Арьсан түрийвч Хаан", cat: "cat-leather", art: "wallet",
    price: 89000, colors: [C.cognac, C.black], stock: 52,
    tags: ["bestseller"], rating: 4.8, reviews: 142, sold: 900, ageDays: 260,
    short: "Нимгэн загвар, 8 картын үүртэй.",
    description: "Халаасанд багтах нимгэн Хаан түрийвч нь 8 карт, мөнгөн дэвсгэртийн тасалгаатай. Хүссэн үсгээ сийлүүлэх боломжтой.",
    highlights: ["8 картын үүр", "Нэрийн үсэг сийлүүлэх боломжтой"],
    specs: [{ label: "Материал", value: "Үхрийн арьс" }, { label: "Хэмжээ", value: "11 × 9 см" }],
  },
  {
    slug: "nomad-crossbody", name: "Мөрөвчтэй цүнх Нүүдэл", cat: "cat-leather", art: "crossbody",
    price: 219000, colors: [C.tan, C.black, C.rust], stock: 21,
    tags: ["new"], rating: 4.7, reviews: 19, sold: 66, ageDays: 11,
    short: "Жижиг, хөнгөн, тохируулгатай мөрөвчтэй.",
    description: "Утас, түрийвч, түлхүүрээ авч явах Нүүдэл цүнх нь хотын өдөр тутмын хамтрагч. Мөрөвчийг уртасгаж, богиносгох боломжтой.",
    highlights: ["Тохируулгатай мөрөвч", "Соронзон хаалт"],
    specs: [{ label: "Материал", value: "Үхрийн арьс" }, { label: "Хэмжээ", value: "22 × 15 × 6 см" }],
  },
  {
    slug: "tumen-leather-belt", name: "Арьсан бүс Түмэн", cat: "cat-leather", art: "belt",
    price: 79000, colors: [C.cognac, C.black], sizes: ["90", "100", "110"], stock: 37,
    rating: 4.6, reviews: 40, sold: 210, ageDays: 210,
    short: "Гууль тэврэлттэй, 3.5 см өргөн бүс.",
    description: "Зузаан нэг давхар арьсаар хийсэн Түмэн бүс нь өлзий хээ сийлсэн гууль тэврэлттэй.",
    highlights: ["Гууль тэврэлт", "Өлзий хээний сийлбэр"],
    specs: [{ label: "Материал", value: "Үхрийн арьс, гууль" }, { label: "Өргөн", value: "3.5 см" }],
  },
  {
    slug: "terleg-leather-boots", name: "Арьсан гутал Тэрлэг", cat: "cat-leather", art: "boots",
    price: 459000, compareAt: 529000, colors: [C.cognac, C.black], sizes: ["38", "39", "40", "41", "42", "43"], stock: 7,
    tags: ["featured"], rating: 4.8, reviews: 27, sold: 88, ageDays: 75,
    short: "Монгол гутлын хэлбэр шингэсэн, дулаан доторлогоотой.",
    description: "Уламжлалт монгол гутлын хошуу, оёдлын хээг орчин үеийн ултай хослуулсан Тэрлэг гутал. Хонины ноосон доторлогоо нь хасах 30 хэмд ч хөлийг дулаан байлгана.",
    highlights: ["Хонины ноосон доторлогоо", "Гулсалтын эсрэг ул", "Гараар оёсон хээ"],
    specs: [{ label: "Гадар", value: "Үхрийн арьс" }, { label: "Доторлогоо", value: "Хонины ноос" }, { label: "Ул", value: "Резин" }],
  },

  /* ── Гэр ахуй ── */
  {
    slug: "esgii-felt-slippers", name: "Эсгий шаахай Гэрэл", cat: "cat-home", art: "slippers",
    price: 45000, colors: [C.charcoal, C.oat, C.rust], sizes: ["36/37", "38/39", "40/41", "42/43"], stock: 70,
    tags: ["bestseller"], rating: 4.8, reviews: 210, sold: 1400, ageDays: 330,
    short: "Хонины ноосон эсгий, гулсдаггүй ултай.",
    description: "Монгол эсгий нь агаар нэвтрүүлж, хөлийг дулаан хуурай байлгана. Гэрэл шаахайг гар урчууд нэг бүрчлэн хийдэг.",
    highlights: ["Гар хийцийн эсгий", "Арьсан ул"],
    specs: [{ label: "Материал", value: "Хонины ноос, арьс" }],
  },
  {
    slug: "khukh-tengri-cup", name: "Шаазан аяга Хөх тэнгэр", cat: "cat-home", art: "cup",
    price: 39000, colors: [C.sky, C.white, C.celadon], stock: 95,
    tags: ["new"], rating: 4.7, reviews: 33, sold: 260, ageDays: 3,
    short: "Гараар өнгөлсөн, 280 мл шаазан аяга.",
    description: "Монгол тэнгэрийн хөхөөр өнгөлсөн Хөх тэнгэр аяга бүр давтагдашгүй өнгө, хээтэй. Сүүтэй цай, кофе ууханд тохиромжтой.",
    highlights: ["280 мл", "Аяга таваг угаагч машинд угааж болно"],
    specs: [{ label: "Материал", value: "Шаазан" }, { label: "Багтаамж", value: "280 мл" }],
  },
  {
    slug: "shavar-ceramic-vase", name: "Гар урлалын ваар Шавар", cat: "cat-home", art: "vase",
    price: 129000, compareAt: 159000, colors: [C.ivory, C.sage, C.rust], stock: 12,
    tags: ["featured"], rating: 4.9, reviews: 15, sold: 44, ageDays: 40,
    short: "Монгол шавраар хийсэн, бүдэг паалантай ваар.",
    description: "Шавар ваар нь нутгийн шаврыг гараар эргүүлж, бүдэг паалангаар бүрсэн бүтээл. Хуурай цэцэг, хялгана тавихад гоё.",
    highlights: ["Гар хийц", "Өндөр 28 см"],
    specs: [{ label: "Материал", value: "Шавар, паалан" }, { label: "Өндөр", value: "28 см" }],
  },
  {
    slug: "olzii-felt-cushion", name: "Эсгий дэр Өлзий", cat: "cat-home", art: "cushion",
    price: 69000, colors: [C.ink, C.rust, C.oat], stock: 30,
    rating: 4.6, reviews: 21, sold: 130, ageDays: 100,
    short: "Өлзий хээ шивсэн, эсгий бүрээстэй дэр.",
    description: "Эсгий дээр өлзий хээг гараар шивж хийсэн дэрний бүрээс. Дотор нь ноосон дүүргэгчтэй.",
    highlights: ["45 × 45 см", "Салгаж угаах бүрээс"],
    specs: [{ label: "Материал", value: "Эсгий, ноосон дүүргэгч" }, { label: "Хэмжээ", value: "45 × 45 см" }],
  },
  {
    slug: "arts-juniper-candle", name: "Байгалийн лаа Арц", cat: "cat-home", art: "candle",
    price: 49000, colors: [C.sage, C.amber], stock: 58,
    tags: ["bestseller"], rating: 4.9, reviews: 167, sold: 1100, ageDays: 240,
    short: "Арц, хуш модны үнэртэй шар тосон лаа.",
    description: "Монгол арц, хуш модны үнэрийг шингээсэн Арц лаа нь 40 цаг асна. Шилэн савыг дахин ашиглах боломжтой.",
    highlights: ["40 цаг асна", "Шар тос, хөвөн зулаа"],
    specs: [{ label: "Үнэр", value: "Арц, хуш" }, { label: "Жин", value: "220 г" }],
  },
  {
    slug: "saran-ceramic-bowl", name: "Шаазан таваг Саран", cat: "cat-home", art: "bowl",
    price: 59000, colors: [C.white, C.celadon], stock: 40,
    rating: 4.5, reviews: 11, sold: 60, ageDays: 70,
    short: "Гүн хэлбэрийн, гоймон, шөлөнд тохиромжтой таваг.",
    description: "Саран таваг нь өдөр тутмын хэрэглээнд зориулсан бат бөх шаазан. Ирмэгээрээ гар өнгөлгөөтэй.",
    highlights: ["Ø 18 см", "Богино долгионы зууханд хэрэглэж болно"],
    specs: [{ label: "Материал", value: "Шаазан" }, { label: "Диаметр", value: "18 см" }],
  },

  /* ── Гоо сайхан ── */
  {
    slug: "temee-camel-milk-cream", name: "Тэмээний сүүтэй тос Говийн нар", cat: "cat-beauty", art: "jar",
    price: 69000, colors: [C.ivory], stock: 44,
    tags: ["bestseller"], rating: 4.8, reviews: 89, sold: 520, ageDays: 160,
    short: "Хуурай арьсанд зориулсан чийгшүүлэх тос.",
    description: "Тэмээний сүүний байгалийн тос, витаминууд арьсыг гүнзгий чийгшүүлж, өвлийн хүйтэн салхинаас хамгаална.",
    highlights: ["50 мл", "Үнэргүй", "Мэдрэг арьсанд тохиромжтой"],
    specs: [{ label: "Багтаамж", value: "50 мл" }, { label: "Арьсны төрөл", value: "Хуурай, мэдрэг" }],
  },
  {
    slug: "chatsargana-serum", name: "Чацарганы серум Алтан", cat: "cat-beauty", art: "dropper",
    price: 89000, compareAt: 109000, colors: [C.green], stock: 28,
    tags: ["featured", "new"], rating: 4.9, reviews: 53, sold: 240, ageDays: 8,
    short: "Омега 7 баялаг, гэрэлтүүлэх серум.",
    description: "Увс нутгийн чацарганы үрийн тосыг гиалуроны хүчилтэй хослуулсан Алтан серум нь арьсыг гэрэлтүүлж, уян хатан болгоно.",
    highlights: ["30 мл", "Омега 7", "Парабенгүй"],
    specs: [{ label: "Багтаамж", value: "30 мл" }, { label: "Гол орц", value: "Чацарганы тос" }],
  },
  {
    slug: "arts-essential-oil", name: "Арцны эфирийн тос", cat: "cat-beauty", art: "bottle",
    price: 39000, colors: [C.amber], stock: 0,
    rating: 4.7, reviews: 29, sold: 180, ageDays: 280,
    short: "Цэвэр арцны тос, тайвшруулах үйлчилгээтэй.",
    description: "Хангайн арцаас нэрсэн цэвэр эфирийн тос. Үнэрийн аппарат, массажны тосонд нэмж хэрэглэнэ.",
    highlights: ["10 мл", "100% цэвэр"],
    specs: [{ label: "Багтаамж", value: "10 мл" }],
  },
  {
    slug: "yamaa-goat-milk-soap", name: "Ямааны сүүтэй саван", cat: "cat-beauty", art: "soap",
    price: 19000, colors: [C.oat, C.rose], stock: 120,
    rating: 4.6, reviews: 64, sold: 760, ageDays: 190,
    short: "Гар аргаар хүйтэн процессоор хийсэн саван.",
    description: "Ямааны сүү, хонины тос, зөгийн лаагаар хийсэн зөөлөн саван. Арьсыг хуурайшуулахгүй.",
    highlights: ["110 г", "Гар хийц"],
    specs: [{ label: "Жин", value: "110 г" }],
  },
  {
    slug: "hand-cream-tsetseg", name: "Гарын тос Цэцэг", cat: "cat-beauty", art: "tube",
    price: 29000, colors: [C.rose, C.sage], stock: 66,
    tags: ["new"], rating: 4.5, reviews: 14, sold: 90, ageDays: 5,
    short: "Хурдан шингэдэг, тос үлдээдэггүй гарын тос.",
    description: "Хээрийн цэцгийн хандтай, цүнхэнд багтах гарын тос. Өвлийн хуурай агаарт гарыг зөөлөн байлгана.",
    highlights: ["75 мл", "Хээрийн цэцгийн үнэр"],
    specs: [{ label: "Багтаамж", value: "75 мл" }],
  },

  /* ── Хүнс ба цай ── */
  {
    slug: "mongol-tea-set", name: "Монгол цайны багц Найрамдал", cat: "cat-gourmet", art: "teabox",
    price: 49000, compareAt: 59000, colors: [C.rust], stock: 80,
    tags: ["bestseller"], rating: 4.8, reviews: 77, sold: 640, ageDays: 140,
    short: "Ногоон цай, ганга, тэх шувуун хошуу гурвын багц.",
    description: "Монгол нутгийн ургамлын цайнуудыг нэг дор цуглуулсан бэлгийн багц. Нэг хайрцагт 3 төрлийн цай, 45 уут.",
    highlights: ["3 төрөл", "45 уут", "Бэлгийн хайрцагтай"],
    specs: [{ label: "Жин", value: "135 г" }, { label: "Хадгалах", value: "Хуурай сэрүүн газар" }],
  },
  {
    slug: "bal-wild-honey", name: "Байгалийн зөгийн бал Хангай", cat: "cat-gourmet", art: "honey",
    price: 35000, colors: [C.amber], stock: 90,
    tags: ["featured"], rating: 4.9, reviews: 102, sold: 980, ageDays: 220,
    short: "Сэлэнгийн хээрийн цэцгийн бал, 500 г.",
    description: "Сэлэнгэ аймгийн цэцэгт хөндийн зөгийн аж ахуйгаас шууд ирдэг цэвэр бал. Ямар ч нэмэлт, хольцгүй.",
    highlights: ["500 г", "Лабораторийн шинжилгээтэй"],
    specs: [{ label: "Жин", value: "500 г" }, { label: "Гарал", value: "Сэлэнгэ аймаг" }],
  },
  {
    slug: "chatsargana-juice", name: "Чацарганы шүүс Увс", cat: "cat-gourmet", art: "juice",
    price: 12000, colors: [C.green], stock: 150,
    rating: 4.6, reviews: 45, sold: 1300, ageDays: 110,
    short: "Витамин С баялаг, элсэн чихэр багатай шүүс.",
    description: "Увсын чацарганыг шахаж, байгалийн аргаар хадгалсан шүүс. Өдөрт нэг шил дархлааг дэмжинэ.",
    highlights: ["1 литр", "Элсэн чихэр нэмээгүй"],
    specs: [{ label: "Багтаамж", value: "1 л" }],
  },
  {
    slug: "dark-chocolate-gobi", name: "Хар шоколад Говь 70%", cat: "cat-gourmet", art: "chocolate",
    price: 15000, colors: [C.cognac], stock: 110,
    tags: ["new"], rating: 4.7, reviews: 26, sold: 340, ageDays: 2,
    short: "Чацарганы үртэй 70% какаотой шоколад.",
    description: "Улаанбаатарын жижиг цехэд хийсэн хар шоколад. Чацарганы хатаасан жимс нь исгэлэн амт нэмнэ.",
    highlights: ["80 г", "70% какао"],
    specs: [{ label: "Жин", value: "80 г" }],
  },
  {
    slug: "tsagaan-sar-gift-box", name: "Бэлгийн багц Цагаан сар", cat: "cat-gourmet", art: "giftbox",
    price: 189000, compareAt: 229000, colors: [C.ink, C.gold], stock: 18,
    tags: ["featured"], rating: 4.9, reviews: 31, sold: 150, ageDays: 30,
    short: "Цай, бал, шоколад, лаа багтсан бэлгийн хайрцаг.",
    description: "Ойр дотны хүмүүстээ бэлэглэх тансаг хайрцаг. Монгол цайны багц, зөгийн бал, хар шоколад, Арц лаа багтсан.",
    highlights: ["4 бүтээгдэхүүн", "Мэндчилгээний карттай"],
    specs: [{ label: "Багтсан", value: "Цай, бал, шоколад, лаа" }],
  },

  /* ── Гоёл чимэглэл ── */
  {
    slug: "olzii-silver-bracelet", name: "Мөнгөн бугуйвч Өлзий", cat: "cat-accessories", art: "bracelet",
    price: 189000, colors: [C.silver, C.gold], stock: 11,
    tags: ["featured", "bestseller"], rating: 5, reviews: 48, sold: 190, ageDays: 170,
    short: "925 сорьцын мөнгө, өлзий хээтэй бугуйвч.",
    description: "Монгол дархны гарын бүтээл болох Өлзий бугуйвч нь хязгааргүй аз жаргал, урт удаан амьдралын бэлгэдлийг агуулна.",
    highlights: ["925 сорьцын мөнгө", "Бэлгийн хайрцагтай", "Гарчилгаатай баталгаа"],
    specs: [{ label: "Материал", value: "925 мөнгө" }, { label: "Жин", value: "18 г" }],
  },
  {
    slug: "od-silver-earrings", name: "Мөнгөн ээмэг Од", cat: "cat-accessories", art: "earrings",
    price: 99000, compareAt: 119000, colors: [C.silver, C.gold], stock: 24,
    tags: ["new"], rating: 4.8, reviews: 17, sold: 70, ageDays: 7,
    short: "Хөнгөн, унжлагатай мөнгөн ээмэг.",
    description: "Шөнийн тэнгэрийн одноос санаа авсан Од ээмэг нь өдөр тутам зүүхэд хөнгөн, тохилог.",
    highlights: ["925 сорьцын мөнгө", "Харшил үүсгэхгүй"],
    specs: [{ label: "Материал", value: "925 мөнгө" }],
  },
  {
    slug: "silk-scarf-khee", name: "Торгон алчуур Хээ", cat: "cat-accessories", art: "scarf",
    price: 129000, colors: [C.ink, C.rust, C.celadon], stock: 16,
    rating: 4.7, reviews: 20, sold: 85, ageDays: 95,
    short: "Уламжлалт хээтэй, 90 см дөрвөлжин торгон алчуур.",
    description: "Монгол хээ угалзыг орчин үеийн өнгөөр шинэчилсэн Хээ алчуур нь хүзүү, цүнх, үсэнд ч зүүж болно.",
    highlights: ["100% торго", "90 × 90 см", "Гараар эмжсэн ирмэг"],
    specs: [{ label: "Материал", value: "100% торго" }, { label: "Хэмжээ", value: "90 × 90 см" }],
  },
  {
    slug: "nuudel-notebook", name: "Тэмдэглэлийн дэвтэр Нүүдэл", cat: "cat-accessories", art: "notebook",
    price: 35000, colors: [C.cognac, C.ink, C.sage], stock: 75,
    rating: 4.6, reviews: 38, sold: 410, ageDays: 125,
    short: "Арьсан хавтастай, 192 хуудас дэвтэр.",
    description: "Санаа, аяллын тэмдэглэлээ хөтлөх Нүүдэл дэвтэр нь солих боломжтой цаасан блоктой.",
    highlights: ["192 хуудас", "Солих блок", "A5 хэмжээ"],
    specs: [{ label: "Хэмжээ", value: "A5" }, { label: "Хуудас", value: "192" }],
  },
];

export function buildProducts(now = new Date()): Product[] {
  return defs.map((d, i) => {
    const created = new Date(now.getTime() - d.ageDays * 86400000).toISOString();
    return {
      id: `p${String(i + 1).padStart(3, "0")}`,
      slug: d.slug,
      sku: `NS${String(1000 + i * 7)}`,
      name: d.name,
      categoryId: d.cat,
      short: d.short,
      description: d.description,
      highlights: d.highlights,
      specs: d.specs,
      price: d.price,
      compareAtPrice: d.compareAt ?? null,
      colors: d.colors,
      sizes: d.sizes ?? [],
      stock: d.stock,
      lowStockThreshold: 5,
      art: d.art,
      images: [{ kind: "art", view: 0 }, { kind: "art", view: 1 }, { kind: "art", view: 2 }, { kind: "art", view: 3 }],
      tags: d.tags ?? [],
      visible: true,
      rating: d.rating,
      reviewCount: d.reviews,
      soldCount: d.sold,
      createdAt: created,
      updatedAt: created,
    };
  });
}

/** Server талын SEO metadata (generateMetadata, sitemap) ашиглана. */
export const seedProductIndex = defs.map((d) => ({ slug: d.slug, name: d.name, short: d.short, price: d.price }));
