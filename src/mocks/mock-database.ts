import type { Cart } from "@/features/cart/types";
import type { NftDetail } from "@/features/nfts/types";

import type {
  MockSessionRecord,
  MockUserRecord,
} from "./auth/types";
import { nftDetailFixtures } from "./fixtures/nfts";
import { mockUserFixtures } from "./fixtures/users";

type MockDatabase = {
  nfts: NftDetail[];
  carts: Record<string, Cart>;
  users: MockUserRecord[];
  sessions: Record<string, MockSessionRecord>;
};

type PersistedAuthState = Pick<
  MockDatabase,
  "users" | "sessions"
>;

const cartsStorageKey =
  "jungle-nft-marketplace:mock-carts:v2";
const authStorageKey =
  "jungle-nft-marketplace:mock-auth:v1";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function createLegacyUsername(
  email: string,
  userId: string,
) {
  const localPart = email.split("@")[0] ?? "";
  const normalizedUsername = localPart
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

  return (
    normalizedUsername ||
    `colecionador-${userId.slice(-6)}`
  );
}

function parseMockUserRecord(
  value: unknown,
): MockUserRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.email !== "string" ||
    typeof value.displayName !== "string" ||
    (typeof value.avatarUrl !== "string" &&
      value.avatarUrl !== null) ||
    typeof value.version !== "number" ||
    !Number.isInteger(value.version) ||
    typeof value.passwordSalt !== "string" ||
    typeof value.passwordHash !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    email: value.email,
    displayName: value.displayName,
    username:
      typeof value.username === "string"
        ? value.username
        : createLegacyUsername(
            value.email,
            value.id,
          ),
    ensName:
      typeof value.ensName === "string"
        ? value.ensName
        : "",
    walletNickname:
      typeof value.walletNickname === "string"
        ? value.walletNickname
        : "",
    avatarUrl: value.avatarUrl,
    version: value.version,
    passwordSalt: value.passwordSalt,
    passwordHash: value.passwordHash,
  };
}

function isMockSessionRecord(
  value: unknown,
): value is MockSessionRecord {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.token === "string" &&
    typeof value.userId === "string" &&
    typeof value.expiresAt === "string"
  );
}

function readPersistedAuth(): PersistedAuthState {
  const emptyAuthState: PersistedAuthState = {
    users: [],
    sessions: {},
  };

  if (typeof localStorage === "undefined") {
    return emptyAuthState;
  }

  try {
    const serializedAuth =
      localStorage.getItem(authStorageKey);

    if (!serializedAuth) {
      return emptyAuthState;
    }

    const parsedAuth: unknown = JSON.parse(
      serializedAuth,
    );

    if (!isRecord(parsedAuth)) {
      return emptyAuthState;
    }

    const users = Array.isArray(parsedAuth.users)
      ? parsedAuth.users
          .map(parseMockUserRecord)
          .filter(
            (user): user is MockUserRecord =>
              user !== null,
          )
      : [];
    const sessions = isRecord(parsedAuth.sessions)
      ? Object.fromEntries(
          Object.entries(parsedAuth.sessions).filter(
            (
              entry,
            ): entry is [string, MockSessionRecord] =>
              isMockSessionRecord(entry[1]),
          ),
        )
      : {};

    return { users, sessions };
  } catch {
    return emptyAuthState;
  }
}

function mergeUsers(
  persistedUsers: readonly MockUserRecord[],
) {
  const usersById = new Map<string, MockUserRecord>();

  for (const user of mockUserFixtures) {
    usersById.set(user.id, user);
  }

  for (const user of persistedUsers) {
    usersById.set(user.id, user);
  }

  return Array.from(usersById.values());
}

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

function persistAuth(
  authState: PersistedAuthState,
) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(
    authStorageKey,
    JSON.stringify(authState),
  );
}

function createInitialDatabase(): MockDatabase {
  const persistedAuth = readPersistedAuth();

  return structuredClone({
    nfts: nftDetailFixtures,
    carts: readPersistedCarts(),
    users: mergeUsers(persistedAuth.users),
    sessions: persistedAuth.sessions,
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

export function saveMockUser(user: MockUserRecord) {
  const userExists = database.users.some(
    (candidate) => candidate.id === user.id,
  );

  database = {
    ...database,
    users: userExists
      ? database.users.map((candidate) =>
          candidate.id === user.id ? user : candidate,
        )
      : [...database.users, user],
  };

  persistAuth({
    users: database.users,
    sessions: database.sessions,
  });
}

export function saveMockSession(
  session: MockSessionRecord,
) {
  database = {
    ...database,
    sessions: {
      ...database.sessions,
      [session.token]: session,
    },
  };

  persistAuth({
    users: database.users,
    sessions: database.sessions,
  });
}

export function removeMockSession(token: string) {
  const nextSessions = { ...database.sessions };

  delete nextSessions[token];

  database = {
    ...database,
    sessions: nextSessions,
  };

  persistAuth({
    users: database.users,
    sessions: database.sessions,
  });
}

export function resetMockDatabase() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(cartsStorageKey);
    localStorage.removeItem(authStorageKey);
  }

  database = createInitialDatabase();
}
