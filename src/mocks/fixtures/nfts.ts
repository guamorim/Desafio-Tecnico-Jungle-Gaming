import type {
  NftDetail,
  NftEdition,
  NftSummary,
} from "@/features/nfts/types";

export const nftFixtures = [
  {
    id: "nft-aurora-ape",
    name: "Aurora Ape",
    creatorName: "Maya K.",
    collectionName: "Jungle Genesis",
    category: "digital-art",
    network: "ethereum",
    imageUrl: "/images/nfts/aurora-ape.webp",
    listedAt: "2026-10-12T14:00:00.000Z",
    startingPriceEth: "0.125",
    availableQuantity: 12,
    isFavorite: false,
    isTrending: true,
    version: 1,
  },
  {
    id: "nft-cyber-tiger",
    name: "Cyber Tiger",
    creatorName: "Leo N.",
    collectionName: "Jungle Genesis",
    category: "collectibles",
    network: "polygon",
    imageUrl: "/images/nfts/cyber-tiger.webp",
    listedAt: "2026-10-11T14:00:00.000Z",
    startingPriceEth: "0.280",
    availableQuantity: 7,
    isFavorite: true,
    isTrending: true,
    version: 1,
  },
  {
    id: "nft-ether-bloom",
    name: "Ether Bloom",
    creatorName: "Nina Vale",
    collectionName: "Digital Flora",
    category: "generative",
    network: "solana",
    imageUrl: "/images/nfts/ether-bloom.webp",
    listedAt: "2026-10-10T14:00:00.000Z",
    startingPriceEth: "0.095",
    availableQuantity: 18,
    isFavorite: false,
    isTrending: false,
    version: 1,
  },
  {
    id: "nft-midnight-totem",
    name: "Midnight Totem",
    creatorName: "Ravi Stone",
    collectionName: "Ancient Pixels",
    category: "3d-art",
    network: "ethereum",
    imageUrl: "/images/nfts/midnight-totem.webp",
    listedAt: "2026-10-09T14:00:00.000Z",
    startingPriceEth: "0.410",
    availableQuantity: 4,
    isFavorite: false,
    isTrending: false,
    version: 1,
  },
  {
    id: "nft-sage-nomad",
    name: "Sage Nomad",
    creatorName: "Noah Fields",
    collectionName: "Nomad Society",
    category: "photography",
    network: "polygon",
    imageUrl: "/images/nfts/midnight-totem.webp",
    listedAt: "2026-10-08T14:00:00.000Z",
    startingPriceEth: "1.690",
    availableQuantity: 6,
    isFavorite: false,
    isTrending: true,
    version: 1,
  },
  {
    id: "nft-neon-vessel",
    name: "Neon Vessel",
    creatorName: "Ari Black",
    collectionName: "Jungle Genesis",
    category: "utility",
    network: "solana",
    imageUrl: "/images/nfts/cyber-tiger.webp",
    listedAt: "2026-10-07T14:00:00.000Z",
    startingPriceEth: "1.990",
    availableQuantity: 3,
    isFavorite: false,
    isTrending: false,
    version: 1,
  },
  {
    id: "nft-cosmic-bloom",
    name: "Cosmic Bloom",
    creatorName: "Nina Vale",
    collectionName: "Digital Flora",
    category: "generative",
    network: "ethereum",
    imageUrl: "/images/nfts/ether-bloom.webp",
    listedAt: "2026-10-06T14:00:00.000Z",
    startingPriceEth: "1.290",
    availableQuantity: 8,
    isFavorite: true,
    isTrending: true,
    version: 1,
  },
  {
    id: "nft-violet-nomad",
    name: "Violet Nomad",
    creatorName: "Noah Fields",
    collectionName: "Nomad Society",
    category: "3d-art",
    network: "polygon",
    imageUrl: "/images/nfts/midnight-totem.webp",
    listedAt: "2026-10-05T14:00:00.000Z",
    startingPriceEth: "1.390",
    availableQuantity: 5,
    isFavorite: false,
    isTrending: false,
    version: 1,
  },
  {
    id: "nft-ivory-baron",
    name: "Ivory Baron",
    creatorName: "Ari Black",
    collectionName: "Jungle Genesis",
    category: "collectibles",
    network: "solana",
    imageUrl: "/images/nfts/cyber-tiger.webp",
    listedAt: "2026-10-04T14:00:00.000Z",
    startingPriceEth: "1.790",
    availableQuantity: 2,
    isFavorite: false,
    isTrending: false,
    version: 1,
  },
  {
    id: "nft-golden-beat",
    name: "Golden Beat",
    creatorName: "Maya K.",
    collectionName: "Jungle Genesis",
    category: "music",
    network: "ethereum",
    imageUrl: "/images/nfts/aurora-ape.webp",
    listedAt: "2026-10-03T14:00:00.000Z",
    startingPriceEth: "0.990",
    availableQuantity: 14,
    isFavorite: false,
    isTrending: true,
    version: 1,
  },
  {
    id: "nft-golden-signal",
    name: "Golden Signal",
    creatorName: "Nina Vale",
    collectionName: "Digital Flora",
    category: "memberships",
    network: "polygon",
    imageUrl: "/images/nfts/ether-bloom.webp",
    listedAt: "2026-10-02T14:00:00.000Z",
    startingPriceEth: "0.390",
    availableQuantity: 20,
    isFavorite: false,
    isTrending: false,
    version: 1,
  },
  {
    id: "nft-jungle-oracle",
    name: "Jungle Oracle",
    creatorName: "Maya K.",
    collectionName: "Jungle Genesis",
    category: "games",
    network: "solana",
    imageUrl: "/images/nfts/aurora-ape.webp",
    listedAt: "2026-10-01T14:00:00.000Z",
    startingPriceEth: "2.150",
    availableQuantity: 1,
    isFavorite: true,
    isTrending: true,
    version: 1,
  },
] as const satisfies readonly NftSummary[];

