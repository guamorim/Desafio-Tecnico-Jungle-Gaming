type CatalogOption = {
  readonly value: string;
  readonly label: string;
};

export const nftCategoryOptions = [
  {
    value: "digital-art",
    label: "Arte digital",
  },
  {
    value: "photography",
    label: "Fotografia",
  },
  {
    value: "music",
    label: "Música",
  },
  {
    value: "3d-art",
    label: "Arte 3D",
  },
  {
    value: "collectibles",
    label: "Colecionáveis",
  },
  {
    value: "generative",
    label: "Generativa",
  },
  {
    value: "games",
    label: "Jogos",
  },
  {
    value: "memberships",
    label: "Assinaturas",
  },
  {
    value: "utility",
    label: "Utilidade",
  },
] as const satisfies readonly CatalogOption[];

export type NftCategory =
  (typeof nftCategoryOptions)[number]["value"];

export const nftNetworkOptions = [
  {
    value: "ethereum",
    label: "Ethereum",
  },
  {
    value: "polygon",
    label: "Polygon",
  },
  {
    value: "solana",
    label: "Solana",
  },
] as const satisfies readonly CatalogOption[];

export type NftNetwork =
  (typeof nftNetworkOptions)[number]["value"];

export const nftPriceLimits = {
  minimum: 0.02,
  maximum: 12.3,
} as const;
