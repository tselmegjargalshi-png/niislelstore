import type { Metadata } from "next";
import { HelpBody } from "@/components/help-body";

export const metadata: Metadata = { title: "Тусламж: хүргэлт, төлбөр", description: "Хүргэлтийн үнэ, хугацаа, төлбөрийн хэлбэр, буцаалтын нөхцөл." };


export default function Page() {
  return <HelpBody />;
}
