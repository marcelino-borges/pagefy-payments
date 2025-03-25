export enum CouponDuration {
  FOREVER = "forever",
  ONCE = "once",
  REPEATING = "repeating",
}

export interface Coupon {
  id: string;
  object: string;
  amount_off: number | null;
  created: number;
  currency: string | null;
  duration: CouponDuration;
  /**
   * If `duration` is `repeating`
   */
  duration_in_months: number | null;
  livemode: boolean;
  max_redemptions: number | null;
  metadata: any;
  name: string | null;
  percent_off: number | null;
  redeem_by: number | null;
  times_redeemed: number;
  valid: boolean;
}
