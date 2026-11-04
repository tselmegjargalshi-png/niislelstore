import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { installBrowser } from "./setup";
installBrowser();
import { LocalRepository } from "../../src/lib/data/local-repository";
import { RepositoryError } from "../../src/lib/data/repository";
import { quoteOrder } from "../../src/lib/pricing";
import type { Order, Product } from "../../src/lib/types";

let repo: LocalRepository;
beforeEach(async () => {
  (globalThis as unknown as { localStorage: { clear(): void } }).localStorage.clear();
  repo = new LocalRepository();
  await repo.resetDemo();
});

async function draft(productId: string, qty: number, couponCode: string | null = null, district = "Хан Уул") {
  const p = (await repo.getProduct(productId))!;
  const delivery = await repo.getDelivery();
  const coupon = couponCode ? await repo.findCoupon(couponCode) : null;
  const q = quoteOrder({ lines: [{ unitPrice: p.price, quantity: qty }], coupon, settings: delivery, method: "standard", city: "Улаанбаатар", district });
  return {
    number: `NS26110499${String(Math.floor(Math.random() * 90) + 10)}`, customerId: null, contact: { name: "Тест", phone: "99112233", email: "t@example.mn" },
    shipping: { method: "standard", city: "Улаанбаатар", district, khoroo: "1", detail: "Тест хаяг 1", notes: "", estimate: q.delivery.estimate, fee: q.pricing.deliveryFee },
    items: [{ productId, name: p.name, sku: p.sku, art: p.art, color: p.colors[0]?.name, size: p.sizes[0], unitPrice: p.price, quantity: qty }],
    pricing: q.pricing, couponCode: q.coupon?.ok ? q.coupon.coupon.code : null,
    payment: { method: "qpay", status: "awaiting", provider: "QPay (демо)", reference: "SIM1", simulated: true, paidAt: null },
  } as Omit<Order, "id" | "history" | "status" | "createdAt" | "updatedAt">;
}

test("placing an order reduces stock, records movement and bumps coupon usage", async () => {
  const before = (await repo.getProduct("p001"))!;
  const cBefore = (await repo.findCoupon("NIISLEL10"))!;
  const o = await repo.placeOrder({ order: await draft("p001", 2, "NIISLEL10") });
  assert.equal(o.status, "pending");
  assert.equal((await repo.getProduct("p001"))!.stock, before.stock - 2);
  assert.equal((await repo.getProduct("p001"))!.soldCount, before.soldCount + 2);
  assert.equal((await repo.findCoupon("NIISLEL10"))!.usedCount, cBefore.usedCount + 1);
  const mv = (await repo.listInventory("p001"))[0];
  assert.deepEqual([mv.delta, mv.reason, mv.reference], [-2, "order", o.number]);
  assert.ok(await repo.getOrder(o.number));
});

test("insufficient stock rejects the whole order and changes nothing", async () => {
  const p = (await repo.getProduct("p004"))!; // Хангай пальто, stock 8
  const d = await draft("p004", 1);
  d.items.push({ ...d.items[0], productId: "p001", quantity: 1000 });
  const ordersBefore = (await repo.listOrders()).length;
  await assert.rejects(() => repo.placeOrder({ order: d }), (e) => e instanceof RepositoryError && e.code === "stock");
  assert.equal((await repo.getProduct("p004"))!.stock, p.stock);
  assert.equal((await repo.listOrders()).length, ordersBefore);
});

test("sold out and hidden products cannot be ordered", async () => {
  const out = (await repo.listProducts()).find((p) => p.stock === 0)!;
  await assert.rejects(async () => repo.placeOrder({ order: await draft(out.id, 1) }), /үлдэгдэл/);
  const p = (await repo.getProduct("p001"))!;
  await repo.saveProduct({ ...p, visible: false });
  await assert.rejects(async () => repo.placeOrder({ order: await draft("p001", 1) }), (e) => e instanceof RepositoryError && e.code === "stock");
});

test("tampered prices are rejected by authoritative server side recompute", async () => {
  const d = await draft("p001", 1);
  d.pricing = { ...d.pricing, total: 1000 };
  await assert.rejects(() => repo.placeOrder({ order: d }), (e) => e instanceof RepositoryError && e.code === "conflict");
  const d2 = await draft("p001", 1);
  d2.couponCode = "ZUN15";
  await assert.rejects(() => repo.placeOrder({ order: d2 }), RepositoryError);
});

test("cancelling restores stock once and marks paid orders refunded", async () => {
  const before = (await repo.getProduct("p002"))!.stock;
  const o = await repo.placeOrder({ order: await draft("p002", 3) });
  await repo.updatePaymentStatus(o.number, "paid");
  const c = await repo.updateOrderStatus(o.number, "cancelled", "Тест");
  assert.equal(c.status, "cancelled");
  assert.equal(c.payment.status, "refunded");
  assert.equal((await repo.getProduct("p002"))!.stock, before);
  await assert.rejects(() => repo.updateOrderStatus(o.number, "confirmed"), /Цуцлагдсан/);
  assert.equal((await repo.getProduct("p002"))!.stock, before, "no double restock");
});

