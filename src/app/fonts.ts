import localFont from "next/font/local";

/**
 * Inter (SIL OFL). Латин + Кирилл, Ө ө Ү ү ба ₮ тэмдэгтэй эсэхийг шалгасан файлууд.
 * Гадаад домэйноос хамааралгүй, нэг домэйноос ачаална.
 */
export const inter = localFont({
  src: [
    { path: "../fonts/Inter-Regular.woff", weight: "400", style: "normal" },
    { path: "../fonts/Inter-Medium.woff", weight: "500", style: "normal" },
    { path: "../fonts/Inter-SemiBold.woff", weight: "600", style: "normal" },
    { path: "../fonts/Inter-Bold.woff", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const interDisplay = localFont({
  src: [{ path: "../fonts/InterDisplay-SemiBold.woff", weight: "600", style: "normal" }],
  variable: "--font-display",
  display: "swap",
});
