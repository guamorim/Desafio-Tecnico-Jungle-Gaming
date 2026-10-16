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
import type {
  AddCartItemInput,
  ApplyCartCouponInput,
  Cart,
  CartItem,
  CartResponse,
  UpdateCartItemInput,
} from "@/features/cart/types";
import type {
  ListNftsResponse,
  NftDetail,
  NftSummary,
} from "@/features/nfts/types";
import {
  getMockDatabase,
  saveMockCart,
} from "./mock-database";
import { findMockCoupon } from "./fixtures/coupons";

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

export const handlers = [
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

    const matchingNfts = getMockDatabase().nfts.filter(
      (nft) => matchesNftFilters(nft, filters),
    );

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
    async ({ params }) => {
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

      return HttpResponse.json(nft);
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
];
