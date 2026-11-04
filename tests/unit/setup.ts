/** LocalRepository-г Node дээр туршихад хөтчийн орчныг (localStorage) дуурайна. */
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
export function installBrowser() {
  const ls = new MemStorage();
  (globalThis as Record<string, unknown>).window = { localStorage: ls, addEventListener() {} };
  (globalThis as Record<string, unknown>).localStorage = ls;
  return ls;
}