test("status flow and COD becomes paid on delivery", async () => {
  const d = await draft("p002", 1);
  d.payment = { ...d.payment, method: "cod", status: "unpaid" };
  const o = await repo.placeOrder({ order: d });
  for (const s of ["confirmed", "processing", "shipped", "delivered"] as const) await repo.updateOrderStatus(o.number, s);
  const done = (await repo.getOrder(o.number))!;
  assert.equal(done.status, "delivered");
  assert.equal(done.payment.status, "paid");
  assert.deepEqual(done.history.map((h) => h.status), ["pending", "confirmed", "processing", "shipped", "delivered"]);
  await assert.rejects(() => repo.updateOrderStatus(o.number, "pending"), /Хүргэгдсэн/);
});

test("product CRUD: create, edit, duplicate slug/sku, delete", async () => {
  const base = (await repo.getProduct("p001"))!;
  const created = await repo.saveProduct({ ...base, id: "", slug: "shine-bagts", sku: "NSTEST1", name: "Шинэ багц", stock: 7 });
  assert.ok(created.id);
  assert.equal((await repo.getProductBySlug("shine-bagts"))!.stock, 7);
  assert.equal((await repo.listInventory(created.id))[0].reason, "create");
  await assert.rejects(() => repo.saveProduct({ ...base, id: "", slug: "shine-bagts", sku: "NSTEST2" }), /давхар|байна/);
  await assert.rejects(() => repo.saveProduct({ ...base, id: "", slug: "other-slug", sku: "NSTEST1" }), /SKU/);
  const edited = await repo.saveProduct({ ...created, price: 123000, stock: 10 });
  assert.equal(edited.price, 123000);
  assert.equal((await repo.listInventory(created.id))[0].delta, 3);
  await repo.deleteProduct(created.id);
  assert.equal(await repo.getProduct(created.id), null);
});

test("manual stock adjustments cannot go negative", async () => {
  const p = (await repo.getProduct("p001"))!;
  const up = await repo.adjustStock("p001", 5, "restock");
  assert.equal(up.stock, p.stock + 5);
  await assert.rejects(() => repo.adjustStock("p001", -9999, "manual"), (e) => e instanceof RepositoryError && e.code === "stock");
});

test("categories with products cannot be deleted", async () => {
  await assert.rejects(() => repo.deleteCategory("cat-cashmere"), /устгах боломжгүй/);
  const c = await repo.saveCategory({ id: "", slug: "temp", name: "Түр", description: "", tone: "#fff", art: "cup", sort: 99 });
  await repo.deleteCategory(c.id);
});

test("coupon CRUD uppercases and rejects duplicates", async () => {
  const c = await repo.saveCoupon({ id: "", code: " test5 ", type: "percent", value: 5, minSubtotal: 0, maxDiscount: 0, description: "x", active: true, usageLimit: 0, usedCount: 0, createdAt: new Date().toISOString() });
  assert.equal(c.code, "TEST5");
  await assert.rejects(() => repo.saveCoupon({ ...c, id: "" }), /аль хэдийн/);
  assert.equal((await repo.findCoupon("test5"))!.id, c.id);
});

test("customer registration, login, wrong password, duplicate email", async () => {
  const c = await repo.register({ name: "Бат Болд", email: "Bat@Example.mn", phone: "99001122", password: "secret1234" });
  assert.equal(c.email, "bat@example.mn");
  assert.ok(!("passwordHash" in c));
  assert.equal(repo.currentCustomerId(), c.id);
  await repo.logout();
  await assert.rejects(() => repo.login("bat@example.mn", "wrong"), RepositoryError);
  assert.equal((await repo.login("BAT@example.mn", "secret1234")).id, c.id);
  await assert.rejects(() => repo.register({ name: "Өөр", email: "bat@example.mn", phone: "99001122", password: "secret1234" }), /бүртгэл/);
  const demo = await repo.login("demo@niislel.mn", "demo1234");
  assert.equal(demo.name, "Демо Хэрэглэгч");
  assert.ok((await repo.listOrders({ customerId: demo.id })).length >= 1);
});

test("seed data: 30+ products, realistic prices, valid fields", async () => {
  const ps: Product[] = await repo.listProducts({ includeHidden: true });
  assert.ok(ps.length >= 30);
  assert.equal(new Set(ps.map((p) => p.slug)).size, ps.length);
  assert.equal(new Set(ps.map((p) => p.sku)).size, ps.length);
  for (const p of ps) {
    assert.ok(p.price >= 1000 && p.price <= 5_000_000, p.name);
    assert.ok(!p.compareAtPrice || p.compareAtPrice > p.price, p.name);
    assert.ok(p.colors.length >= 1 && p.description.length > 30, p.name);
  }
  assert.ok(ps.some((p) => p.stock === 0) && ps.some((p) => p.compareAtPrice));
  assert.ok((await repo.listCategories()).length >= 5);
});
