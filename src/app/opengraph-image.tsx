import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Нийслэл Стор";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const font = await readFile(join(process.cwd(), "src/fonts/Inter-SemiBold.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#13203a", color: "#faf7f2", padding: 72, fontFamily: "Inter" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "#faf7f2", color: "#13203a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 600 }}>Н</div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>Нийслэл Стор</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, fontWeight: 600, maxWidth: 940 }}>Монгол чанар, нийслэлийн хэв маяг</div>
          <div style={{ fontSize: 32, color: "#b8924a" }}>Ноолуур · Арьс шир · Гэр ахуй · Гоо сайхан</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Inter", data: font, weight: 600, style: "normal" }] },
  );
}
