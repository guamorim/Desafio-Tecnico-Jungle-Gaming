import type { Cart } from "@/features/cart/types";
import type { NftDetail } from "@/features/nfts/types";

import { nftDetailFixtures } from "./fixtures/nfts";

type MockDatabase = {
  nfts: NftDetail[];
  carts: Record<string, Cart>;
};

const cartsStorageKey =
  "jungle-nft-marketplace:mock-carts:v2";

function readPersistedCarts(): Record<string, Cart> {
  if (typeof localStorage === "undefined") {
    return {};
  }

  try {
    const serializedCarts =
      localStorage.getItem(cartsStorageKey);

    if (!serializedCarts) {
      return {};
    }

    const parsedCarts: unknown = JSON.parse(
      serializedCarts,
    );

    if (
      typeof parsedCarts !== "object" ||
      parsedCarts === null ||
      Array.isArray(parsedCarts)
    ) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedCarts).flatMap(
        ([ownerId, storedCart]) => {
          if (
            typeof storedCart !== "object" ||
            storedCart === null ||
            Array.isArray(storedCart)
          ) {
            return [];
          }

          const cart = storedCart as Partial<Cart>;

          if (
            typeof cart.id !== "string" ||
            typeof cart.ownerId !== "string" ||
            !Array.isArray(cart.items) ||
            typeof cart.version !== "number"
          ) {
            return [];
          }

          return [
            [
              ownerId,
              {
                id: cart.id,
                ownerId: cart.ownerId,
                items: cart.items,
                couponCode:
                  typeof cart.couponCode === "string"
                    ? cart.couponCode
                    : null,
                version: cart.version,
              } satisfies Cart,
            ] as const,
          ];
        },
      ),
    );
  } catch {
    return {};
  }
}

function persistCarts(carts: Record<string, Cart>) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(
    cartsStorageKey,
    JSON.stringify(carts),
  );
}

function createInitialDatabase(): MockDatabase {
  return structuredClone({
    nfts: nftDetailFixtures,
    carts: readPersistedCarts(),
  });
}

let database = createInitialDatabase();

export function getMockDatabase() {
  return database;
}

export function saveMockCart(cart: Cart) {
  database = {
    ...database,
    carts: {
      ...database.carts,
      [cart.ownerId]: cart,
    },
  };

  persistCarts(database.carts);
}

export function resetMockDatabase() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(cartsStorageKey);
  }

  database = createInitialDatabase();
}
