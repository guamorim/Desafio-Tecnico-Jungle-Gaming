import { delay, http, HttpResponse } from "msw";

import {
  nftCatalogTabOptions,
  nftSortOptions,
  type NftCatalogSort,
  type NftCatalogTab,
} from "@/features/nfts/catalog-filters";
import {
  calculateEthPercentage,
  calculateEthTotal,
} from "@/features/cart/cart-totals";
import { createUserCartOwnerId } from "@/features/cart/cart-owner-id";
import type {
  AddCartItemInput,
  ApplyCartCouponInput,
  Cart,
  CartItem,
  CartResponse,
  UpdateCartItemInput,
} from "@/features/cart/types";
import type {
  CreateOrderInput,
  MockOrderRecord,
  Order,
  OrderFieldErrors,
} from "@/features/checkout/types";
import type {
  FavoriteNftsResponse,
  ListNftsResponse,
  NftDetail,
  NftSummary,
} from "@/features/nfts/types";
import {
  authHandlers,
  findAuthenticatedUser,
  readBearerToken,
} from "./auth-handlers";
import {
  getMockDatabase,
  saveMockCart,
  saveMockFavorites,
  saveMockNfts,
  saveMockOrder,
} from "./mock-database";
import { findMockCoupon } from "./fixtures/coupons";
import { walletHandlers } from "./wallet-handlers";

const pageSize = 9;
const newReleaseCutoff = Date.parse(
  "2026-10-07T00:00:00.000Z",
);

type NftFilters = {
  readonly categories: readonly string[];
  readonly maximumPrice: number | undefined;
  readonly minimumPrice: number | undefined;
  readonly network: string | null;
  readonly searchQuery: string;
  readonly tab: NftCatalogTab;
};

function parseOptionalNumber(
  value: string | null,
) {
  if (value === null || value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : undefined;
}

function parseList(value: string | null) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}

function parseSort(
  value: string | null,
): NftCatalogSort {
  return (
    nftSortOptions.find(
      (option) => option.value === value,
    )?.value ?? "recent"
  );
}

function parseTab(
  value: string | null,
): NftCatalogTab {
  return (
    nftCatalogTabOptions.find(
      (option) => option.value === value,
    )?.value ?? "all"
  );
}

function parsePage(value: string | null) {
  if (value === null) {
    return 1;
  }

  const parsedPage = Number(value);

  return Number.isInteger(parsedPage) &&
    parsedPage > 0
    ? parsedPage
    : 1;
}

function paginateNfts(
  items: readonly NftSummary[],
  page: number,
): ListNftsResponse {
  const startIndex = (page - 1) * pageSize;

  return {
    items: items.slice(
      startIndex,
      startIndex + pageSize,
    ),
    pagination: {
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.ceil(
        items.length / pageSize,
      ),
    },
  };
}

function sortNfts(
  items: readonly NftSummary[],
  sort: NftCatalogSort,
) {
  return [...items].sort((left, right) => {
    if (sort === "price-asc") {
      return (
        Number(left.startingPriceEth) -
        Number(right.startingPriceEth)
      );
    }

    if (sort === "price-desc") {
      return (
        Number(right.startingPriceEth) -
        Number(left.startingPriceEth)
      );
    }

    return (
      Date.parse(right.listedAt) -
      Date.parse(left.listedAt)
    );
  });
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function matchesNftSearch(
  nft: NftSummary,
  searchQuery: string,
) {
  const searchableText = [
    nft.name,
    nft.creatorName,
    nft.collectionName,
  ].join(" ");

  return normalizeSearchValue(
    searchableText,
  ).includes(searchQuery);
}

function matchesCatalogTab(
  nft: NftSummary,
  tab: NftCatalogTab,
) {
  if (tab === "new") {
    return (
      Date.parse(nft.listedAt) >=
      newReleaseCutoff
    );
  }

  if (tab === "trending") {
    return nft.isTrending;
  }

  return true;
}

function matchesNftFilters(
  nft: NftSummary,
  filters: NftFilters,
) {
  const nftPrice = Number(
    nft.startingPriceEth,
  );

  return (
    matchesCatalogTab(nft, filters.tab) &&
    (filters.searchQuery === "" ||
      matchesNftSearch(
        nft,
        filters.searchQuery,
      )) &&
    (filters.categories.length === 0 ||
      filters.categories.includes(
        nft.category,
      )) &&
    (filters.network === null ||
      filters.network === "" ||
      nft.network === filters.network) &&
    (filters.minimumPrice === undefined ||
      nftPrice >= filters.minimumPrice) &&
    (filters.maximumPrice === undefined ||
      nftPrice <= filters.maximumPrice)
  );
}

function getAuthenticatedUserId(request: Request) {
  const token = readBearerToken(request);
  const authenticated = token
    ? findAuthenticatedUser(token)
    : null;

  return authenticated?.user.id ?? null;
}

function shouldFailFavoriteMutation() {
  return (
    typeof localStorage !== "undefined" &&
    localStorage.getItem(
      "jungle-nft-marketplace:mock-favorite-error",
    ) === "true"
  );
}

function withFavoriteState(
  nft: NftSummary,
  userId: string | null,
): NftSummary {
  const favoriteIds = userId
    ? getMockDatabase().favorites[userId] ?? []
    : [];

  return {
    ...nft,
    isFavorite: favoriteIds.includes(nft.id),
  };
}

function withDetailFavoriteState(
  nft: NftDetail,
  userId: string | null,
): NftDetail {
  return {
    ...nft,
    isFavorite: withFavoriteState(nft, userId)
      .isFavorite,
    relatedNfts: nft.relatedNfts.map((relatedNft) =>
      withFavoriteState(relatedNft, userId),
    ),
  };
}

function isAddCartItemInput(
  value: unknown,
): value is AddCartItemInput {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.nftId === "string" &&
    typeof input.editionId === "string" &&
    typeof input.quantity === "number" &&
    Number.isInteger(input.quantity) &&
    input.quantity > 0
  );
}

