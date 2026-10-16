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
  readonly startingPriceEth: string;
  readonly availableQuantity: number;
  readonly isFavorite: boolean;
  readonly version: number;
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
