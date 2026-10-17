import {
  useState,
  type FormEvent,
} from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Check,
  CircleAlert,
  Link2,
  Unplug,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/features/auth/types";
import type { CartResponse } from "@/features/cart/types";
import { cartQueryKey } from "@/features/cart/queries/cart-query";
import { createOrderMutationOptions } from "../mutations/create-order-mutation";
import { getOrderErrorResponse } from "../order-error";
import type {
  CheckoutScenario,
  OrderFieldErrors,
} from "../types";
import {
  connectWalletMutationOptions,
  disconnectWalletMutationOptions,
} from "@/features/wallets/mutations/wallet-connection-mutation";
import type {
  CollectorWallet,
  WalletNetwork,
  WalletProvider,
  WalletsResponse,
} from "@/features/wallets/types";
import {
  walletNetworkOptions,
  walletProviderOptions,
} from "@/features/wallets/types";
import { getWalletErrorResponse } from "@/features/wallets/wallet-error";
import { useRealtime } from "@/features/realtime/use-realtime";

type CheckoutPageContentProps = {
  readonly cart: CartResponse;
  readonly scenario: CheckoutScenario;
  readonly user: AuthUser;
  readonly wallets: WalletsResponse;
  readonly onOrderCreated: (orderId: string) => void;
};

type CheckoutFieldProps = {
  readonly error?: string;
  readonly id: string;
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly required?: boolean;
  readonly type?: "email" | "text";
  readonly value: string;
};

const fieldClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

