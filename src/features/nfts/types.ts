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

export type NftEdition = {
  readonly id: string;
  readonly name: string;
  readonly priceEth: string;
  readonly availableQuantity: number;
  readonly maximumPurchaseQuantity: number;
  readonly version: number;
};

export type NftReview = {
  readonly id: string;
  readonly authorName: string;
  readonly comment: string;
  readonly createdAt: string;
  readonly rating: number;
};

export type NftDetail = NftSummary & {
  readonly attributes: readonly string[];
  readonly contractAddress: string;
  readonly description: string;
  readonly editions: readonly NftEdition[];
  readonly gallery: readonly string[];
  readonly rating: string;
  readonly relatedNfts: readonly NftSummary[];
  readonly reviewCount: number;
  readonly reviews: readonly NftReview[];
  readonly royaltyPercentage: string;
  readonly tokenId: string;
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
