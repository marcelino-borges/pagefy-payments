import { Coupon } from "./coupon.models";
import { Customer } from "./customer.models";

export interface PromotionCode {
  id: string;
  object: string;
  active: boolean;
  code: string;
  coupon: Coupon;
  created: number;
  customer: Customer | string | null;
  expires_at: number | null;
  livemode: boolean;
  max_redemptions: number | null;
  metadata: any;
  restrictions: {
    currency_options: any;
    first_time_transaction: boolean;
    minimum_amount: number | null;
    minimum_amount_currency: string | null;
  };
  times_redeemed: number;
}
