import type { CartCoupon } from "@/features/cart/types";

export type MockCoupon = CartCoupon & {
  readonly status: "active" | "expired";
};

export const mockCoupons = [
  {
    code: "JUNGLE10",
    discountPercentage: 10,
    status: "active",
  },
  {
    code: "GENESIS20",
    discountPercentage: 20,
    status: "expired",
  },
] as const satisfies readonly MockCoupon[];

export function findMockCoupon(code: string) {
  return mockCoupons.find(
    (coupon) => coupon.code === code,
  );
}
