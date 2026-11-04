/**
 * ДЕМО төлбөрийн үзүүлэгчид. Бодит банк, QPay, SocialPay руу хандахгүй.
 * Бүх хариу "simulated: true" гэж тэмдэглэгдэнэ.
 */
import type { PaymentCheck, PaymentIntent, PaymentIntentInput, PaymentProvider } from "./types";

const ref = (prefix: string, order: string) => `${prefix}${order.slice(-6)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export class DemoQPay implements PaymentProvider {
  readonly id = "qpay" as const;
  readonly label = "QPay";
  readonly simulated = true;
  private paid = new Set<string>();
  async createIntent(i: PaymentIntentInput): Promise<PaymentIntent> {
    return {
      provider: "QPay (демо)", method: "qpay", reference: ref("QP", i.orderNumber), simulated: true,
      display: {
        kind: "qr",
        payload: `DEMO-QPAY|${i.orderNumber}|${i.amount}`,
        deeplinks: ["Хаан банк", "Худалдаа хөгжлийн банк", "Голомт банк", "Төрийн банк", "ХасБанк", "М банк"].map((name) => ({ name, url: "#demo" })),
      },
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
    };
  }
  async checkPayment(reference: string): Promise<PaymentCheck> {
    return this.paid.has(reference) ? { status: "paid", paidAt: new Date().toISOString() } : { status: "pending" };
  }
  /** Зөвхөн демо: "Төлбөр төлсөн" товчийг дарсныг дуурайна */
  simulatePay(reference: string) {
    this.paid.add(reference);
  }
}

export class DemoSocialPay implements PaymentProvider {
  readonly id = "socialpay" as const;
  readonly label = "SocialPay";
  readonly simulated = true;
  async createIntent(i: PaymentIntentInput): Promise<PaymentIntent> {
    return {
      provider: "SocialPay (демо)", method: "socialpay", reference: ref("SP", i.orderNumber), simulated: true,
      display: { kind: "app", payload: `DEMO-SOCIALPAY|${i.orderNumber}|${i.amount}`, deeplinks: [{ name: "SocialPay аппаар нээх", url: "#demo" }] },
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
    };
  }
  async checkPayment(): Promise<PaymentCheck> {
    return { status: "pending" };
  }
}

export class BankTransfer implements PaymentProvider {
  readonly id = "bank" as const;
  readonly label = "Дансаар шилжүүлэх";
  readonly simulated = true;
  async createIntent(i: PaymentIntentInput): Promise<PaymentIntent> {
    return {
      provider: "Дансаар шилжүүлэх", method: "bank", reference: i.orderNumber, simulated: true,
      display: {
        kind: "bank",
        bank: { bank: "Жишээ банк (демо)", account: "0000 0000 00", holder: "Нийслэл Стор ХХК (демо)", reference: i.orderNumber },
      },
    };
  }
  async checkPayment(): Promise<PaymentCheck> {
    return { status: "pending" };
  }
}

export class CashOnDelivery implements PaymentProvider {
  readonly id = "cod" as const;
  readonly label = "Бэлнээр төлөх";
  readonly simulated = false;
  async createIntent(i: PaymentIntentInput): Promise<PaymentIntent> {
    return { provider: "Бэлнээр", method: "cod", reference: i.orderNumber, simulated: false, display: { kind: "cod" } };
  }
  async checkPayment(): Promise<PaymentCheck> {
    return { status: "pending" };
  }
}
