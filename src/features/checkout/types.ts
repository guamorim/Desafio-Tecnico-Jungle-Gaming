import type {
  WalletNetwork,
  WalletProvider,
} from "@/features/wallets/types";

export type CheckoutScenario =
  | "success"
  | "wallet-rejected"
  | "payment-refused"
  | "order-timeout";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "refused";

export type OrderCollectorSnapshot = {
  readonly displayName: string;
  readonly username: string;
  readonly profileName: string;
  readonly email: string;
  readonly ensName: string;
};

export type OrderWalletSnapshot = {
  readonly id: string;
  readonly label: string;
  readonly address: string;
  readonly network: WalletNetwork;
  readonly provider: WalletProvider;
};

export type OrderItemSnapshot = {
  readonly id: string;
  readonly nftId: string;
  readonly editionId: string;
  readonly name: string;
  readonly collectionName: string;
  readonly imageUrl: string;
  readonly tokenId: string;
  readonly editionName: string;
  readonly unitPriceEth: string;
  readonly quantity: number;
  readonly lineTotalEth: string;
};

export type OrderSummarySnapshot = {
  readonly couponCode: string | null;
  readonly discountEth: string;
  readonly networkFeeEth: string;
  readonly subtotalEth: string;
  readonly totalEth: string;
};

export type Order = {
  readonly id: string;
  readonly userId: string;
  readonly status: OrderStatus;
  readonly collector: OrderCollectorSnapshot;
  readonly wallet: OrderWalletSnapshot;
  readonly items: readonly OrderItemSnapshot[];
  readonly summary: OrderSummarySnapshot;
  readonly transactionId: string | null;
  readonly explorerUrl: string | null;
  readonly refusalReason: string | null;
  readonly idempotencyKey: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
};

export type CreateOrderInput = {
  readonly collector: OrderCollectorSnapshot;
  readonly walletId: string;
  readonly network: WalletNetwork;
  readonly provider: WalletProvider;
  readonly expectedCartVersion: number;
  readonly expectedTotalEth: string;
  readonly scenario?: CheckoutScenario;
};

export type OrderFieldErrors = Partial<
  Record<keyof OrderCollectorSnapshot, string>
>;

export type OrderErrorCode =
  | "CART_EMPTY"
  | "IDEMPOTENCY_CONFLICT"
  | "QUOTE_CHANGED"
  | "WALLET_NOT_CONNECTED";

export type OrderErrorResponse = {
  readonly message: string;
  readonly code?: OrderErrorCode;
  readonly fieldErrors?: OrderFieldErrors;
};

export type MockOrderRecord = Order & {
  readonly inputFingerprint: string;
  readonly intendedStatus: Exclude<
    OrderStatus,
    "pending"
  >;
  readonly resolvesAt: string;
};
