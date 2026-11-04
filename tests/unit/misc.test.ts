import test from "node:test";
import assert from "node:assert/strict";
import { checkoutSchema, couponSchema, phoneSchema, productSchema, registerSchema } from "../../src/lib/validation";
import { signSession, verifySession, checkCredentials, safeEqual } from "../../src/lib/admin-auth";
import { can } from "../../src/lib/admin-roles";
import { filterProducts, parseFilters, toQuery } from "../../src/lib/catalog-query";
import { buildProducts, categories } from "../../src/lib/data/catalog";
import { slugify } from "../../src/lib/slug";
import { generateOrderNumber } from "../../src/lib/order-number";
import { providers } from "../../src/lib/payments/registry";

test("phone validation accepts Mongolian formats", () => {
  for (const ok of ["99112233", "+976 9911 2233", "976-88014567", "(80) 112299"]) assert.ok(phoneSchema.safeParse(ok).success, ok);
  for (const bad of ["1234567", "abcdefgh", "991122334", "11112233", ""]) assert.ok(!phoneSchema.safeParse(bad).success, bad);
  assert.equal(phoneSchema.parse("+976 9911 2233"), "99112233");
});

const base = { name: "Бат", phone: "99112233", email: "a@b.mn", city: "Улаанбаатар", district: "Хан Уул", khoroo: "", detail: "Байр 12, тоот 4", notes: "", method: "standard", payment: "qpay" } as const;
test("checkout schema: required fields, district, address, pickup", () => {
  assert.ok(checkoutSchema.safeParse(base).success);
  assert.ok(!checkoutSchema.safeParse({ ...base, name: "" }).success);
  assert.ok(!checkoutSchema.safeParse({ ...base, email: "bad" }).success);
  assert.ok(!checkoutSchema.safeParse({ ...base, district: "" }).success);
  assert.ok(!checkoutSchema.safeParse({ ...base, detail: "12" }).success);
  assert.ok(!checkoutSchema.safeParse({ ...base, payment: "paypal" }).success);
  assert.ok(!checkoutSchema.safeParse({ ...base, method: "pickup" }).success);
  assert.ok(checkoutSchema.safeParse({ ...base, method: "pickup", pickupPointId: "pk1", detail: "", district: "" }).success);
  assert.ok(checkoutSchema.safeParse({ ...base, city: "Дархан Уул", district: "" }).success);
});

test("register, product and coupon schemas", () => {
  assert.ok(!registerSchema.safeParse({ name: "Бат", email: "a@b.mn", phone: "99112233", password: "short", confirm: "short" }).success);
  assert.ok(!registerSchema.safeParse({ name: "Бат", email: "a@b.mn", phone: "99112233", password: "longenough1", confirm: "different1" }).success);
  assert.ok(registerSchema.safeParse({ name: "Бат", email: "a@b.mn", phone: "99112233", password: "longenough1", confirm: "longenough1" }).success);
  const p = { name: "Тест", slug: "test-product", sku: "T1", categoryId: "c", short: "Товч тайлбар", description: "Дэлгэрэнгүй тайлбар бичлэг", price: 5000, compareAtPrice: null, stock: 3, lowStockThreshold: 5 };
  assert.ok(productSchema.safeParse(p).success);
  assert.ok(!productSchema.safeParse({ ...p, price: 50 }).success);
  assert.ok(!productSchema.safeParse({ ...p, price: 5000, compareAtPrice: 4000 }).success);
  assert.ok(!productSchema.safeParse({ ...p, stock: -1 }).success);
  assert.ok(!productSchema.safeParse({ ...p, slug: "Bad Slug" }).success);
  assert.ok(!couponSchema.safeParse({ code: "x", type: "percent", value: 10, minSubtotal: 0, maxDiscount: 0, description: "abc", usageLimit: 0 }).success);
  assert.ok(!couponSchema.safeParse({ code: "ABC", type: "percent", value: 95, minSubtotal: 0, maxDiscount: 0, description: "abc", usageLimit: 0 }).success);
  assert.ok(couponSchema.safeParse({ code: "abc10", type: "percent", value: 10, minSubtotal: 0, maxDiscount: 0, description: "abc", usageLimit: 0 }).success);
});

