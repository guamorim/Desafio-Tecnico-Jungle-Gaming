import type {
  NftCategory,
  NftNetwork,
} from "./catalog-filters";

export type NftSummary = {
  readonly id: string;
  readonly name: string;
  readonly creatorName: string;
  readonly collectionName: string;
  readonly category: NftCategory;
  readonly network: NftNetwork;
  readonly imageUrl: string;
  readonly listedAt: string;
  readonly startingPriceEth: string;
  readonly availableQuantity: number;
  readonly isFavorite: boolean;
  readonly isTrending: boolean;
  readonly version: number;
};

export type NftDetail = NftSummary & {
  readonly description: string;
  readonly gallery: readonly string[];
  readonly maximumPurchaseQuantity: number;
};

export type PaginationMeta = {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
};

export type ListNftsResponse = {
  readonly items: readonly NftSummary[];
  readonly pagination: PaginationMeta;
};
