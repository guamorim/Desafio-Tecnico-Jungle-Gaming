import type { MockUserRecord } from "../auth/types";

export const mockUserFixtures = [
  {
    id: "user-ana-sato",
    email: "ana@kurio.test",
    displayName: "Ana Sato",
    username: "ana-sato",
    ensName: "ana-sato.eth",
    walletNickname: "Carteira principal",
    avatarUrl: null,
    version: 1,
    passwordSalt:
      "6f7c59e742bd4ac18e84df460e7db282",
    passwordHash:
      "dda2b12ac5a866f07630e55f1b3286dcfd2186c65e9e48674d2f62d7721080ab",
  },
  {
    id: "user-leo-costa",
    email: "leo@kurio.test",
    displayName: "Leo Costa",
    username: "leo-costa",
    ensName: "leo-costa.eth",
    walletNickname: "Carteira principal",
    avatarUrl: null,
    version: 1,
    passwordSalt:
      "b60a5ea2c77f4c77af18a3d11ec601d9",
    passwordHash:
      "8943ffed9d9b37fcf0b2387b322c660f9b05b9e08436b914fc5de975dfc00cbe",
  },
] as const satisfies readonly MockUserRecord[];
