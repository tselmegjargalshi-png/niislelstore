import test from "node:test";
import assert from "node:assert/strict";
import { computePricing, discountPercent, evaluateCoupon, lineSubtotal, mnt, quoteDelivery, quoteOrder } from "../../src/lib/pricing";
import { buildCoupons, defaultDelivery } from "../../src/lib/data/seed";

const coupons = buildCoupons();
const c = (code: string) => coupons.find((x) => x.code === code)!;
const at = (h: number) => new Date(2026, 10, 4, h, 0, 0);

test("mnt formats with narrow no break space and ₮", () => {
  assert.equal(mnt(1234567), "1 234 567₮");
  assert.equal(mnt(0), "0₮");
  assert.equal(mnt(-5000), "−5 000₮");
});

test("subtotal and discount percent", () => {
  assert.equal(lineSubtotal([{ unitPrice: 329000, quantity: 2 }, { unitPrice: 39000, quantity: 3 }]), 775000);
  assert.equal(discountPercent(329000, 389000), 15);
  assert.equal(discountPercent(100, undefined), 0);
});

test("percent coupon is capped by maxDiscount", () => {
  const r = evaluateCoupon(c("NIISLEL10"), 2_000_000);
  assert.ok(r.ok && r.discount === 100000);
  const r2 = evaluateCoupon(c("NIISLEL10"), 100000);
  assert.ok(r2.ok && r2.discount === 10000);
});

test("fixed coupon, min subtotal, inactive, expired, exhausted, unknown", () => {
  assert.ok(evaluateCoupon(c("SHINE20000"), 150000).ok);
  const low = evaluateCoupon(c("SHINE20000"), 149999);
  assert.ok(!low.ok && /ба түүнээс дээш/.test(low.error));
  assert.ok(!evaluateCoupon(c("ZUN15"), 500000).ok);
  assert.ok(!evaluateCoupon({ ...c("NIISLEL10"), expiresAt: new Date(Date.now() - 1000).toISOString() }, 500000).ok);
  assert.ok(!evaluateCoupon({ ...c("NIISLEL10"), usageLimit: 5, usedCount: 5 }, 500000).ok);
  assert.ok(!evaluateCoupon(null, 500000).ok);
  const fixedBig = evaluateCoupon({ ...c("SHINE20000"), minSubtotal: 0, value: 999999 }, 50000);
  assert.ok(fixedBig.ok && fixedBig.discount === 50000, "fixed discount never exceeds subtotal");
});

test("delivery fees per district, free threshold, express rules", () => {
  const q = (o: Partial<Parameters<typeof quoteDelivery>[1]>) => quoteDelivery(defaultDelivery, { method: "standard", city: "Улаанбаатар", district: "Хан Уул", subtotalAfterDiscount: 100000, now: at(10), ...o });
  assert.equal(q({}).fee, 6000);
  assert.equal(q({ district: "Сүхбаатар" }).fee, 5000);
  assert.equal(q({ district: "Багануур" }).fee, 20000);
  assert.equal(q({ subtotalAfterDiscount: 200000 }).fee, 0, "free at threshold");
  assert.equal(q({ subtotalAfterDiscount: 199999 }).fee, 6000);
  assert.equal(q({ method: "express" }).fee, 12000);
  assert.equal(q({ method: "express" }).estimate, "Өнөөдөр 3 цагийн дотор");
  assert.equal(q({ method: "express", now: at(17) }).estimate, "Маргааш 12:00 цагаас өмнө");
  assert.equal(q({ method: "express", district: "Налайх" }).available, false);
  assert.equal(q({ method: "pickup" }).fee, 0);
  assert.equal(q({ district: "" }).available, false);
  assert.equal(q({ city: "Дархан Уул", district: "" }).fee, 15000);
  assert.equal(q({ city: "Дархан Уул", method: "express" }).available, false);
  assert.equal(q({ freeShipping: true, method: "express" }).fee, 0);
});

test("full order math: subtotal - coupon + delivery", () => {
  const lines = [{ unitPrice: 329000, compareAtPrice: 389000, quantity: 1 }, { unitPrice: 49000, quantity: 2 }];
  const r = quoteOrder({ lines, coupon: c("NIISLEL10"), settings: defaultDelivery, method: "standard", city: "Улаанбаатар", district: "Баянзүрх", now: at(11) });
  // subtotal 427000, coupon 10% = 42700, after = 384300 >= 200000 so delivery free
  assert.equal(r.pricing.subtotal, 427000);
  assert.equal(r.pricing.couponDiscount, 42700);
  assert.equal(r.pricing.deliveryFee, 0);
  assert.equal(r.pricing.total, 384300);
  assert.equal(r.pricing.itemSavings, 60000);
  const small = quoteOrder({ lines: [{ unitPrice: 19000, quantity: 1 }], coupon: null, settings: defaultDelivery, method: "standard", city: "Улаанбаатар", district: "Баянзүрх", now: at(11) });
  assert.equal(small.pricing.total, 25000);
  const fs = quoteOrder({ lines: [{ unitPrice: 35000, quantity: 1 }], coupon: c("HURGELT0"), settings: defaultDelivery, method: "standard", city: "Улаанбаатар", district: "Баянзүрх", now: at(11) });
  assert.equal(fs.pricing.total, 35000);
  const tooSmall = quoteOrder({ lines: [{ unitPrice: 19000, quantity: 1 }], coupon: c("HURGELT0"), settings: defaultDelivery, method: "standard", city: "Улаанбаатар", district: "Баянзүрх", now: at(11) });
  assert.ok(tooSmall.coupon && !tooSmall.coupon.ok && tooSmall.pricing.total === 25000, "coupon below minimum is ignored");
});

test("computePricing clamps discount and negative fees", () => {
  const p = computePricing([{ unitPrice: 1000, quantity: 1 }], 5000, -10);
  assert.deepEqual([p.couponDiscount, p.deliveryFee, p.total], [1000, 0, 0]);
});
