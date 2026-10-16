import { delay, http, HttpResponse } from "msw";

import type {
  CollectorWallet,
  SaveWalletInput,
  WalletErrorResponse,
  WalletFieldErrors,
  WalletNetwork,
  WalletProvider,
  WalletsResponse,
} from "@/features/wallets/types";
import {
  findAuthenticatedUser,
  readBearerToken,
} from "./auth-handlers";
import {
  getMockDatabase,
  saveMockWallets,
} from "./mock-database";

const walletNetworks: readonly WalletNetwork[] = [
  "ethereum",
  "polygon",
  "solana",
];
const walletProviders: readonly WalletProvider[] = [
  "metamask",
  "walletconnect",
  "coinbase",
];

function readAuthenticatedUserId(request: Request) {
  const token = readBearerToken(request);
  const authenticated = token
    ? findAuthenticatedUser(token)
    : null;

  return authenticated?.user.id ?? null;
}

async function readRequestBody(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}

function isSaveWalletInput(
  value: unknown,
): value is SaveWalletInput {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.label === "string" &&
    walletNetworks.includes(
      input.network as WalletNetwork,
    ) &&
    typeof input.profileName === "string" &&
    typeof input.address === "string" &&
    typeof input.ensName === "string" &&
    walletProviders.includes(
      input.provider as WalletProvider,
    ) &&
    typeof input.referralCode === "string" &&
    typeof input.email === "string" &&
    typeof input.isPrimary === "boolean"
  );
}

function validateWallet(input: SaveWalletInput) {
  const errors: WalletFieldErrors = {};
  const label = input.label.trim();
  const profileName = input.profileName.trim();
  const address = input.address.trim();
  const ensName = input.ensName
    .trim()
    .toLocaleLowerCase("pt-BR");
  const email = input.email.trim();
  const referralCode = input.referralCode.trim();

  if (label.length < 2 || label.length > 40) {
    errors.label =
      "Use um apelido entre 2 e 40 caracteres.";
  }

  if (
    profileName.length < 2 ||
    profileName.length > 60
  ) {
    errors.profileName =
      "Use um nome entre 2 e 60 caracteres.";
  }

  if (
    input.network === "solana"
      ? !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
      : !/^0x[a-fA-F0-9]{40}$/.test(address)
  ) {
    errors.address =
      input.network === "solana"
        ? "Informe um endereço Solana válido."
        : "Informe um endereço hexadecimal com 40 caracteres.";
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

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Informe um e-mail válido.";
  }

  if (
    referralCode !== "" &&
    !/^[a-zA-Z0-9-]{2,32}$/.test(referralCode)
  ) {
    errors.referralCode =
      "Use de 2 a 32 letras, números ou hífens.";
  }

  return errors;
}

function normalizeWalletInput(input: SaveWalletInput) {
  return {
    label: input.label.trim(),
    network: input.network,
    profileName: input.profileName.trim(),
    address: input.address.trim(),
    ensName: input.ensName
      .trim()
      .toLocaleLowerCase("pt-BR"),
    provider: input.provider,
    referralCode: input.referralCode.trim(),
    email: input.email
      .trim()
      .toLocaleLowerCase("pt-BR"),
    isPrimary: input.isPrimary,
  } satisfies SaveWalletInput;
}

function createWalletsResponse(
  wallets: readonly CollectorWallet[],
): WalletsResponse {
  return {
    items: [...wallets].sort(
      (left, right) =>
        Number(right.isPrimary) -
        Number(left.isPrimary),
    ),
  };
}

function addressBelongsToAnotherWallet(
  address: string,
  walletId?: string,
) {
  const normalizedAddress = address.toLocaleLowerCase(
    "en-US",
  );

  return Object.values(getMockDatabase().wallets)
    .flat()
    .some(
      (wallet) =>
        wallet.id !== walletId &&
        wallet.address.toLocaleLowerCase("en-US") ===
          normalizedAddress,
    );
}

