import type { AuthUser } from "@/features/auth/types";

export type MockUserRecord = AuthUser & {
  readonly passwordSalt: string;
  readonly passwordHash: string;
};

export type MockSessionRecord = {
  readonly token: string;
  readonly userId: string;
  readonly expiresAt: string;
};
