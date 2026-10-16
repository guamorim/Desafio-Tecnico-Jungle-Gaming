export type CartItem = {
  readonly id: string;
  readonly nftId: string;
  readonly editionId: string;
  readonly quantity: number;
};

export type AddCartItemInput = {
  readonly nftId: string;
  readonly editionId: string;
  readonly quantity: number;
};

export type UpdateCartItemInput = {
  readonly itemId: string;
  readonly quantity: number;
};

export type Cart = {
  readonly id: string;
  readonly ownerId: string;
  readonly items: readonly CartItem[];
  readonly version: number;
};

export type CartItemDetails = CartItem & {
  readonly lineTotalEth: string;
  readonly nft: {
    readonly name: string;
    readonly collectionName: string;
    readonly imageUrl: string;
    readonly version: number;
  };
  readonly edition: {
    readonly name: string;
    readonly priceEth: string;
    readonly availableQuantity: number;
    readonly maximumPurchaseQuantity: number;
    readonly version: number;
  };
};

export type CartResponse = Omit<Cart, "items"> & {
  readonly items: readonly CartItemDetails[];
  readonly subtotalEth: string;
  readonly totalQuantity: number;
};