test("admin session: sign, verify, tamper, expiry, roles", async () => {
  const t = await signSession({ email: "a@b.mn", role: "staff" });
  const s = await verifySession(t);
  assert.equal(s?.role, "staff");
  const [body, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ email: "a@b.mn", role: "admin", exp: 9999999999 })).toString("base64url");
  assert.equal(await verifySession(`${forged}.${sig}`), null);
  assert.equal(await verifySession(`${body}.AAAA`), null);
  assert.equal(await verifySession("garbage"), null);
  assert.equal(await verifySession(undefined), null);
  const old = Buffer.from(JSON.stringify({ email: "a@b.mn", role: "admin", exp: 1 })).toString("base64url");
  assert.equal(await verifySession(`${old}.x`), null);
  assert.equal(can("staff", "orders"), true);
  assert.equal(can("staff", "marketing"), false);
  assert.equal(can("staff", "products.write"), false);
  assert.equal(can("admin", "delivery"), true);
  assert.equal(can(undefined, "orders"), false);
});

test("admin credentials: demo accounts only in demo mode without env", () => {
  assert.equal(checkCredentials("admin@niislel.mn", "Admin#2026demo"), "admin");
  assert.equal(checkCredentials("STAFF@niislel.mn", "Staff#2026demo"), "staff");
  assert.equal(checkCredentials("admin@niislel.mn", "wrong"), null);
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";
  assert.equal(checkCredentials("admin@niislel.mn", "Admin#2026demo"), null);
  process.env.NEXT_PUBLIC_DEMO_MODE = "true";
  process.env.ADMIN_EMAIL = "boss@shop.mn"; process.env.ADMIN_PASSWORD = "Real#Pass99";
  assert.equal(checkCredentials("boss@shop.mn", "Real#Pass99"), "admin");
  assert.equal(checkCredentials("admin@niislel.mn", "Admin#2026demo"), null, "demo accounts disabled once real creds are set");
  delete process.env.ADMIN_EMAIL; delete process.env.ADMIN_PASSWORD;
  assert.ok(safeEqual("abc", "abc") && !safeEqual("abc", "abd") && !safeEqual("abc", "abcd"));
});

test("catalog filtering: search (incl. uppercase Cyrillic), category, price, stock, sale, sorting", () => {
  const ps = buildProducts();
  const f = (o: Record<string, string>) => filterProducts(ps, categories, parseFilters(new URLSearchParams(o)));
  assert.ok(f({ q: "ӨВӨЛ" }).some((p) => p.name.includes("Өвөл")));
  assert.ok(f({ q: "ноолуур" }).length >= 5);
  assert.equal(f({ q: "zzzz" }).length, 0);
  assert.ok(f({ category: "leather" }).every((p) => p.categoryId === "cat-leather"));
  assert.equal(f({ category: "nope" }).length, 0);
  assert.ok(f({ min: "100000", max: "200000" }).every((p) => p.price >= 100000 && p.price <= 200000));
  assert.ok(f({ stock: "in" }).every((p) => p.stock > 0));
  assert.ok(f({ sale: "1" }).every((p) => p.compareAtPrice && p.compareAtPrice > p.price));
  const asc = f({ sort: "price_asc", stock: "in" }).map((p) => p.price);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  const desc = f({ sort: "price_desc", stock: "in" }).map((p) => p.price);
  assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
  assert.equal(toQuery({ q: "а б", category: "home", sort: "new", page: 2 }), "?q=%D0%B0+%D0%B1&category=home&sort=new&page=2");
});

test("slug transliteration of Mongolian names, with Ө and Ү", () => {
  assert.equal(slugify("Ноолууран цамц Өвөл"), "noolууran-tsamts-uvul".replace("ууran", "uuran"));
  assert.equal(slugify("Үнэгүй хүргэлт"), "unegui-khurgelt");
  assert.equal(slugify("  Hello World 2 "), "hello-world-2");
});

test("order numbers follow NS + yymmdd + 4 digits", () => {
  assert.match(generateOrderNumber(new Date(2026, 10, 4)), /^NS261104\d{4}$/);
});

test("payment providers are all labelled simulated except cash, and never claim to be paid", async () => {
  for (const id of ["qpay", "socialpay", "bank"] as const) {
    const i = await providers[id].createIntent({ orderNumber: "NS2611040001", amount: 1000, description: "t" });
    assert.equal(i.simulated, true);
    assert.equal(providers[id].simulated, true);
    assert.deepEqual(await providers[id].checkPayment(i.reference), { status: "pending" });
    assert.match(i.provider + (i.display.bank?.holder ?? ""), /демо|Дансаар/);
  }
  assert.equal((await providers.cod.createIntent({ orderNumber: "NS2611040001", amount: 1, description: "t" })).display.kind, "cod");
});
