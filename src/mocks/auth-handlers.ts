import { delay, http, HttpResponse } from "msw";

import type {
  AuthErrorResponse,
  AuthFieldErrors,
  AuthSession,
  AuthUser,
  LoginInput,
  RegisterInput,
  SessionResponse,
  UpdateAvatarInput,
  UpdateProfileInput,
} from "@/features/auth/types";
import {
  createPasswordSalt,
  hashPassword,
} from "./auth/password-hash";
import type { MockUserRecord } from "./auth/types";
import {
  getMockDatabase,
  removeMockSession,
  saveMockSession,
  saveMockUser,
} from "./mock-database";

const sessionDurationMs = 60 * 60 * 1000;

function toAuthUser(user: MockUserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    ensName: user.ensName,
    walletNickname: user.walletNickname,
    avatarUrl: user.avatarUrl,
    version: user.version,
  };
}

function createAuthSession(
  user: MockUserRecord,
): AuthSession {
  const token = crypto.randomUUID();
  const sessionRecord = {
    token,
    userId: user.id,
    expiresAt: new Date(
      Date.now() + sessionDurationMs,
    ).toISOString(),
  };

  saveMockSession(sessionRecord);

  return {
    token: sessionRecord.token,
    expiresAt: sessionRecord.expiresAt,
    user: toAuthUser(user),
  };
}

function isLoginInput(
  value: unknown,
): value is LoginInput {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.email === "string" &&
    input.email.trim().length > 0 &&
    typeof input.password === "string" &&
    input.password.length > 0
  );
}

function isRegisterInput(
  value: unknown,
): value is RegisterInput {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.email === "string" &&
    typeof input.displayName === "string" &&
    typeof input.password === "string" &&
    typeof input.passwordConfirmation === "string"
  );
}

function isUpdateProfileInput(
  value: unknown,
): value is UpdateProfileInput {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;
  const optionalPasswordFields = [
    input.currentPassword,
    input.newPassword,
    input.newPasswordConfirmation,
  ];

  return (
    typeof input.displayName === "string" &&
    typeof input.username === "string" &&
    typeof input.email === "string" &&
    typeof input.ensName === "string" &&
    typeof input.walletNickname === "string" &&
    optionalPasswordFields.every(
      (field) =>
        field === undefined ||
        typeof field === "string",
    )
  );
}

function isUpdateAvatarInput(
  value: unknown,
): value is UpdateAvatarInput {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return typeof input.avatarDataUrl === "string";
}

function validateAvatarDataUrl(value: string) {
  const match = value.match(
    /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/,
  );

  if (!match) {
    return "Envie uma imagem PNG, JPEG ou WebP válida.";
  }

  const encodedContent = match[2] ?? "";
  const padding = encodedContent.endsWith("==")
    ? 2
    : encodedContent.endsWith("=")
      ? 1
      : 0;
  const byteLength =
    Math.floor((encodedContent.length * 3) / 4) -
    padding;

  return byteLength <= 1_000_000
    ? null
    : "O avatar deve ter no máximo 1 MB.";
}

function normalizeUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

function createInitialUsername(
  displayName: string,
  email: string,
) {
  const localPart = email.split("@")[0] ?? "";
  const preferredUsername =
    normalizeUsername(displayName) ||
    normalizeUsername(localPart) ||
    "colecionador";
  const existingUsernames = new Set(
    getMockDatabase().users.map(
      (user) => user.username,
    ),
  );

  if (!existingUsernames.has(preferredUsername)) {
    return preferredUsername;
  }

  let suffix = 2;
  let candidate = `${preferredUsername}-${suffix}`;

  while (existingUsernames.has(candidate)) {
    suffix += 1;
    candidate = `${preferredUsername.slice(0, 27)}-${suffix}`;
  }

  return candidate;
}

