import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/checkout";

export const metadata: Metadata = { title: "Захиалга баталгаажуулах", robots: { index: false } };
export default function Page() {
  return <Checkout />;
}