function isUpdateCartItemInput(
  value: unknown,
): value is Pick<UpdateCartItemInput, "quantity"> {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.quantity === "number" &&
    Number.isInteger(input.quantity) &&
    input.quantity > 0
  );
}

function isApplyCartCouponInput(
  value: unknown,
): value is ApplyCartCouponInput {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.code === "string" &&
    input.code.trim().length > 0 &&
    input.code.trim().length <= 32
  );
}

function createEmptyCart(ownerId: string): Cart {
  return {
    id: `cart-${ownerId}`,
    ownerId,
    items: [],
    couponCode: null,
    version: 0,
  };
}

function mergeCartItems(
  guestCart: Cart,
  userCart: Cart,
  nfts: readonly NftDetail[],
) {
  const mergedItems = [...userCart.items];

  for (const guestItem of guestCart.items) {
    const nft = nfts.find(
      (candidate) => candidate.id === guestItem.nftId,
    );
    const edition = nft?.editions.find(
      (candidate) =>
        candidate.id === guestItem.editionId,
    );

    if (!edition) {
      continue;
    }

    const currentIndex = mergedItems.findIndex(
      (item) => item.id === guestItem.id,
    );
    const currentItem =
      currentIndex >= 0
        ? mergedItems[currentIndex]
        : undefined;
    const purchaseLimit = Math.min(
      edition.availableQuantity,
      edition.maximumPurchaseQuantity,
    );
    const quantity = Math.min(
      (currentItem?.quantity ?? 0) +
        guestItem.quantity,
      purchaseLimit,
    );

    if (quantity <= 0) {
      continue;
    }

    const mergedItem = {
      ...guestItem,
      quantity,
    } satisfies CartItem;

    if (currentIndex >= 0) {
      mergedItems[currentIndex] = mergedItem;
    } else {
      mergedItems.push(mergedItem);
    }
  }

  return mergedItems;
}

function createCartResponse(
  cart: Cart,
  nfts: readonly NftDetail[],
): CartResponse {
  const items = cart.items.flatMap((item) => {
    const nft = nfts.find(
      (candidate) => candidate.id === item.nftId,
    );
    const edition = nft?.editions.find(
      (candidate) =>
        candidate.id === item.editionId,
    );

    if (!nft || !edition) {
      return [];
    }

    return [
      {
        ...item,
        lineTotalEth: calculateEthTotal([
          {
            priceEth: edition.priceEth,
            quantity: item.quantity,
          },
        ]),
        nft: {
          name: nft.name,
          collectionName: nft.collectionName,
          imageUrl: nft.imageUrl,
          version: nft.version,
        },
        edition: {
          name: edition.name,
          priceEth: edition.priceEth,
          availableQuantity:
            edition.availableQuantity,
          maximumPurchaseQuantity:
            edition.maximumPurchaseQuantity,
          version: edition.version,
        },
      },
    ];
  });
  const subtotalEth = calculateEthTotal(
    items.map((item) => ({
      priceEth: item.edition.priceEth,
      quantity: item.quantity,
    })),
  );
  const storedCoupon = cart.couponCode
    ? findMockCoupon(cart.couponCode)
    : undefined;
  const coupon =
    storedCoupon?.status === "active"
      ? {
          code: storedCoupon.code,
          discountPercentage:
            storedCoupon.discountPercentage,
        }
      : null;
  const discountEth = coupon
    ? calculateEthPercentage(
        subtotalEth,
        coupon.discountPercentage,
      )
    : "0";
  const networkFeeEth =
    items.length > 0 ? "0.016" : "0";
  const totalEth = calculateEthTotal([
    {
      priceEth: subtotalEth,
      quantity: 1,
    },
    {
      priceEth: `-${discountEth}`,
      quantity: 1,
    },
    {
      priceEth: networkFeeEth,
      quantity: 1,
    },
  ]);

  return {
    id: cart.id,
    ownerId: cart.ownerId,
    version: cart.version,
    items,
    coupon,
    discountEth,
    networkFeeEth,
    subtotalEth,
    totalEth,
    totalQuantity: items.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
  };
}

