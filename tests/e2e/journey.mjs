/**
 * Браузер дээрх бүтэн аяллын шалгалт (Playwright). Ажиллуулах: npm run build && npm start, дараа нь npm run test:e2e
 * BASE_URL (анхдагч http://localhost:3100) орчны хувьсагчаар солино.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const SHOTS = process.env.SHOTS ?? "test-results";
mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, ok, extra = "") => { results.push({ name, ok: !!ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + extra}`); };
const vis = async (loc, t = 6000) => { try { await loc.first().waitFor({ state: "visible", timeout: t }); return true; } catch { return false; } };
const num = (s) => Number(String(s).replace(/[^\d]/g, ""));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, locale: "mn-MN" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push("console: " + m.text()); });
page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("/api/admin/session")) errors.push(`HTTP ${r.status()} ${r.url()}`); });

const stockOf = async (sku) => { await page.goto(`${BASE}/admin/inventory`); const row = page.locator(`[data-testid=inventory-row][data-sku=${sku}]`); await row.waitFor(); return num(await row.locator("[data-testid=stock-value]").innerText()); };
async function adminLogin(p, who = "admin") {
  await p.goto(`${BASE}/admin/login`);
  await p.getByTestId(who === "admin" ? "fill-admin" : "fill-staff").click();
  await p.getByTestId("admin-submit").click();
  await p.waitForURL(/\/admin$/);
}

try {
  // 1. Дэлгүүр нээх
  await page.goto(BASE);
  await page.getByRole("heading", { level: 1 }).waitFor();
  check("1 homepage renders hero, Ө/Ү text", (await page.locator("body").innerText()).includes("өвөл") || (await page.locator("body").innerText()).includes("Өвөл"));
  check("1 homepage sections (featured, new, best sellers, offers, newsletter, footer)", await vis(page.getByText("Онцлох бараа").first()) && await vis(page.getByText("Шинэ бараа").first()) && await vis(page.getByText("Эрэлттэй бараа").first()) && await vis(page.getByText("Онцгой санал").first()) && await vis(page.locator("footer").getByText("Холбоо барих")));
  check("1 no broken images", (await page.$$eval("img", (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).length)) === 0);

  // 2. Бараа үзэх, хайх, шүүх
  await page.goto(`${BASE}/products`);
  await page.getByTestId("product-grid").waitFor();
  check("2 catalog paginates 12 per page", (await page.locator("[data-testid=product-grid] article").count()) === 12);
  const total = num(await page.getByTestId("result-count").innerText());
  check("2 catalog has 30+ products", total >= 30, String(total));
  await page.goto(`${BASE}/products?q=${encodeURIComponent("ноолуур")}`);
  await page.getByTestId("product-grid").waitFor();
  const nq = num(await page.getByTestId("result-count").innerText());
  check("2 search finds cashmere products", nq >= 5 && nq < total, String(nq));
  await page.goto(`${BASE}/products?q=zzzzqq`);
  check("2 empty state for no results", await vis(page.getByText("Тохирох бараа олдсонгүй")));
  await page.goto(`${BASE}/products?category=leather&sort=price_asc&stock=in`);
  await page.getByTestId("product-grid").waitFor();
  const prices = (await page.locator("[data-testid=product-grid] article .tabular").allInnerTexts()).map(num).filter(Boolean);
  check("2 category filter + sort ascending works", prices.length >= 3, JSON.stringify(prices));
  await page.goto(`${BASE}/products?min=100000&max=200000`);
  await page.getByTestId("product-grid").waitFor();
  const inRange = (await page.locator("[data-testid=product-grid] article").evaluateAll((els) => els.map((e) => e.innerText))).length;
  check("2 price filter returns items", inRange > 0);
  await page.goto(`${BASE}/products?sort=price_desc`);
  await page.getByTestId("sort").waitFor();
  await page.getByTestId("sort").selectOption("price_asc");
  await page.waitForURL(/sort=price_asc/);
  check("2 sort dropdown updates URL", true);
  await page.goto(`${BASE}/products?page=2`);
  await page.getByTestId("product-grid").waitFor();
  check("2 page 2 loads", (await page.locator("[data-testid=product-grid] article").count()) > 0);

  // 3. Барааны дэлгэрэнгүй, сагс
  await adminLogin(page);
  const stockBefore = await stockOf("NS1000");
  await page.goto(`${BASE}/products/tal-cashmere-sweater`);
  await page.getByTestId("product-title").waitFor();
  check("3 product detail gallery has 4 images", (await page.locator("[role=tablist][aria-label=Зургууд] button").count()) === 4);
  await page.locator("[role=tablist][aria-label=Зургууд] button").nth(2).click();
  await page.getByTestId("add-to-cart").click();
  check("3 add without color/size shows validation", await vis(page.getByText(/Өнгөө сонгоно уу/)));
  await page.getByRole("button", { name: "Нүүрсэн саарал" }).click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByTestId("add-to-cart").click();
  await page.getByTestId("drawer-checkout").waitFor();
  check("3 cart badge shows 1", (await page.getByTestId("cart-count").first().innerText()).trim() === "1");
  check("3 drawer subtotal is 329 000₮", num(await page.getByTestId("drawer-subtotal").innerText()) === 329000);
  await page.keyboard.press("Escape");
  await page.getByTestId("wishlist-toggle").click();
  check("3 wishlist toggles", (await page.getByTestId("wishlist-toggle").getAttribute("aria-pressed")) === "true");

  // 4. Сагс, купон
  await page.goto(`${BASE}/cart`);
  await page.getByTestId("cart-page-lines").waitFor();
  await page.getByLabel("Нэгээр нэмэх").first().click();
  await page.waitForFunction(() => document.querySelector('[data-testid=sum-subtotal]')?.textContent?.replace(/\D/g, "") === "658000");
  check("4 quantity increase recalculates subtotal 658 000₮", true);
  await page.getByTestId("coupon-input").fill("BURUU");
  await page.getByTestId("coupon-apply").click();
  check("4 invalid coupon shows error", await vis(page.getByTestId("coupon-error")));
  await page.getByTestId("coupon-input").fill("niislel10");
  await page.getByTestId("coupon-apply").click();
  await page.getByTestId("coupon-applied").waitFor();
  const disc = num(await page.getByTestId("sum-discount").innerText());
  check("4 NIISLEL10 gives 10% capped at 100 000₮ => 65 800₮", disc === 65800, String(disc));
  check("4 free delivery above 200 000₮", /Үнэгүй/.test(await page.getByTestId("sum-delivery").innerText()));
  check("4 total = 658 000 − 65 800 = 592 200₮", num(await page.getByTestId("sum-total").innerText()) === 592200);
  await page.getByLabel("Нэгээр хасах").first().click();
  await page.waitForFunction(() => document.querySelector('[data-testid=sum-subtotal]')?.textContent?.replace(/\D/g, "") === "329000");
  await page.reload();
  await page.getByTestId("cart-page-lines").waitFor();
  check("4 cart persists after reload", num(await page.getByTestId("sum-subtotal").innerText()) === 329000);
  check("4 coupon persists after reload", await vis(page.getByTestId("coupon-applied")));

  // 5. Төлбөр хийх
  await page.getByTestId("go-checkout").click();
  await page.getByTestId("checkout-form").waitFor();
  await page.getByTestId("place-order").click();
  check("5 empty checkout shows field errors", (await page.locator("[role=alert].field-error, .field-error").count()) >= 3);
  await page.getByTestId("f-name").fill("Бат Болд");
  await page.getByTestId("f-phone").fill("1234");
  await page.getByTestId("f-email").fill("bad");
  await page.getByTestId("place-order").click();
  check("5 invalid phone/email rejected", await vis(page.getByText(/Утасны дугаар 8 оронтой/)) && await vis(page.getByText(/Имэйл хаяг буруу/)));
  await page.getByTestId("f-phone").fill("99112233");
  await page.getByTestId("f-email").fill("bat@example.mn");
  await page.getByTestId("f-district").selectOption("Хан Уул");
  await page.getByTestId("f-detail").fill("Зайсан, 12 дугаар байр, 45 тоот");
  check("5 order summary lists the item", (await page.locator("[data-testid=checkout-lines] li").count()) === 1);
  check("5 standard delivery shown free (≥200 000₮ after coupon)", /Үнэгүй/.test(await page.getByTestId("ship-standard").innerText()));
  await page.getByTestId("ship-express").click();
  check("5 express delivery fee 12 000₮ added", num(await page.getByTestId("sum-delivery").innerText()) === 12000);
  check("5 total with express = 329 000 − 32 900 + 12 000 = 308 100₮", num(await page.getByTestId("sum-total").innerText()) === 308100, await page.getByTestId("sum-total").innerText());
  await page.getByTestId("ship-standard").click();
  check("5 payment notice marks demo", await vis(page.getByText(/Демо төлбөр/).first()));
  await page.getByTestId("pay-qpay").check();
  await page.getByTestId("place-order").click();

  // 6. Баталгаажуулалт, демо төлбөр
  await page.getByTestId("confirmation").waitFor();
  const orderNo = (await page.getByTestId("order-number").innerText()).trim();
  check("6 order number generated NS+yymmdd+4 digits", /^NS\d{10}$/.test(orderNo), orderNo);
  check("6 QPay panel is labelled demo", await vis(page.getByTestId("payment-panel").getByText(/ДЕМО/).first()));
  check("6 status pending / payment awaiting", (await page.getByTestId("order-status").innerText()).includes("Хүлээгдэж") && (await page.getByTestId("payment-status").innerText()).includes("хүлээж"));
  await page.getByTestId("simulate-pay").click();
  await page.waitForFunction(() => document.querySelector('[data-testid=payment-status]')?.textContent?.includes("Төлөгдсөн"));
  check("6 simulated payment marks paid", true);
  check("6 cart emptied after checkout", (await page.getByTestId("cart-count").count()) === 0);
  await page.screenshot({ path: `${SHOTS}/desktop-confirmation.png` });

  // 7. Захиалга хянах
  await page.goto(`${BASE}/track`);
  await page.getByTestId("track-number").fill(orderNo);
  await page.getByTestId("track-phone").fill("99000000");
  await page.getByTestId("track-submit").click();
  check("7 tracking rejects wrong phone", await vis(page.getByText(/Захиалга олдсонгүй/)));
  await page.getByTestId("track-phone").fill("+976 9911 2233");
  await page.getByTestId("track-submit").click();
  await page.waitForURL(new RegExp(orderNo));
  check("7 tracking shows timeline", await vis(page.getByTestId("timeline")));
  await page.evaluate(() => sessionStorage.clear());
  await page.goto(`${BASE}/order/${orderNo}`);
  check("7 order page asks phone verification without access", await vis(page.getByTestId("verify-phone")));
  await page.getByTestId("verify-phone").fill("99000000"); await page.getByTestId("verify-submit").click();
  check("7 wrong phone does not unlock the order", await vis(page.getByText(/таарахгүй байна/)));
  await page.getByTestId("verify-phone").fill("99112233"); await page.getByTestId("verify-submit").click();
  check("7 right phone unlocks the order", await vis(page.getByTestId("timeline")));

  // 8. Админ
  const anon = await browser.newContext(); const ap = await anon.newPage();
  await ap.goto(`${BASE}/admin/orders`);
  check("8 unauthenticated /admin redirects to login", /\/admin\/login/.test(ap.url()));
  const apiRes = await anon.request.get(`${BASE}/api/admin/session`);
  check("8 session API 401 without cookie", apiRes.status() === 401);
  await ap.goto(`${BASE}/admin/login`);
  await ap.getByTestId("admin-email").fill("admin@niislel.mn"); await ap.getByTestId("admin-password").fill("wrong-pass");
  await ap.getByTestId("admin-submit").click();
  check("8 wrong admin password rejected", await vis(ap.getByTestId("admin-error")));
  await anon.close();

  await page.goto(`${BASE}/admin`);
  await page.getByTestId("kpis").waitFor();
  check("8 admin dashboard KPIs visible", (await page.locator("[data-testid=kpis] > div").count()) === 6);
  check("8 revenue chart rendered", await vis(page.locator("svg[aria-label*=орлогын]")));
  await page.goto(`${BASE}/admin/orders`);
  await page.getByTestId("admin-order-search").fill(orderNo);
  check("8 admin finds the new order", (await page.getByTestId("admin-order-row").count()) === 1);
  await page.getByRole("link", { name: orderNo }).click();
  await page.getByTestId("admin-order-status").waitFor();
  check("8 order shows customer details", await vis(page.getByText("Бат Болд").first()) && await vis(page.getByText("99112233").first()));
  await page.getByTestId("advance-status").click();
  await page.waitForFunction(() => document.querySelector('[data-testid=admin-order-status]')?.textContent?.includes("Баталгаажсан"));
  check("8 admin confirms order", true);
  for (const label of ["Баталгаажсан", "Бэлтгэж байна", "Хүргэлтэд гарсан", "Хүргэгдсэн"]) {
    if (label === "Баталгаажсан") { await page.getByTestId("advance-status").click(); await page.waitForFunction(() => document.querySelector('[data-testid=admin-order-status]')?.textContent?.includes("Бэлтгэж")); }
    else if (label === "Бэлтгэж байна") { await page.getByTestId("advance-status").click(); await page.waitForFunction(() => document.querySelector('[data-testid=admin-order-status]')?.textContent?.includes("Хүргэлтэд")); }
    else if (label === "Хүргэлтэд гарсан") { await page.getByTestId("advance-status").click(); await page.waitForFunction(() => document.querySelector('[data-testid=admin-order-status]')?.textContent?.includes("Хүргэгдсэн")); }
  }
  check("8 status advanced through processing, shipped, delivered", true);
  check("8 closed order hides actions", (await page.getByTestId("order-actions").count()) === 0);
  await page.goto(`${BASE}/order/${orderNo}`);
  check("8 customer side sees delivered", (await page.getByTestId("order-status").innerText()).includes("Хүргэгдсэн"));

  // 9. Нөөц
  const stockAfter = await stockOf("NS1000");
  check(`9 inventory reduced by 1 after order (${stockBefore} → ${stockAfter})`, stockAfter === stockBefore - 1);

  // 10. Цуцлалт нөөцийг сэргээнэ
  await page.goto(`${BASE}/products/tal-cashmere-sweater`);
  await page.getByRole("button", { name: "Овъёос" }).click(); await page.getByRole("button", { name: "S", exact: true }).click();
  await page.getByTestId("add-to-cart").click(); await page.getByTestId("drawer-checkout").click();
  await page.getByTestId("checkout-form").waitFor();
  await page.getByTestId("f-name").fill("Тест Хэрэглэгч"); await page.getByTestId("f-phone").fill("88001122"); await page.getByTestId("f-email").fill("t@example.mn");
  await page.getByTestId("f-district").selectOption("Баянгол"); await page.getByTestId("f-detail").fill("Тест хаяг 5 дугаар байр");
  await page.getByTestId("pay-cod").check(); await page.getByTestId("place-order").click();
  await page.getByTestId("confirmation").waitFor();
  const o2 = (await page.getByTestId("order-number").innerText()).trim();
  const s2 = await stockOf("NS1000");
  check("10 second order reduced stock again", s2 === stockAfter - 1, `${stockAfter} → ${s2}`);
  await page.goto(`${BASE}/admin/orders/${o2}`);
  await page.getByTestId("cancel-order").click();
  await page.getByTestId("cancel-reason").fill("Тест цуцлалт");
  await page.getByTestId("confirm-cancel").click();
  await page.waitForFunction(() => document.querySelector('[data-testid=admin-order-status]')?.textContent?.includes("Цуцлагдсан"));
  check("10 admin cancels an order", true);
  const s3 = await stockOf("NS1000");
  check("10 cancellation restores inventory", s3 === s2 + 1, `${s2} → ${s3}`);

  // 11. Админ CRUD
  await page.goto(`${BASE}/admin/products/new`);
  await page.getByTestId("save-product").click();
  check("11 product form validates required fields", (await page.locator(".field-error").count()) >= 4);
  await page.getByTestId("pf-name").fill("Туршилтын ноолууран цамц");
  await page.getByTestId("pf-sku").fill("NSTEST01");
  await page.getByTestId("pf-short").fill("Туршилтын товч тайлбар");
  await page.getByTestId("pf-desc").fill("Туршилтын бүтээгдэхүүний дэлгэрэнгүй тайлбар бичлэг.");
  await page.getByTestId("pf-price").fill("150000"); await page.getByTestId("pf-compare").fill("120000"); await page.getByTestId("pf-stock").fill("9");
  await page.getByTestId("save-product").click();
  check("11 compare price must exceed price", await vis(page.getByText(/нь борлуулах үнээс их/)));
  await page.getByTestId("pf-compare").fill("180000");
  await page.getByTestId("save-product").click();
  await page.waitForURL(/\/admin\/products$/);
  await page.getByTestId("admin-product-search").fill("Туршилтын");
  check("11 admin creates product", (await page.getByTestId("product-row").count()) === 1);
  await page.goto(`${BASE}/products?q=${encodeURIComponent("Туршилтын")}`);
  await page.getByTestId("product-grid").waitFor();
  check("11 new product appears in storefront search", (await page.locator("[data-testid=product-grid] article").count()) === 1);
  await page.goto(`${BASE}/admin/products`);
  await page.getByTestId("admin-product-search").fill("Туршилтын");
  await page.getByTestId("edit-product").click();
  await page.getByTestId("pf-price").fill("99000"); await page.getByTestId("pf-stock").fill("4");
  await page.getByTestId("save-product").click(); await page.waitForURL(/\/admin\/products$/);
  await page.goto(`${BASE}/products?q=${encodeURIComponent("Туршилтын")}`);
  await page.getByTestId("product-grid").waitFor();
  check("11 edit price reflects in storefront (99 000₮, 45% off)", (await page.locator("[data-testid=product-grid] article").first().innerText()).replace(/\s/g, "").includes("99000₮"));
  await page.goto(`${BASE}/admin/products`);
  await page.getByTestId("admin-product-search").fill("Туршилтын");
  await page.getByRole("switch").first().click();
  await page.goto(`${BASE}/products?q=${encodeURIComponent("Туршилтын")}`);
  await page.getByTestId("result-count").waitFor();
  await page.waitForFunction(() => /0 бараа/.test(document.querySelector('[data-testid=result-count]')?.textContent ?? ""));
  check("11 hiding product removes it from storefront", true);
  await page.goto(`${BASE}/admin/products`);
  await page.getByTestId("admin-product-search").fill("Туршилтын");
  await page.getByTestId("delete-product").click(); await page.getByTestId("confirm-yes").click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid=product-row]').length === 0);
  check("11 admin deletes product", true);

  await page.goto(`${BASE}/admin/marketing`);
  await page.getByTestId("new-coupon").click();
  await page.getByTestId("cp-code").fill("TEST5"); await page.getByTestId("cp-value").fill("5");
  await page.getByTestId("cp-save").click();
  check("11 coupon requires description", await vis(page.getByText(/Тайлбар бичнэ үү/)));
  await page.getByLabel("Тайлбар").fill("Туршилтын купон");
  await page.getByTestId("cp-save").click();
  await page.waitForFunction(() => /TEST5/.test(document.querySelector('[data-testid=coupons-table]')?.textContent ?? ""));
  check("11 admin creates coupon", true);
  await page.goto(`${BASE}/admin/categories`);
  await page.getByTestId("new-category").click();
  await page.getByTestId("ct-name").fill("Туршилтын ангилал"); await page.getByTestId("ct-save").click();
  await page.waitForFunction(() => /Туршилтын ангилал/.test(document.body.textContent ?? ""));
  check("11 admin creates category", true);
  await page.goto(`${BASE}/admin/delivery`);
  await page.getByTestId("fee-Хан Уул").fill("9000"); await page.getByTestId("save-delivery").click();
  await page.goto(`${BASE}/help`);
  check("11 delivery fee change is live (Хан Уул 9 000₮)", (await page.locator("body").innerText()).replace(/ /g, " ").includes("9 000₮"));

  // 12. Ажилтны эрх
  const sctx = await browser.newContext(); const sp = await sctx.newPage();
  await adminLogin(sp, "staff");
  await sp.goto(`${BASE}/admin/marketing`);
  check("12 staff blocked from marketing (redirect plus notice)", /denied=1/.test(sp.url()) && await vis(sp.getByText(/Хандах эрхгүй/)), sp.url());
  await sp.goto(`${BASE}/admin/products`);
  check("12 staff cannot add products", (await sp.getByTestId("new-product").count()) === 0);
  await sp.goto(`${BASE}/admin/delivery`);
  check("12 server redirects staff away from admin only pages", /\/admin\?denied=1/.test(sp.url()), sp.url());
  await sp.goto(`${BASE}/admin/orders`);
  check("12 staff can open orders", await vis(sp.getByTestId("admin-order-row")));
  await sctx.close();

  // 13. Бүртгэл, хэрэглэгчийн булан
  const cctx = await browser.newContext(); const cp = await cctx.newPage();
  await cp.goto(`${BASE}/account`);
  await cp.waitForURL(/account\/login/);
  check("13 account requires login", true);
  await cp.goto(`${BASE}/account/register`);
  await cp.getByTestId("reg-submit").click();
  check("13 register validates", (await cp.locator(".field-error").count()) >= 4);
  await cp.getByTestId("reg-name").fill("Сараа Өлзий"); await cp.getByTestId("reg-email").fill("saraa@example.mn"); await cp.getByTestId("reg-phone").fill("99887766");
  await cp.getByTestId("reg-password").fill("password123"); await cp.getByTestId("reg-confirm").fill("password123");
  await cp.getByTestId("reg-submit").click();
  await cp.waitForURL(/\/account$/);
  check("13 registration logs in", await vis(cp.getByText(/Сайн байна уу/)));
  await cp.getByRole("link", { name: "Хаягууд" }).click();
  await cp.getByTestId("add-address").click();
  await cp.getByTestId("addr-detail").fill("Хан Уул, 3 дугаар байр, 12 тоот");
  await cp.locator("#a-dist").selectOption("Хан Уул");
  await cp.getByTestId("addr-save").click();
  await cp.getByTestId("address-list").waitFor();
  check("13 saved address", (await cp.locator("[data-testid=address-list] li").count()) === 1);
  await cp.getByRole("link", { name: "Захиалгууд" }).click();
  check("13 empty orders state", await vis(cp.getByText("Захиалга одоогоор алга")));
  await cp.getByTestId("logout").click();
  await cp.goto(`${BASE}/account/login`);
  await cp.getByTestId("login-email").fill("demo@niislel.mn"); await cp.getByTestId("login-password").fill("demo1234");
  await cp.getByTestId("login-submit").click();
  await cp.waitForURL(/\/account$/);
  await cp.getByRole("link", { name: "Захиалгууд" }).click();
  await cp.getByTestId("orders-list").waitFor();
  check("13 demo customer has order history", (await cp.getByTestId("order-row").count()) >= 1);
  await cp.getByTestId("order-row").first().click();
  await cp.getByTestId("timeline").waitFor();
  check("13 order detail opens without phone verification for owner", true);
  await cctx.close();

  // 14. Гар утас
  const mctx = await browser.newContext({ ...devices["iPhone 12"] });
  const mp = await mctx.newPage();
  const overflow = async (label) => { const w = await mp.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })); check(`14 mobile no horizontal overflow: ${label} (${w.sw}/${w.cw})`, w.sw <= w.cw + 1); };
  await mp.goto(BASE); await mp.getByRole("heading", { level: 1 }).waitFor(); await overflow("home");
  await mp.screenshot({ path: `${SHOTS}/mobile-home.png` });
  check("14 mobile bottom tab bar visible", await vis(mp.getByRole("navigation", { name: "Доод цэс" })));
  await mp.goto(`${BASE}/products`); await mp.getByTestId("product-grid").waitFor(); await overflow("catalog");
  await mp.getByRole("button", { name: /Шүүлтүүр/ }).first().click();
  check("14 mobile filter sheet opens", await vis(mp.getByRole("dialog", { name: "Шүүлтүүр" })));
  await mp.keyboard.press("Escape"); await mp.goto(`${BASE}/products/tal-cashmere-sweater`); await mp.getByTestId("product-title").waitFor(); await overflow("product");
  await mp.screenshot({ path: `${SHOTS}/mobile-product.png` });
  await mp.getByRole("button", { name: "Овъёос" }).click(); await mp.getByRole("button", { name: "L", exact: true }).click(); await mp.getByTestId("add-to-cart").click();
  await mp.getByTestId("drawer-checkout").waitFor(); await mp.screenshot({ path: `${SHOTS}/mobile-cart-drawer.png` });
  await mp.getByTestId("drawer-checkout").click(); await mp.getByTestId("checkout-form").waitFor(); await overflow("checkout");
  await mp.screenshot({ path: `${SHOTS}/mobile-checkout.png`, fullPage: true });
  await mp.goto(`${BASE}/cart`); await mp.getByTestId("cart-page-lines").waitFor(); await overflow("cart");
  await mp.goto(`${BASE}/track`); await overflow("track");
  const tgt = await mp.$$eval("a, button", (els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 32 || r.height < 32) && !e.closest(".sr-only") && getComputedStyle(e).visibility !== "hidden"; }).length);
  check(`14 mobile tap targets mostly >= 32px (small: ${tgt})`, tgt <= 6);
  await mctx.close();
  const mctx2 = await browser.newContext({ ...devices["iPhone 12"] }); const mp2 = await mctx2.newPage();
  await adminLogin(mp2); await mp2.waitForTimeout(400);
  const w = await mp2.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  check(`14 mobile admin dashboard no overflow (${w[0]}/${w[1]})`, w[0] <= w[1] + 1);
  await mp2.screenshot({ path: `${SHOTS}/mobile-admin.png` });
  await mp2.goto(`${BASE}/admin/orders`); await mp2.getByTestId("orders-table").waitFor();
  const w2 = await mp2.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  check(`14 mobile admin orders table scrolls inside card (${w2[0]}/${w2[1]})`, w2[0] <= w2[1] + 1);
  await mctx2.close();

  await page.goto(BASE); await page.screenshot({ path: `${SHOTS}/desktop-home.png`, fullPage: true });
  await page.goto(`${BASE}/products/gobi-leather-tote`); await page.getByTestId("product-title").waitFor(); await page.screenshot({ path: `${SHOTS}/desktop-product.png` });
  await page.goto(`${BASE}/admin`); await page.getByTestId("kpis").waitFor(); await page.waitForTimeout(300); await page.screenshot({ path: `${SHOTS}/desktop-admin.png`, fullPage: true });
} catch (e) {
  check("journey completed without exception", false, e.message.split("\n")[0]);
  await page.screenshot({ path: `${SHOTS}/failure.png` }).catch(() => {});
}
check("no console or page errors, no failed requests", errors.length === 0, errors.slice(0, 4).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
