import { Coupon } from "./coupon.models";
import { Customer } from "./customer.models";
import { PromotionCode } from "./promotion-code.models";

export interface Discount {
  id: string;
  object: string;
  checkout_session: string | null;
  coupon: Coupon;
  customer: Customer | string | null;
  end: number | null;
  invoice: string | null;
  invoice_item: string | null;
  promotion_code: PromotionCode | null;
  start: number | null;
  subscription: string | null;
  subscription_item?: string | null;
}
