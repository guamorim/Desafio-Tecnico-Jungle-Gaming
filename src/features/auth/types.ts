export type AuthUser = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly username: string;
  readonly ensName: string;
  readonly walletNickname: string;
  readonly avatarUrl: string | null;
  readonly version: number;
};

export type AuthSession = {
  readonly token: string;
  readonly expiresAt: string;
  readonly user: AuthUser;
};

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

export type RegisterInput = {
  readonly email: string;
  readonly displayName: string;
  readonly password: string;
  readonly passwordConfirmation: string;
};

export type UpdateProfileInput = {
  readonly displayName: string;
  readonly username: string;
  readonly email: string;
  readonly ensName: string;
  readonly walletNickname: string;
  readonly currentPassword?: string;
  readonly newPassword?: string;
  readonly newPasswordConfirmation?: string;
};

export type UpdateAvatarInput = {
  readonly avatarDataUrl: string;
};

type AuthFieldName =
  | keyof RegisterInput
  | keyof UpdateProfileInput;

export type AuthFieldErrors = Partial<
  Record<AuthFieldName, string>
>;

export type AuthErrorResponse = {
  readonly message: string;
  readonly fieldErrors?: AuthFieldErrors;
};

export type SessionResponse = {
  readonly session: AuthSession | null;
};