function isCreateOrderInput(
  value: unknown,
): value is CreateOrderInput {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;

  if (
    typeof input.collector !== "object" ||
    input.collector === null
  ) {
    return false;
  }

  const collector = input.collector as Record<
    string,
    unknown
  >;

  return (
    typeof input.walletId === "string" &&
    ["ethereum", "polygon", "solana"].includes(
      String(input.network),
    ) &&
    ["metamask", "walletconnect", "coinbase"].includes(
      String(input.provider),
    ) &&
    typeof input.expectedCartVersion === "number" &&
    Number.isInteger(input.expectedCartVersion) &&
    typeof input.expectedTotalEth === "string" &&
    typeof collector.displayName === "string" &&
    typeof collector.username === "string" &&
    typeof collector.profileName === "string" &&
    typeof collector.email === "string" &&
    typeof collector.ensName === "string" &&
    (input.scenario === undefined ||
      [
        "success",
        "wallet-rejected",
        "payment-refused",
        "order-timeout",
      ].includes(String(input.scenario)))
  );
}

function validateOrderCollector(
  input: CreateOrderInput,
) {
  const errors: OrderFieldErrors = {};
  const { collector } = input;

  if (
    collector.displayName.trim().length < 2 ||
    collector.displayName.trim().length > 60
  ) {
    errors.displayName =
      "Use um nome entre 2 e 60 caracteres.";
  }

  if (
    collector.username.trim().length < 3 ||
    collector.username.trim().length > 30
  ) {
    errors.username =
      "Use um nome de usuário entre 3 e 30 caracteres.";
  }

  if (
    collector.profileName.trim().length < 2 ||
    collector.profileName.trim().length > 60
  ) {
    errors.profileName =
      "Use um nome de perfil entre 2 e 60 caracteres.";
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      collector.email.trim(),
    )
  ) {
    errors.email = "Informe um e-mail válido.";
  }

  if (
    collector.ensName.trim() !== "" &&
    !/^[a-z0-9][a-z0-9-]{1,62}\.eth$/.test(
      collector.ensName
        .trim()
        .toLocaleLowerCase("pt-BR"),
    )
  ) {
    errors.ensName =
      "Use um nome ENS válido terminado em .eth.";
  }

  return errors;
}

function createOrderFingerprint(
  input: CreateOrderInput,
) {
  return JSON.stringify(input);
}

function toOrder(record: MockOrderRecord): Order {
  return {
    id: record.id,
    userId: record.userId,
    status: record.status,
    collector: record.collector,
    wallet: record.wallet,
    items: record.items,
    summary: record.summary,
    transactionId: record.transactionId,
    explorerUrl: record.explorerUrl,
    refusalReason: record.refusalReason,
    idempotencyKey: record.idempotencyKey,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    version: record.version,
  };
}

function createTransactionId() {
  return `0x${crypto
    .randomUUID()
    .replaceAll("-", "")
    .padEnd(64, "0")}`;
}