function validateRegistration(
  input: RegisterInput,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const displayName = input.displayName.trim();
  const email = input.email.trim();

  if (displayName.length < 2) {
    errors.displayName =
      "Informe um nome com pelo menos dois caracteres.";
  }

  if (displayName.length > 60) {
    errors.displayName =
      "O nome pode ter no máximo 60 caracteres.";
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Informe um e-mail válido.";
  }

  if (input.password.length < 8) {
    errors.password =
      "Use pelo menos oito caracteres.";
  } else if (
    !/[a-z]/.test(input.password) ||
    !/[A-Z]/.test(input.password) ||
    !/\d/.test(input.password)
  ) {
    errors.password =
      "Use letras maiúsculas, minúsculas e números.";
  }

  if (
    input.passwordConfirmation !== input.password
  ) {
    errors.passwordConfirmation =
      "As senhas não coincidem.";
  }

  return errors;
}

function validateProfile(
  input: UpdateProfileInput,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const displayName = input.displayName.trim();
  const username = normalizeUsername(input.username);
  const email = input.email.trim();
  const ensName = input.ensName
    .trim()
    .toLocaleLowerCase("pt-BR");
  const walletNickname =
    input.walletNickname.trim();
  const hasPasswordChange = Boolean(
    input.currentPassword ||
      input.newPassword ||
      input.newPasswordConfirmation,
  );

  if (
    displayName.length < 2 ||
    displayName.length > 60
  ) {
    errors.displayName =
      "Use um nome entre 2 e 60 caracteres.";
  }

  if (username.length < 3) {
    errors.username =
      "Use um nome de usuário com pelo menos 3 caracteres.";
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Informe um e-mail válido.";
  }

  if (
    ensName !== "" &&
    !/^[a-z0-9][a-z0-9-]{1,62}\.eth$/.test(
      ensName,
    )
  ) {
    errors.ensName =
      "Use um nome ENS válido terminado em .eth.";
  }

  if (walletNickname.length > 40) {
    errors.walletNickname =
      "O apelido pode ter no máximo 40 caracteres.";
  }

  if (hasPasswordChange) {
    if (!input.currentPassword) {
      errors.currentPassword =
        "Informe sua senha atual.";
    }

    if (!input.newPassword) {
      errors.newPassword =
        "Informe a nova senha.";
    } else if (input.newPassword.length < 8) {
      errors.newPassword =
        "Use pelo menos oito caracteres.";
    } else if (
      !/[a-z]/.test(input.newPassword) ||
      !/[A-Z]/.test(input.newPassword) ||
      !/\d/.test(input.newPassword)
    ) {
      errors.newPassword =
        "Use letras maiúsculas, minúsculas e números.";
    }

    if (
      input.newPasswordConfirmation !==
      input.newPassword
    ) {
      errors.newPasswordConfirmation =
        "As senhas não coincidem.";
    }
  }

  return errors;
}

export function readBearerToken(request: Request) {
  const authorization =
    request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization
    .slice("Bearer ".length)
    .trim();
}

async function readRequestBody(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}

export function findAuthenticatedUser(token: string) {
  const database = getMockDatabase();
  const storedSession = database.sessions[token];

  if (
    !storedSession ||
    Date.parse(storedSession.expiresAt) <= Date.now()
  ) {
    removeMockSession(token);
    return null;
  }

  const user = database.users.find(
    (candidate) =>
      candidate.id === storedSession.userId,
  );

  if (!user) {
    removeMockSession(token);
    return null;
  }

  return { storedSession, user };
}