function CheckoutField({
  error,
  id,
  label,
  onChange,
  required = false,
  type = "text",
  value,
}: CheckoutFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold">
        {label}
        {required && (
          <span className="text-primary" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={fieldClassName}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function compatibleNetworks(wallet: CollectorWallet) {
  return wallet.address.startsWith("0x")
    ? walletNetworkOptions.filter(
        (network) => network.value !== "solana",
      )
    : walletNetworkOptions.filter(
        (network) => network.value === "solana",
      );
}

export function CheckoutPageContent({
  cart,
  onOrderCreated,
  scenario,
  user,
  wallets,
}: CheckoutPageContentProps) {
  const queryClient = useQueryClient();
  const { connectionStatus, lastNftUpdate } = useRealtime();
  const [reviewedRealtimeEventId, setReviewedRealtimeEventId] =
    useState<string | null>(null);
  const [serverRequiresReview, setServerRequiresReview] =
    useState(false);
  const initialWallet =
    wallets.items.find((wallet) => wallet.isPrimary) ??
    wallets.items[0];
  const [selectedWalletId, setSelectedWalletId] =
    useState(initialWallet?.id ?? "");
  const selectedWallet = wallets.items.find(
    (wallet) => wallet.id === selectedWalletId,
  );
  const [network, setNetwork] = useState<WalletNetwork>(
    initialWallet?.network ?? "ethereum",
  );
  const [provider, setProvider] =
    useState<WalletProvider>(
      initialWallet?.provider ?? "metamask",
    );
  const [displayName, setDisplayName] = useState(
    user.displayName,
  );
  const [username, setUsername] = useState(user.username);
  const [profileName, setProfileName] = useState(
    initialWallet?.profileName ?? user.displayName,
  );
  const [email, setEmail] = useState(
    initialWallet?.email ?? user.email,
  );
  const [ensName, setEnsName] = useState(
    initialWallet?.ensName ?? user.ensName,
  );
  const [idempotencyKey, setIdempotencyKey] = useState(
    () => crypto.randomUUID(),
  );
  const connectMutation = useMutation(
    connectWalletMutationOptions(queryClient, user.id),
  );
  const disconnectMutation = useMutation(
    disconnectWalletMutationOptions(queryClient, user.id),
  );
  const createOrderMutation = useMutation(
    createOrderMutationOptions(queryClient, user.id),
  );
  const orderError = getOrderErrorResponse(
    createOrderMutation.error,
  );
  const fieldErrors: OrderFieldErrors | undefined =
    orderError?.fieldErrors;
  const connectionError = getWalletErrorResponse(
    connectMutation.error ?? disconnectMutation.error,
  );
  const isConnected = Boolean(
    selectedWallet?.connectionStatus === "connected" &&
      selectedWallet.network === network &&
      selectedWallet.provider === provider,
  );
  const isConnecting =
    connectMutation.isPending ||
    disconnectMutation.isPending;
  const affectedCartItem = lastNftUpdate
    ? cart.items.find(
        (item) =>
          item.nftId === lastNftUpdate.nftId &&
          item.editionId === lastNftUpdate.edition.id,
      )
    : undefined;
  const realtimeReviewRequired = Boolean(
    lastNftUpdate &&
      affectedCartItem &&
      lastNftUpdate.eventId !== reviewedRealtimeEventId,
  );
  const realtimeQuoteIsApplied = Boolean(
    lastNftUpdate &&
      affectedCartItem &&
      affectedCartItem.edition.version >=
        lastNftUpdate.edition.version,
  );
  const quoteNeedsReview =
    realtimeReviewRequired || serverRequiresReview;

  function prepareNewAttempt() {
    createOrderMutation.reset();
    setIdempotencyKey(crypto.randomUUID());
  }

  function selectWallet(wallet: CollectorWallet) {
    setSelectedWalletId(wallet.id);
    setNetwork(wallet.network);
    setProvider(wallet.provider);
    setProfileName(wallet.profileName);
    setEmail(wallet.email);
    setEnsName(wallet.ensName);
    connectMutation.reset();
    disconnectMutation.reset();
    prepareNewAttempt();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedWallet || !isConnected) {
      return;
    }

    createOrderMutation.mutate(
      {
        idempotencyKey,
        input: {
          collector: {
            displayName,
            username,
            profileName,
            email,
            ensName,
          },
          walletId: selectedWallet.id,
          network,
          provider,
          expectedCartVersion: cart.version,
          expectedTotalEth: cart.totalEth,
          scenario,
        },
      },
      {
        onSuccess: (order) => {
          onOrderCreated(order.id);
        },
        onError: (error) => {
          const response = getOrderErrorResponse(error);

          if (response?.code === "QUOTE_CHANGED") {
            setServerRequiresReview(true);
            void queryClient.invalidateQueries({
              queryKey: cartQueryKey(cart.ownerId),
              exact: true,
            });
            setIdempotencyKey(crypto.randomUUID());
          }
        },
      },
    );
  }

  return (
    <form
      className="grid items-start gap-8 pb-16 md:grid-cols-[minmax(0,1fr)_22rem] md:gap-14 md:pb-24"
      onSubmit={handleSubmit}
    >
      <div className="space-y-8">
        <section
          aria-labelledby="collector-title"
          className="hidden md:block"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-primary md:hidden">
                Pagamento seguro
              </p>
              <h1 id="collector-title" className="text-xl font-bold">
                Perfil do colecionador
              </h1>
            </div>
            {isConnected && (
              <span className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
                <Check className="size-3" aria-hidden="true" />
                Carteira conectada
              </span>
            )}
          </div>

          <div className="grid gap-4 rounded-2xl border bg-card p-4 md:grid-cols-2 md:rounded-none md:border-0 md:bg-transparent md:p-0">
            <CheckoutField
              id="checkout-display-name"
              label="Nome de exibição"
              required
              value={displayName}
              error={fieldErrors?.displayName}
              onChange={(value) => {
                setDisplayName(value);
                prepareNewAttempt();
              }}
            />
            <CheckoutField
              id="checkout-username"
              label="Nome de usuário"
              required
              value={username}
              error={fieldErrors?.username}
              onChange={(value) => {
                setUsername(value);
                prepareNewAttempt();
              }}
            />
            <CheckoutField
              id="checkout-profile-name"
              label="Nome do perfil"
              required
              value={profileName}
              error={fieldErrors?.profileName}
              onChange={(value) => {
                setProfileName(value);
                prepareNewAttempt();
              }}
            />
            <CheckoutField
              id="checkout-email"
              label="E-mail"
              type="email"
              required
              value={email}
              error={fieldErrors?.email}
              onChange={(value) => {
                setEmail(value);
                prepareNewAttempt();
              }}
            />
            <CheckoutField
              id="checkout-ens"
              label="Nome ENS (opcional)"
              value={ensName}
              error={fieldErrors?.ensName}
              onChange={(value) => {
                setEnsName(value);
                prepareNewAttempt();
              }}
            />
          </div>
        </section>

        <section
          aria-labelledby="wallet-selection-title"
          className="rounded-3xl border bg-card p-4 md:rounded-none md:border-0 md:bg-transparent md:p-0"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2
              id="wallet-selection-title"
              className="font-bold"
            >
              Carteira e rede
            </h2>
            {isConnected && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[0.6875rem] text-primary md:hidden">
                Carteira conectada
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {wallets.items.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                aria-pressed={wallet.id === selectedWalletId}
                className={`rounded-2xl border p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${wallet.id === selectedWalletId ? "border-primary bg-primary/10" : "bg-card hover:border-primary/60"}`}
                onClick={() => selectWallet(wallet)}
              >
                <span className="flex items-center justify-between gap-3">
                  <strong>{wallet.label}</strong>
                  {wallet.isPrimary && (
                    <span className="text-xs text-primary">Principal</span>
                  )}
                </span>
                <span className="mt-2 block truncate text-xs text-muted-foreground">
                  {wallet.address}
                </span>
              </button>
            ))}
          </div>

          {selectedWallet && (
            <div className="mt-5 grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="checkout-network" className="text-xs font-bold">
                  Rede
                </label>
                <select
                  id="checkout-network"
                  className={fieldClassName}
                  value={network}
                  disabled={isConnecting || isConnected}
                  onChange={(event) => {
                    setNetwork(event.currentTarget.value as WalletNetwork);
                    prepareNewAttempt();
                  }}
                >
                  {compatibleNetworks(selectedWallet).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="checkout-provider" className="text-xs font-bold">
                  Conector
                </label>
                <select
                  id="checkout-provider"
                  className={fieldClassName}
                  value={provider}
                  disabled={isConnecting || isConnected}
                  onChange={(event) => {
                    setProvider(event.currentTarget.value as WalletProvider);
                    prepareNewAttempt();
                  }}
                >
                  {walletProviderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                {isConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isConnecting}
                    onClick={() => {
                      disconnectMutation.mutate(selectedWallet.id);
                    }}
                  >
                    <Unplug aria-hidden="true" />
                    {disconnectMutation.isPending
                      ? "Desconectando..."
                      : "Desconectar carteira"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full"
                    disabled={isConnecting}
                    onClick={() => {
                      connectMutation.reset();
                      connectMutation.mutate({
                        walletId: selectedWallet.id,
                        input: {
                          network,
                          provider,
                          scenario:
                            scenario === "wallet-rejected"
                              ? "rejected"
                              : "success",
                        },
                      });
                    }}
                  >
                    <Link2 aria-hidden="true" />
                    {connectMutation.isPending
                      ? "Conectando..."
                      : "Conectar carteira"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {connectionError && (
            <p role="alert" className="mt-3 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {connectionError.message}
            </p>
          )}
        </section>
      </div>

      <aside className="rounded-3xl border bg-card p-5 md:sticky md:top-6 md:rounded-xl" aria-labelledby="checkout-summary-title">
        <div className="mb-4 hidden items-center gap-2 md:flex">
          <WalletCards className="size-5 text-primary" aria-hidden="true" />
          <h2 id="checkout-summary-title" className="text-lg font-bold">
            Seus NFTs
          </h2>
        </div>

        <ul className="hidden space-y-3 border-b pb-5 md:block">
          {cart.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <img src={item.nft.imageUrl} alt="" className="size-12 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-xs">
                  {item.nft.name}
                </strong>
                <span className="block text-[0.6875rem] text-muted-foreground">
                  {item.edition.name} × {item.quantity}
                </span>
              </span>
              <span className="text-xs font-bold text-primary">
                {item.lineTotalEth} ETH
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-3 py-5 text-sm">
          <div className="flex justify-between gap-3">
            <dt>Subtotal</dt>
            <dd>{cart.subtotalEth} ETH</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Desconto</dt>
            <dd>(-) {cart.discountEth} ETH</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Taxa de rede</dt>
            <dd>{cart.networkFeeEth} ETH</dd>
          </div>
          <div className="flex justify-between gap-3 border-t pt-3 text-base font-bold">
            <dt>Total</dt>
            <dd className="text-primary">{cart.totalEth} ETH</dd>
          </div>
        </dl>

        {createOrderMutation.isError && (
          <p role="alert" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs">
            {orderError?.message ??
              "Não foi possível enviar o pedido. Tente novamente; a compra não será duplicada."}
          </p>
        )}

        {quoteNeedsReview && (
          <div
            role="alert"
            className="mb-4 space-y-3 rounded-lg border border-primary/50 bg-primary/10 p-3 text-xs"
          >
            <p>
              A cotação mudou enquanto o pagamento estava aberto. Revise os novos valores antes de confirmar.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                createOrderMutation.reset();
                setServerRequiresReview(false);
                setReviewedRealtimeEventId(
                  lastNftUpdate?.eventId ?? null,
                );
                setIdempotencyKey(crypto.randomUUID());
              }}
              disabled={
                realtimeReviewRequired &&
                !realtimeQuoteIsApplied
              }
            >
              {realtimeReviewRequired &&
              !realtimeQuoteIsApplied
                ? "Atualizando cotação..."
                : "Revisar novos valores"}
            </Button>
          </div>
        )}

        {connectionStatus === "disconnected" && (
          <p role="status" className="mb-4 text-xs text-muted-foreground">
            Reconectando ao serviço em tempo real e conferindo a cotação pela API…
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-full md:rounded-lg"
          disabled={
            !isConnected ||
            quoteNeedsReview ||
            createOrderMutation.isPending
          }
        >
          {createOrderMutation.isPending
            ? "Enviando pedido..."
            : "Confirmar compra"}
        </Button>
        {!isConnected && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Conecte a carteira para continuar.
          </p>
        )}
      </aside>
    </form>
  );
}