function resolveOrderIfDue(
  order: MockOrderRecord,
): MockOrderRecord {
  if (
    order.status !== "pending" ||
    Date.parse(order.resolvesAt) > Date.now()
  ) {
    return order;
  }

  const database = getMockDatabase();
  const hasUnavailableItem = order.items.some(
    (orderItem) => {
      const nft = database.nfts.find(
        (candidate) =>
          candidate.id === orderItem.nftId,
      );
      const edition = nft?.editions.find(
        (candidate) =>
          candidate.id === orderItem.editionId,
      );

      return (
        !edition ||
        edition.availableQuantity < orderItem.quantity
      );
    },
  );
  const isConfirmed =
    order.intendedStatus === "confirmed" &&
    !hasUnavailableItem;
  const transactionId = isConfirmed
    ? createTransactionId()
    : null;
  const resolvedOrder = {
    ...order,
    status: isConfirmed
      ? ("confirmed" as const)
      : ("refused" as const),
    transactionId,
    explorerUrl: transactionId
      ? `https://sepolia.etherscan.io/tx/${transactionId}`
      : null,
    refusalReason: isConfirmed
      ? null
      : hasUnavailableItem
        ? "Um item ficou indisponível antes da confirmação."
        : "O pagamento foi recusado pela carteira simulada.",
    updatedAt: new Date().toISOString(),
    version: order.version + 1,
  } satisfies MockOrderRecord;

  if (isConfirmed) {
    const nextNfts = database.nfts.map((nft) => {
      const purchasedItems = order.items.filter(
        (item) => item.nftId === nft.id,
      );

      if (purchasedItems.length === 0) {
        return nft;
      }

      const editions = nft.editions.map((edition) => {
        const purchased = purchasedItems.find(
          (item) => item.editionId === edition.id,
        );

        return purchased
          ? {
              ...edition,
              availableQuantity: Math.max(
                0,
                edition.availableQuantity -
                  purchased.quantity,
              ),
              version: edition.version + 1,
            }
          : edition;
      });

      return {
        ...nft,
        editions,
        availableQuantity: editions.reduce(
          (total, edition) =>
            total + edition.availableQuantity,
          0,
        ),
        version: nft.version + 1,
      };
    });
    const ownerId = createUserCartOwnerId(order.userId);
    const currentCart = database.carts[ownerId];

    if (currentCart) {
      const nextItems = currentCart.items.flatMap(
        (cartItem) => {
          const purchased = order.items.find(
            (item) => item.id === cartItem.id,
          );

          if (!purchased) {
            return [cartItem];
          }

          const remainingQuantity =
            cartItem.quantity - purchased.quantity;

          return remainingQuantity > 0
            ? [
                {
                  ...cartItem,
                  quantity: remainingQuantity,
                },
              ]
            : [];
        },
      );

      saveMockCart({
        ...currentCart,
        items: nextItems,
        couponCode:
          nextItems.length > 0
            ? currentCart.couponCode
            : null,
        version: currentCart.version + 1,
      });
    }

    saveMockNfts(nextNfts);
  }

  saveMockOrder(resolvedOrder);

  return resolvedOrder;
}

