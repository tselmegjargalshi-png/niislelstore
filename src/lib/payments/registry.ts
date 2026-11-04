/**
 * Төлбөрийн үзүүлэгчдийн бүртгэл. Бодит интеграц холбохдоо ЗӨВХӨН энд солино:
 *
 *   import { QPayLive } from "./qpay-live"; // server талд, QPAY_CLIENT_ID ... ашиглана
 *   const providers = { qpay: new QPayLive(), ... }
 *
 * Бодит QPay: POST /v2/auth/token → POST /v2/invoice → callback /api/payments/qpay/callback → POST /v2/payment/check.
 * Эдгээр дуудлагууд заавал server талд (Route Handler) хийгдэх ёстой, нууц түлхүүр хөтчид гарч болохгүй.
 */
import type { PaymentMethod } from "../types";
import { BankTransfer, CashOnDelivery, DemoQPay, DemoSocialPay } from "./demo";
import type { PaymentProvider, ProviderMeta } from "./types";

export const providers: Record<PaymentMethod, PaymentProvider> = {
  qpay: new DemoQPay(),
  socialpay: new DemoSocialPay(),
  bank: new BankTransfer(),
  cod: new CashOnDelivery(),
};

export const paymentMeta: ProviderMeta[] = [
  { id: "qpay", label: "QPay", description: "Банкны аппликейшнээрээ QR уншуулж төлнө.", badge: "Демо", flow: "online" },
  { id: "socialpay", label: "SocialPay", description: "Голомт банкны SocialPay аппликейшнээр төлнө.", badge: "Демо", flow: "online" },
  { id: "bank", label: "Дансаар шилжүүлэх", description: "Данс руу шилжүүлж, гүйлгээний утгад захиалгын дугаараа бичнэ.", flow: "offline" },
  { id: "cod", label: "Бэлнээр төлөх", description: "Хүлээн авахдаа хүргэлтийн ажилтанд бэлнээр төлнө.", flow: "offline" },
];

export function getProvider(id: PaymentMethod) {
  return providers[id];
}

/** Бодит credential тохируулсан эсэх (серверт л үнэн болно). Одоогоор бүх интеграц демо. */
export const LIVE_PAYMENTS_CONFIGURED = false;