export const authHandlers = [
  http.post(
    "/api/auth/register",
    async ({ request }) => {
      await delay(500);

      const input = await readRequestBody(request);

      if (!isRegisterInput(input)) {
        return HttpResponse.json(
          {
            message:
              "Os dados do cadastro são inválidos.",
          } satisfies AuthErrorResponse,
          { status: 400 },
        );
      }

      const fieldErrors =
        validateRegistration(input);

      if (Object.keys(fieldErrors).length > 0) {
        return HttpResponse.json(
          {
            message:
              "Revise os campos informados.",
            fieldErrors,
          } satisfies AuthErrorResponse,
          { status: 422 },
        );
      }

      const normalizedEmail = input.email
        .trim()
        .toLocaleLowerCase("pt-BR");
      const emailAlreadyExists =
        getMockDatabase().users.some(
          (user) =>
            user.email === normalizedEmail,
        );

      if (emailAlreadyExists) {
        return HttpResponse.json(
          {
            message:
              "Este e-mail já está cadastrado.",
            fieldErrors: {
              email: "Este e-mail já está em uso.",
            },
          } satisfies AuthErrorResponse,
          { status: 409 },
        );
      }

      const passwordSalt = createPasswordSalt();
      const passwordHash = await hashPassword(
        input.password,
        passwordSalt,
      );
      const user = {
        id: `user-${crypto.randomUUID()}`,
        email: normalizedEmail,
        displayName: input.displayName.trim(),
        username: createInitialUsername(
          input.displayName,
          normalizedEmail,
        ),
        ensName: "",
        walletNickname: "",
        avatarUrl: null,
        passwordSalt,
        passwordHash,
        version: 1,
      } satisfies MockUserRecord;

      saveMockUser(user);

      return HttpResponse.json(
        {
          session: createAuthSession(user),
        } satisfies SessionResponse,
        { status: 201 },
      );
    },
  ),
  http.post(
    "/api/auth/login",
    async ({ request }) => {
      await delay(400);

      const input = await readRequestBody(request);

      if (!isLoginInput(input)) {
        return HttpResponse.json(
          {
            message:
              "Informe um e-mail e uma senha válidos.",
          },
          { status: 400 },
        );
      }

      const normalizedEmail = input.email
        .trim()
        .toLocaleLowerCase("pt-BR");
      const user = getMockDatabase().users.find(
        (candidate) =>
          candidate.email === normalizedEmail,
      );
      const submittedPasswordHash = user
        ? await hashPassword(
            input.password,
            user.passwordSalt,
          )
        : null;

      if (
        !user ||
        submittedPasswordHash !== user.passwordHash
      ) {
        return HttpResponse.json(
          {
            message:
              "E-mail ou senha incorretos.",
          },
          { status: 401 },
        );
      }

      return HttpResponse.json({
        session: createAuthSession(user),
      } satisfies SessionResponse);
    },
  ),
  http.get(
    "/api/auth/session",
    async ({ request }) => {
      await delay(250);

      const token = readBearerToken(request);

      if (!token) {
        return HttpResponse.json({
          session: null,
        } satisfies SessionResponse);
      }

      const database = getMockDatabase();
      const storedSession =
        database.sessions[token];

      if (
        !storedSession ||
        Date.parse(storedSession.expiresAt) <=
          Date.now()
      ) {
        removeMockSession(token);

        return HttpResponse.json(
          {
            message:
              "Sessão inválida ou expirada.",
          },
          { status: 401 },
        );
      }

      const user = database.users.find(
        (candidate) =>
          candidate.id === storedSession.userId,
      );

      if (!user) {
        removeMockSession(token);

        return HttpResponse.json(
          {
            message:
              "Usuário da sessão não encontrado.",
          },
          { status: 401 },
        );
      }

      return HttpResponse.json({
        session: {
          token,
          expiresAt: storedSession.expiresAt,
          user: toAuthUser(user),
        },
      } satisfies SessionResponse);
    },
  ),
  http.patch(
    "/api/auth/profile",
    async ({ request }) => {
      await delay(500);

      const token = readBearerToken(request);
      const authenticated = token
        ? findAuthenticatedUser(token)
        : null;

      if (!token || !authenticated) {
        return HttpResponse.json(
          { message: "Autenticação necessária." },
          { status: 401 },
        );
      }

      const input = await readRequestBody(request);

      if (!isUpdateProfileInput(input)) {
        return HttpResponse.json(
          {
            message: "Dados do perfil inválidos.",
          } satisfies AuthErrorResponse,
          { status: 400 },
        );
      }

      const fieldErrors = validateProfile(input);

      if (Object.keys(fieldErrors).length > 0) {
        return HttpResponse.json(
          {
            message:
              "Revise os campos informados.",
            fieldErrors,
          } satisfies AuthErrorResponse,
          { status: 422 },
        );
      }

      const database = getMockDatabase();
      const normalizedEmail = input.email
        .trim()
        .toLocaleLowerCase("pt-BR");
      const normalizedUsername =
        normalizeUsername(input.username);
      const emailAlreadyExists = database.users.some(
        (user) =>
          user.id !== authenticated.user.id &&
          user.email === normalizedEmail,
      );
      const usernameAlreadyExists =
        database.users.some(
          (user) =>
            user.id !== authenticated.user.id &&
            user.username === normalizedUsername,
        );

      if (emailAlreadyExists) {
        fieldErrors.email =
          "Este e-mail já está em uso.";
      }

      if (usernameAlreadyExists) {
        fieldErrors.username =
          "Este nome de usuário já está em uso.";
      }

      if (Object.keys(fieldErrors).length > 0) {
        return HttpResponse.json(
          {
            message:
              "Alguns dados já pertencem a outra conta.",
            fieldErrors,
          } satisfies AuthErrorResponse,
          { status: 409 },
        );
      }

      let passwordSalt =
        authenticated.user.passwordSalt;
      let passwordHash =
        authenticated.user.passwordHash;

      if (input.newPassword) {
        const currentPasswordHash =
          await hashPassword(
            input.currentPassword ?? "",
            authenticated.user.passwordSalt,
          );

        if (
          currentPasswordHash !==
          authenticated.user.passwordHash
        ) {
          return HttpResponse.json(
            {
              message:
                "A senha atual está incorreta.",
              fieldErrors: {
                currentPassword:
                  "A senha atual está incorreta.",
              },
            } satisfies AuthErrorResponse,
            { status: 422 },
          );
        }

        passwordSalt = createPasswordSalt();
        passwordHash = await hashPassword(
          input.newPassword,
          passwordSalt,
        );
      }

      const nextUser = {
        ...authenticated.user,
        email: normalizedEmail,
        displayName: input.displayName.trim(),
        username: normalizedUsername,
        ensName: input.ensName
          .trim()
          .toLocaleLowerCase("pt-BR"),
        walletNickname:
          input.walletNickname.trim(),
        passwordSalt,
        passwordHash,
        version: authenticated.user.version + 1,
      } satisfies MockUserRecord;

      saveMockUser(nextUser);

      return HttpResponse.json({
        session: {
          token,
          expiresAt:
            authenticated.storedSession.expiresAt,
          user: toAuthUser(nextUser),
        },
      } satisfies SessionResponse);
    },
  ),
  http.patch(
    "/api/auth/profile/avatar",
    async ({ request }) => {
      await delay(450);

      const token = readBearerToken(request);
      const authenticated = token
        ? findAuthenticatedUser(token)
        : null;

      if (!token || !authenticated) {
        return HttpResponse.json(
          { message: "Autenticação necessária." },
          { status: 401 },
        );
      }

      const input = await readRequestBody(request);

      if (!isUpdateAvatarInput(input)) {
        return HttpResponse.json(
          { message: "Avatar inválido." },
          { status: 400 },
        );
      }

      const validationError = validateAvatarDataUrl(
        input.avatarDataUrl,
      );

      if (validationError) {
        return HttpResponse.json(
          { message: validationError },
          { status: 422 },
        );
      }

      const nextUser = {
        ...authenticated.user,
        avatarUrl: input.avatarDataUrl,
        version: authenticated.user.version + 1,
      } satisfies MockUserRecord;

      saveMockUser(nextUser);

      return HttpResponse.json({
        session: {
          token,
          expiresAt:
            authenticated.storedSession.expiresAt,
          user: toAuthUser(nextUser),
        },
      } satisfies SessionResponse);
    },
  ),
  http.delete(
    "/api/auth/profile/avatar",
    async ({ request }) => {
      await delay(350);

      const token = readBearerToken(request);
      const authenticated = token
        ? findAuthenticatedUser(token)
        : null;

      if (!token || !authenticated) {
        return HttpResponse.json(
          { message: "Autenticação necessária." },
          { status: 401 },
        );
      }

      const nextUser = {
        ...authenticated.user,
        avatarUrl: null,
        version: authenticated.user.version + 1,
      } satisfies MockUserRecord;

      saveMockUser(nextUser);

      return HttpResponse.json({
        session: {
          token,
          expiresAt:
            authenticated.storedSession.expiresAt,
          user: toAuthUser(nextUser),
        },
      } satisfies SessionResponse);
    },
  ),
  http.post(
    "/api/auth/logout",
    async ({ request }) => {
      await delay(250);

      const token = readBearerToken(request);

      if (token) {
        removeMockSession(token);
      }

      return new HttpResponse(null, {
        status: 204,
      });
    },
  ),
];