export const handlers = [
  ...authHandlers,
  ...walletHandlers,
  http.get("/api/nfts", async ({ request }) => {
    const url = new URL(request.url);
    const page = parsePage(
      url.searchParams.get("page"),
    );
    const scenario = url.searchParams.get("scenario");
    const sort = parseSort(
      url.searchParams.get("sort"),
    );
    const filters = {
      categories: parseList(
        url.searchParams.get("categories"),
      ),
      maximumPrice: parseOptionalNumber(
        url.searchParams.get("maximumPrice"),
      ),
      minimumPrice: parseOptionalNumber(
        url.searchParams.get("minimumPrice"),
      ),
      network: url.searchParams.get("network"),
      searchQuery: normalizeSearchValue(
        url.searchParams.get("q") ?? "",
      ),
      tab: parseTab(
        url.searchParams.get("tab"),
      ),
    } satisfies NftFilters;

    await delay(500);

    if (scenario === "empty") {
      return HttpResponse.json(
        paginateNfts([], page),
      );
    }

    const userId = getAuthenticatedUserId(request);
    const matchingNfts = getMockDatabase().nfts
      .filter((nft) => matchesNftFilters(nft, filters))
      .map((nft) => withFavoriteState(nft, userId));

    const sortedNfts = sortNfts(
      matchingNfts,
      sort,
    );

    return HttpResponse.json(
      paginateNfts(sortedNfts, page),
    );
  }),
  http.get(
    "/api/nfts/:nftId",
    async ({ params, request }) => {
      await delay(500);

      const nftId = String(params.nftId);
      const nft = getMockDatabase().nfts.find(
        (item) => item.id === nftId,
      );

      if (!nft) {
        return HttpResponse.json(
          { message: "NFT não encontrado." },
          { status: 404 },
        );
      }

      return HttpResponse.json(
        withDetailFavoriteState(
          nft,
          getAuthenticatedUserId(request),
        ),
      );
    },
  ),
  http.get("/api/favorites", async ({ request }) => {
    await delay(300);

    const userId = getAuthenticatedUserId(request);

    if (!userId) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      );
    }

    const database = getMockDatabase();
    const favoriteIds = database.favorites[userId] ?? [];
    const response = {
      items: favoriteIds.flatMap((nftId) => {
        const nft = database.nfts.find(
          (candidate) => candidate.id === nftId,
        );

        return nft
          ? [withFavoriteState(nft, userId)]
          : [];
      }),
    } satisfies FavoriteNftsResponse;

    return HttpResponse.json(response);
  }),
  http.post(
    "/api/favorites/:nftId",
    async ({ params, request }) => {
      await delay(400);

      const userId = getAuthenticatedUserId(request);

      if (!userId) {
        return HttpResponse.json(
          { message: "Autenticação necessária." },
          { status: 401 },
        );
      }

      if (shouldFailFavoriteMutation()) {
        return HttpResponse.json(
          {
            message:
              "Falha simulada ao atualizar o favorito.",
          },
          { status: 503 },
        );
      }

      const database = getMockDatabase();
      const nftId = String(params.nftId);
      const nft = database.nfts.find(
        (candidate) => candidate.id === nftId,
      );

      if (!nft) {
        return HttpResponse.json(
          { message: "NFT não encontrado." },
          { status: 404 },
        );
      }

      const currentIds = database.favorites[userId] ?? [];

      saveMockFavorites(
        userId,
        currentIds.includes(nftId)
          ? currentIds
          : [...currentIds, nftId],
      );

      return HttpResponse.json(
        withFavoriteState(nft, userId),
      );
    },
  ),
  http.delete(
    "/api/favorites/:nftId",
    async ({ params, request }) => {
      await delay(400);

      const userId = getAuthenticatedUserId(request);

      if (!userId) {
        return HttpResponse.json(
          { message: "Autenticação necessária." },
          { status: 401 },
        );
      }

      if (shouldFailFavoriteMutation()) {
        return HttpResponse.json(
          {
            message:
              "Falha simulada ao atualizar o favorito.",
          },
          { status: 503 },
        );
      }

      const database = getMockDatabase();
      const nftId = String(params.nftId);
      const nft = database.nfts.find(
        (candidate) => candidate.id === nftId,
      );

      if (!nft) {
        return HttpResponse.json(
          { message: "NFT não encontrado." },
          { status: 404 },
        );
      }

      saveMockFavorites(
        userId,
        (database.favorites[userId] ?? []).filter(
          (favoriteId) => favoriteId !== nftId,
        ),
      );

      return HttpResponse.json({
        ...withFavoriteState(nft, userId),
        isFavorite: false,
      });
    },
  ),
  http.get("/api/cart", async ({ request }) => {
    await delay(300);

    const ownerId = request.headers.get(
      "X-Cart-Owner-Id",
    );

    if (!ownerId) {
      return HttpResponse.json(
        { message: "Identidade do carrinho ausente." },
        { status: 400 },
      );
    }

    const cart =
      getMockDatabase().carts[ownerId] ??
      createEmptyCart(ownerId);

    return HttpResponse.json(
      createCartResponse(
        cart,
        getMockDatabase().nfts,
      ),
    );
  }),
  http.post(
    "/api/cart/merge",
    async ({ request }) => {
      await delay(400);

      const guestOwnerId = request.headers.get(
        "X-Cart-Owner-Id",
      );
      const token = readBearerToken(request);
      const authenticated = token
        ? findAuthenticatedUser(token)
        : null;

      if (!authenticated) {
        return HttpResponse.json(
          { message: "Autenticação necessária." },
          { status: 401 },
        );
      }

      if (!guestOwnerId?.startsWith("guest-")) {
        return HttpResponse.json(
          {
            message:
              "Identidade do carrinho visitante inválida.",
          },
          { status: 400 },
        );
      }

      const database = getMockDatabase();
      const userOwnerId = createUserCartOwnerId(
        authenticated.user.id,
      );
      const guestCart =
        database.carts[guestOwnerId] ??
        createEmptyCart(guestOwnerId);
      const userCart =
        database.carts[userOwnerId] ??
        createEmptyCart(userOwnerId);
      const mergedCart = {
        ...userCart,
        items: mergeCartItems(
          guestCart,
          userCart,
          database.nfts,
        ),
        couponCode:
          userCart.couponCode ??
          guestCart.couponCode,
        version:
          userCart.version +
          (guestCart.items.length > 0 ||
          guestCart.couponCode
            ? 1
            : 0),
      } satisfies Cart;
      const clearedGuestCart = {
        ...guestCart,
        items: [],
        couponCode: null,
        version: guestCart.version + 1,
      } satisfies Cart;

      saveMockCart(mergedCart);
      saveMockCart(clearedGuestCart);

      return HttpResponse.json(
        createCartResponse(
          mergedCart,
          database.nfts,
        ),
      );
    },
  ),
  http.post(
    "/api/cart/items",
    async ({ request }) => {
      await delay(500);

      const ownerId = request.headers.get(
        "X-Cart-Owner-Id",
      );
      const input: unknown = await request.json();

      if (!ownerId) {
        return HttpResponse.json(
          { message: "Identidade do carrinho ausente." },
          { status: 400 },
        );
      }

      if (!isAddCartItemInput(input)) {
        return HttpResponse.json(
          { message: "Item do carrinho inválido." },
          { status: 400 },
        );
      }

      const database = getMockDatabase();
      const nft = database.nfts.find(
        (item) => item.id === input.nftId,
      );

      if (!nft) {
        return HttpResponse.json(
          { message: "NFT não encontrado." },
          { status: 404 },
        );
      }

      const edition = nft.editions.find(
        (item) => item.id === input.editionId,
      );

      if (!edition) {
        return HttpResponse.json(
          { message: "Edição não encontrada." },
          { status: 404 },
        );
      }

      const currentCart =
        database.carts[ownerId] ??
        createEmptyCart(ownerId);

      const itemId = `${nft.id}:${edition.id}`;
      const currentItem = currentCart.items.find(
        (item) => item.id === itemId,
      );
      const nextQuantity =
        (currentItem?.quantity ?? 0) + input.quantity;
      const purchaseLimit = Math.min(
        edition.availableQuantity,
        edition.maximumPurchaseQuantity,
      );

      if (nextQuantity > purchaseLimit) {
        return HttpResponse.json(
          {
            message:
              purchaseLimit === 0
                ? "Esta edição está esgotada."
                : `O limite desta edição é ${purchaseLimit}.`,
          },
          { status: 409 },
        );
      }

      const nextItem = {
        id: itemId,
        nftId: nft.id,
        editionId: edition.id,
        quantity: nextQuantity,
      } satisfies CartItem;

      const nextItems = currentItem
        ? currentCart.items.map((item) =>
            item.id === itemId ? nextItem : item,
          )
        : [...currentCart.items, nextItem];

      const nextCart = {
        ...currentCart,
        items: nextItems,
        version: currentCart.version + 1,
      } satisfies Cart;

      saveMockCart(nextCart);

      return HttpResponse.json(
        createCartResponse(
          nextCart,
          database.nfts,
        ),
        {
          status: currentItem ? 200 : 201,
        },
      );
    },
  ),
  http.patch(
    "/api/cart/items/:itemId",
    async ({ params, request }) => {
      await delay(400);

      const ownerId = request.headers.get(
        "X-Cart-Owner-Id",
      );
      const input: unknown = await request.json();

      if (!ownerId) {
        return HttpResponse.json(
          { message: "Identidade do carrinho ausente." },
          { status: 400 },
        );
      }

      if (!isUpdateCartItemInput(input)) {
        return HttpResponse.json(
          { message: "Quantidade inválida." },
          { status: 400 },
        );
      }

      const database = getMockDatabase();
      const currentCart = database.carts[ownerId];
      const itemId = String(params.itemId);
      const currentItem = currentCart?.items.find(
        (item) => item.id === itemId,
      );

      if (!currentCart || !currentItem) {
        return HttpResponse.json(
          { message: "Item do carrinho não encontrado." },
          { status: 404 },
        );
      }

      const nft = database.nfts.find(
        (item) => item.id === currentItem.nftId,
      );
      const edition = nft?.editions.find(
        (item) =>
          item.id === currentItem.editionId,
      );

      if (!edition) {
        return HttpResponse.json(
          { message: "Edição não encontrada." },
          { status: 404 },
        );
      }

      const purchaseLimit = Math.min(
        edition.availableQuantity,
        edition.maximumPurchaseQuantity,
      );

      if (input.quantity > purchaseLimit) {
        return HttpResponse.json(
          {
            message:
              purchaseLimit === 0
                ? "Esta edição está esgotada."
                : `O limite desta edição é ${purchaseLimit}.`,
          },
          { status: 409 },
        );
      }

      const nextCart = {
        ...currentCart,
        items: currentCart.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: input.quantity }
            : item,
        ),
        version: currentCart.version + 1,
      } satisfies Cart;

      saveMockCart(nextCart);

      return HttpResponse.json(
        createCartResponse(nextCart, database.nfts),
      );
    },
  ),
  http.delete(
    "/api/cart/items/:itemId",
    async ({ params, request }) => {
      await delay(400);

      const ownerId = request.headers.get(
        "X-Cart-Owner-Id",
      );

      if (!ownerId) {
        return HttpResponse.json(
          { message: "Identidade do carrinho ausente." },
          { status: 400 },
        );
      }

      const database = getMockDatabase();
      const currentCart = database.carts[ownerId];
      const itemId = String(params.itemId);
      const itemExists = currentCart?.items.some(
        (item) => item.id === itemId,
      );

      if (!currentCart || !itemExists) {
        return HttpResponse.json(
          { message: "Item do carrinho não encontrado." },
          { status: 404 },
        );
      }

      const nextCart = {
        ...currentCart,
        items: currentCart.items.filter(
          (item) => item.id !== itemId,
        ),
        version: currentCart.version + 1,
      } satisfies Cart;

      saveMockCart(nextCart);

      return HttpResponse.json(
        createCartResponse(nextCart, database.nfts),
      );
    },
  ),
  http.delete(
    "/api/cart/items",
    async ({ request }) => {
      await delay(400);

      const ownerId = request.headers.get(
        "X-Cart-Owner-Id",
      );

      if (!ownerId) {
        return HttpResponse.json(
          { message: "Identidade do carrinho ausente." },
          { status: 400 },
        );
      }

      const database = getMockDatabase();
      const currentCart =
        database.carts[ownerId] ??
        createEmptyCart(ownerId);
      const nextCart = {
        ...currentCart,
        items: [],
        couponCode: null,
        version:
          currentCart.items.length > 0 ||
          currentCart.couponCode !== null
            ? currentCart.version + 1
            : currentCart.version,
      } satisfies Cart;

      saveMockCart(nextCart);

      return HttpResponse.json(
        createCartResponse(nextCart, database.nfts),
      );
    },
  ),
  http.post(
    "/api/cart/coupon",
    async ({ request }) => {
      await delay(500);

      const ownerId = request.headers.get(
        "X-Cart-Owner-Id",
      );
      const input: unknown = await request.json();

      if (!ownerId) {
        return HttpResponse.json(
          { message: "Identidade do carrinho ausente." },
          { status: 400 },
        );
      }

      if (!isApplyCartCouponInput(input)) {
        return HttpResponse.json(
          { message: "Informe um código promocional válido." },
          { status: 400 },
        );
      }

      const database = getMockDatabase();
      const currentCart =
        database.carts[ownerId] ??
        createEmptyCart(ownerId);

      if (currentCart.items.length === 0) {
        return HttpResponse.json(
          {
            message:
              "Adicione um NFT antes de aplicar o cupom.",
          },
          { status: 409 },
        );
      }

      const normalizedCode = input.code
        .trim()
        .toLocaleUpperCase("pt-BR");
      const coupon = findMockCoupon(normalizedCode);

      if (!coupon) {
        return HttpResponse.json(
          { message: "Código promocional inválido." },
          { status: 422 },
        );
      }

      if (coupon.status === "expired") {
        return HttpResponse.json(
          { message: "Este código promocional expirou." },
          { status: 410 },
        );
      }

      const nextCart = {
        ...currentCart,
        couponCode: coupon.code,
        version:
          currentCart.couponCode === coupon.code
            ? currentCart.version
            : currentCart.version + 1,
      } satisfies Cart;

      saveMockCart(nextCart);

      return HttpResponse.json(
        createCartResponse(nextCart, database.nfts),
      );
    },
  ),
  http.delete(
    "/api/cart/coupon",
    async ({ request }) => {
      await delay(400);

      const ownerId = request.headers.get(
        "X-Cart-Owner-Id",
      );

      if (!ownerId) {
        return HttpResponse.json(
          { message: "Identidade do carrinho ausente." },
          { status: 400 },
        );
      }

      const database = getMockDatabase();
      const currentCart =
        database.carts[ownerId] ??
        createEmptyCart(ownerId);
      const nextCart = {
        ...currentCart,
        couponCode: null,
        version:
          currentCart.couponCode === null
            ? currentCart.version
            : currentCart.version + 1,
      } satisfies Cart;

      saveMockCart(nextCart);

      return HttpResponse.json(
        createCartResponse(nextCart, database.nfts),
      );
    },
  ),
  http.post("/api/orders", async ({ request }) => {
    await delay(650);

    const token = readBearerToken(request);
    const authenticated = token
      ? findAuthenticatedUser(token)
      : null;

    if (!authenticated) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      );
    }

    const idempotencyKey = request.headers
      .get("Idempotency-Key")
      ?.trim();

    if (
      !idempotencyKey ||
      idempotencyKey.length < 8 ||
      idempotencyKey.length > 128
    ) {
      return HttpResponse.json(
        {
          message:
            "Informe uma chave de idempotência válida.",
        },
        { status: 400 },
      );
    }

    let input: unknown;

    try {
      input = await request.json();
    } catch {
      input = null;
    }

    if (!isCreateOrderInput(input)) {
      return HttpResponse.json(
        { message: "Dados do pedido inválidos." },
        { status: 400 },
      );
    }

    const userId = authenticated.user.id;
    const fingerprint = createOrderFingerprint(input);
    const existingOrder = Object.values(
      getMockDatabase().orders,
    ).find(
      (order) =>
        order.userId === userId &&
        order.idempotencyKey === idempotencyKey,
    );

    if (existingOrder) {
      if (
        existingOrder.inputFingerprint !== fingerprint
      ) {
        return HttpResponse.json(
          {
            message:
              "A chave de idempotência já foi usada com outro conteúdo.",
            code: "IDEMPOTENCY_CONFLICT",
          },
          { status: 409 },
        );
      }

      return HttpResponse.json(
        toOrder(resolveOrderIfDue(existingOrder)),
      );
    }

    const fieldErrors = validateOrderCollector(input);

    if (Object.keys(fieldErrors).length > 0) {
      return HttpResponse.json(
        {
          message: "Revise os dados do colecionador.",
          fieldErrors,
        },
        { status: 422 },
      );
    }

    const database = getMockDatabase();
    const wallet = (
      database.wallets[userId] ?? []
    ).find(
      (candidate) => candidate.id === input.walletId,
    );

    if (!wallet) {
      return HttpResponse.json(
        { message: "Carteira não encontrada." },
        { status: 404 },
      );
    }

    if (
      wallet.connectionStatus !== "connected" ||
      wallet.network !== input.network ||
      wallet.provider !== input.provider
    ) {
      return HttpResponse.json(
        {
          message:
            "Conecte a carteira selecionada antes de confirmar.",
          code: "WALLET_NOT_CONNECTED",
        },
        { status: 409 },
      );
    }

    const ownerId = createUserCartOwnerId(userId);
    const cart =
      database.carts[ownerId] ??
      createEmptyCart(ownerId);
    const currentQuote = createCartResponse(
      cart,
      database.nfts,
    );

    if (currentQuote.items.length === 0) {
      return HttpResponse.json(
        {
          message: "O carrinho está vazio.",
          code: "CART_EMPTY",
        },
        { status: 409 },
      );
    }

    const hasInvalidAvailability = cart.items.some(
      (cartItem) => {
        const nft = database.nfts.find(
          (candidate) =>
            candidate.id === cartItem.nftId,
        );
        const edition = nft?.editions.find(
          (candidate) =>
            candidate.id === cartItem.editionId,
        );

        return (
          !edition ||
          cartItem.quantity >
            Math.min(
              edition.availableQuantity,
              edition.maximumPurchaseQuantity,
            )
        );
      },
    );

    if (
      hasInvalidAvailability ||
      cart.version !== input.expectedCartVersion ||
      currentQuote.totalEth !== input.expectedTotalEth
    ) {
      return HttpResponse.json(
        {
          message:
            "A cotação mudou. Revise os valores antes de confirmar novamente.",
          code: "QUOTE_CHANGED",
        },
        { status: 409 },
      );
    }

    const now = new Date();
    const orderId = `order-${crypto.randomUUID()}`;
    const order = {
      id: orderId,
      userId,
      status: "pending",
      collector: {
        displayName: input.collector.displayName.trim(),
        username: input.collector.username.trim(),
        profileName: input.collector.profileName.trim(),
        email: input.collector.email
          .trim()
          .toLocaleLowerCase("pt-BR"),
        ensName: input.collector.ensName
          .trim()
          .toLocaleLowerCase("pt-BR"),
      },
      wallet: {
        id: wallet.id,
        label: wallet.label,
        address: wallet.address,
        network: input.network,
        provider: input.provider,
      },
      items: currentQuote.items.map((item) => {
        const nft = database.nfts.find(
          (candidate) => candidate.id === item.nftId,
        );

        return {
          id: item.id,
          nftId: item.nftId,
          editionId: item.editionId,
          name: item.nft.name,
          collectionName: item.nft.collectionName,
          imageUrl: item.nft.imageUrl,
          tokenId: nft?.tokenId ?? "",
          editionName: item.edition.name,
          unitPriceEth: item.edition.priceEth,
          quantity: item.quantity,
          lineTotalEth: item.lineTotalEth,
        };
      }),
      summary: {
        couponCode: currentQuote.coupon?.code ?? null,
        discountEth: currentQuote.discountEth,
        networkFeeEth: currentQuote.networkFeeEth,
        subtotalEth: currentQuote.subtotalEth,
        totalEth: currentQuote.totalEth,
      },
      transactionId: null,
      explorerUrl: null,
      refusalReason: null,
      idempotencyKey,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 1,
      inputFingerprint: fingerprint,
      intendedStatus:
        input.scenario === "payment-refused"
          ? "refused"
          : "confirmed",
      resolvesAt: new Date(
        now.getTime() + 1_500,
      ).toISOString(),
    } satisfies MockOrderRecord;

    saveMockOrder(order);

    if (input.scenario === "order-timeout") {
      await delay(10_500);
    }

    return HttpResponse.json(toOrder(order), {
      status: 202,
    });
  }),
  http.get(
    "/api/orders/:orderId",
    async ({ params, request }) => {
      await delay(350);

      const token = readBearerToken(request);
      const authenticated = token
        ? findAuthenticatedUser(token)
        : null;

      if (!authenticated) {
        return HttpResponse.json(
          { message: "Autenticação necessária." },
          { status: 401 },
        );
      }

      const order = getMockDatabase().orders[
        String(params.orderId)
      ];

      if (
        !order ||
        order.userId !== authenticated.user.id
      ) {
        return HttpResponse.json(
          { message: "Pedido não encontrado." },
          { status: 404 },
        );
      }

      return HttpResponse.json(
        toOrder(resolveOrderIfDue(order)),
      );
    },
  ),
];
