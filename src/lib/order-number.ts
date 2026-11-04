/** Захиалгын дугаар: NS + он сар өдөр (yymmdd) + 4 санамсаргүй цифр. Жишээ: NS2611041873 */
export function generateOrderNumber(now = new Date()): string {
  const ymd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `NS${ymd}${rand}`;
}
