/**
 * Төлбөрийн үйлчилгээ үзүүлэгчийн гэрээ.
 * Демо хэрэгжүүлэлтүүд (demo.ts) НЭГ ч бодит гүйлгээ хийдэггүй. Бодит QPay, SocialPay
 * холбохдоо энэ interface-ийг хэрэгжүүлсэн шинэ класс бичиж, registry.ts дээр сольж өгнө.
 * Бодит credential-ийг зөвхөн server талын орчны хувьсагчаас (.env) уншина.
 */
import type { PaymentMethod } from "../types";

export interface PaymentIntentInput {
  orderNumber: string;
  amount: number; // ₮
  description: string;
  customerPhone?: string;
}

export interface PaymentIntent {
  provider: string;
  method: PaymentMethod;
  reference: string;
  /** Төлбөрийн интерфейст харуулах мэдээлэл */
  display: {
    kind: "qr" | "app" | "bank" | "cod";
    /** QR/холбоосны утга (демо дээр зөвхөн дүрслэл) */
    payload?: string;
    deeplinks?: { name: string; url: string }[];
    bank?: { bank: string; account: string; holder: string; reference: string };
  };
  simulated: boolean;
  expiresAt?: string;
}

export type PaymentCheck = { status: "pending" | "paid" | "failed"; paidAt?: string };

export interface PaymentProvider {
  readonly id: PaymentMethod;
  readonly label: string;
  /** true бол энэ ажиллагаа бодит гүйлгээ БИШ */
  readonly simulated: boolean;
  /** Төлбөр эхлүүлэх (QPay: invoice үүсгэх; SocialPay: invoice илгээх) */
  createIntent(input: PaymentIntentInput): Promise<PaymentIntent>;
  /** Төлбөр төлөгдсөн эсэхийг шалгах (бодитоор бол callback эсвэл payment/check) */
  checkPayment(reference: string): Promise<PaymentCheck>;
}

export interface ProviderMeta {
  id: PaymentMethod;
  label: string;
  description: string;
  badge?: string;
  /** Төлбөр checkout дээр эсвэл захиалгын дараа */
  flow: "online" | "offline";
}