export const walletHandlers = [
  http.get("/api/wallets", async ({ request }) => {
    await delay(350);

    const userId = readAuthenticatedUserId(request);

    if (!userId) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      createWalletsResponse(
        getMockDatabase().wallets[userId] ?? [],
      ),
    );
  }),
  http.post("/api/wallets", async ({ request }) => {
    await delay(500);

    const userId = readAuthenticatedUserId(request);

    if (!userId) {
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      );
    }

    const input = await readRequestBody(request);

    if (!isSaveWalletInput(input)) {
      return HttpResponse.json(
        { message: "Dados da carteira inválidos." },
        { status: 400 },
      );
    }

    const fieldErrors = validateWallet(input);

    if (Object.keys(fieldErrors).length > 0) {
      return HttpResponse.json(
        {
          message: "Revise os campos da carteira.",
          fieldErrors,
        } satisfies WalletErrorResponse,
        { status: 422 },
      );
    }

    const database = getMockDatabase();
    const currentWallets = database.wallets[userId] ?? [];

    if (
      currentWallets.some(
        (wallet) =>
          wallet.isPrimary === input.isPrimary,
      )
    ) {
      return HttpResponse.json(
        {
          message: input.isPrimary
            ? "A conta já possui uma carteira principal."
            : "A conta já possui uma carteira secundária.",
        } satisfies WalletErrorResponse,
        { status: 409 },
      );
    }

    if (addressBelongsToAnotherWallet(input.address)) {
      return HttpResponse.json(
        {
          message: "Este endereço já está cadastrado.",
          fieldErrors: {
            address:
              "Este endereço já está cadastrado.",
          },
        } satisfies WalletErrorResponse,
        { status: 409 },
      );
    }

    const wallet = {
      id: `wallet-${crypto.randomUUID()}`,
      ...normalizeWalletInput(input),
      connectionStatus: "disconnected",
      version: 1,
    } satisfies CollectorWallet;

    const nextWallets = [...currentWallets, wallet];

    saveMockWallets(userId, nextWallets);

    return HttpResponse.json(
      createWalletsResponse(nextWallets),
      { status: 201 },
    );
  }),
  http.patch(
    "/api/wallets/:walletId",
    async ({ params, request }) => {
      await delay(500);

      const userId = readAuthenticatedUserId(request);

      if (!userId) {
        return HttpResponse.json(
          { message: "Autenticação necessária." },
          { status: 401 },
        );
      }

      const input = await readRequestBody(request);

      if (!isSaveWalletInput(input)) {
        return HttpResponse.json(
          { message: "Dados da carteira inválidos." },
          { status: 400 },
        );
      }

      const database = getMockDatabase();
      const walletId = String(params.walletId);
      const currentWallets = database.wallets[userId] ?? [];
      const currentWallet = currentWallets.find(
        (wallet) => wallet.id === walletId,
      );

      if (!currentWallet) {
        return HttpResponse.json(
          { message: "Carteira não encontrada." },
          { status: 404 },
        );
      }

      if (currentWallet.isPrimary !== input.isPrimary) {
        return HttpResponse.json(
          {
            message:
              "O tipo principal ou secundário não pode ser alterado.",
          },
          { status: 409 },
        );
      }

      const fieldErrors = validateWallet(input);

      if (Object.keys(fieldErrors).length > 0) {
        return HttpResponse.json(
          {
            message: "Revise os campos da carteira.",
            fieldErrors,
          } satisfies WalletErrorResponse,
          { status: 422 },
        );
      }

      if (
        addressBelongsToAnotherWallet(
          input.address,
          walletId,
        )
      ) {
        return HttpResponse.json(
          {
            message: "Este endereço já está cadastrado.",
            fieldErrors: {
              address:
                "Este endereço já está cadastrado.",
            },
          } satisfies WalletErrorResponse,
          { status: 409 },
        );
      }

      const updatedWallet = {
        ...currentWallet,
        ...normalizeWalletInput(input),
        version: currentWallet.version + 1,
      } satisfies CollectorWallet;
      const nextWallets = currentWallets.map((wallet) =>
        wallet.id === walletId ? updatedWallet : wallet,
      );

      saveMockWallets(userId, nextWallets);

      return HttpResponse.json(
        createWalletsResponse(nextWallets),
      );
    },
  ),
];