function createNftEditions(
  nft: NftSummary,
  index: number,
): readonly NftEdition[] {
  return [
    {
      id: `${nft.id}-one-of-one`,
      name: "1/1",
      priceEth: multiplyEthPrice(
        nft.startingPriceEth,
        3,
      ),
      availableQuantity: index % 4 === 0 ? 0 : 1,
      maximumPurchaseQuantity: 1,
      version: 1,
    },
    {
      id: `${nft.id}-one-of-ten`,
      name: "1/10",
      priceEth: multiplyEthPrice(
        nft.startingPriceEth,
        2,
      ),
      availableQuantity: Math.min(
        nft.availableQuantity,
        10,
      ),
      maximumPurchaseQuantity: 2,
      version: 1,
    },
    {
      id: `${nft.id}-one-of-fifty`,
      name: "1/50",
      priceEth: nft.startingPriceEth,
      availableQuantity: nft.availableQuantity,
      maximumPurchaseQuantity: Math.min(
        nft.availableQuantity,
        5,
      ),
      version: 1,
    },
    {
      id: `${nft.id}-open`,
      name: "ABERTA",
      priceEth: nft.startingPriceEth,
      availableQuantity: 100 + index * 10,
      maximumPurchaseQuantity: 10,
      version: 1,
    },
  ];
}

function multiplyEthPrice(
  value: string,
  multiplier: number,
) {
  const [integerPart, fractionPart = ""] =
    value.split(".");
  const scale = 10n ** BigInt(fractionPart.length);
  const units =
    BigInt(integerPart) * scale +
    BigInt(fractionPart || "0");
  const result = units * BigInt(multiplier);
  const resultInteger = result / scale;
  const resultFraction = (result % scale)
    .toString()
    .padStart(fractionPart.length, "0")
    .replace(/0+$/, "");

  return resultFraction
    ? `${resultInteger}.${resultFraction}`
    : resultInteger.toString();
}

export const nftDetailFixtures = nftFixtures.map(
  (nft, index) => ({
    ...nft,
    attributes:
      nft.id === "nft-aurora-ape"
        ? ["Óculos", "Aurora", "Raro"]
        : [nft.category, nft.network, "Limitado"],
    contractAddress: `0x7A42${String(index + 1).padStart(4, "0")}19E8`,
    description:
      nft.id === "nft-aurora-ape"
        ? "Um colecionável digital 1/50 da coleção Jungle Genesis, inspirado pelas luzes da aurora e verificado na Ethereum."
        : `${nft.name} é uma obra da coleção ${nft.collectionName}, criada por ${nft.creatorName}.`,
    editions: createNftEditions(nft, index),
    gallery: Array.from(
      { length: 4 },
      () => nft.imageUrl,
    ),
    rating: nft.id === "nft-aurora-ape" ? "4.8" : "4.7",
    relatedNfts: nftFixtures
      .filter(
        (candidate) =>
          candidate.id !== nft.id &&
          candidate.collectionName === nft.collectionName,
      )
      .slice(0, 5),
    reviewCount: nft.id === "nft-aurora-ape" ? 19 : 12 + index,
    reviews: [
      {
        id: `${nft.id}-review-1`,
        authorName: "Lia Collector",
        comment:
          "A arte tem uma identidade muito forte e os detalhes funcionam muito bem em alta resolução.",
        createdAt: "2026-10-14T18:30:00.000Z",
        rating: 5,
      },
      {
        id: `${nft.id}-review-2`,
        authorName: "Rafael Web3",
        comment:
          "Boa apresentação da coleção e informações claras sobre a edição.",
        createdAt: "2026-10-13T12:10:00.000Z",
        rating: 4,
      },
    ],
    royaltyPercentage: "5",
    tokenId:
      nft.id === "nft-aurora-ape"
        ? "#0042"
        : `#${String(100 + index * 23).padStart(4, "0")}`,
  }),
) satisfies readonly NftDetail[];
