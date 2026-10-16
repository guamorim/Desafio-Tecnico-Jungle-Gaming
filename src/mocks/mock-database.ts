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

    return typeof parsedCarts === "object" &&
      parsedCarts !== null &&
      !Array.isArray(parsedCarts)
      ? (parsedCarts as Record<string, Cart>)
      : {};
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
