import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css|svg)$/.test(f) ? [p] : [];
  });
}
const files = walk("src");
const CYR = /[Ѐ-ӿ]/;

test("no em dash or en dash anywhere in source", () => {
  const bad = files.filter((f) => /[–—]/.test(readFileSync(f, "utf8")));
  assert.deepEqual(bad, []);
});

/** Кирилл бичвэр агуулсан мөр бүрээс үг хоорондын зураас (" - ", "а-б", "-а") хайна. URL, className, slug-ийг хамруулахгүйгээр зөвхөн Кирилл орсон literal-ийг шалгана. */
test("no hyphen or dash between words in Mongolian visible text", () => {
  const offenders: string[] = [];
  const lit = /(["'`])((?:\\.|(?!\1)[^\\\n])*)\1|>([^<>{}\n]*[Ѐ-ӿ][^<>{}\n]*)</g;
  for (const f of files.filter((x) => !x.endsWith(".css"))) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(lit)) {
      const text = m[2] ?? m[3] ?? "";
      if (!CYR.test(text)) continue;
      const t = text.replace(/\$\{[^}]*\}/g, "");
      if (/(^|\s)-(\s|$)/.test(t) || /[Ѐ-ӿA-Za-z0-9]-[Ѐ-ӿA-Za-z]/.test(t) || /[Ѐ-ӿ]-/.test(t) || /-[Ѐ-ӿ]/.test(t)) offenders.push(`${f}: ${t.slice(0, 80)}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("no lookalike letters that break Ө and Ү (Greek theta, Kazakh Ұ, Fita, Ӫ)", () => {
  const bad = files.filter((f) => /[ΘθѲѳҰұӪӫƟɵ]/.test(readFileSync(f, "utf8")));
  assert.deepEqual(bad, []);
});

test("Ө and Ү are used in Mongolian copy and fonts support them", () => {
  const all = files.map((f) => readFileSync(f, "utf8")).join("\n");
  for (const ch of ["Ө", "ө", "Ү", "ү"]) assert.ok(all.includes(ch), `missing ${ch}`);
  for (const w of ["Өвөл", "Өмнөх", "Хүргэлт", "Бүтээгдэхүүн", "Үнэгүй"]) assert.ok(all.includes(w), w);
});

test("html lang is mn and no raw english placeholder copy", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.ok(layout.includes('lang="mn"'));
  const sample = files.filter((f) => f.includes("components") || f.includes("app")).map((f) => readFileSync(f, "utf8")).join("\n");
  for (const w of ["Lorem ipsum", "TODO", "placeholder text"]) assert.ok(!sample.includes(w), w);
});
