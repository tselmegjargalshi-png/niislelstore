import type { Metadata } from "next";
import { TrackForm } from "@/components/order/track-form";

export const metadata: Metadata = { title: "Захиалга хянах", description: "Захиалгын дугаар болон утасны дугаараар захиалгын явцыг хянана." };
export default function Page() {
  return <TrackForm />;
}
