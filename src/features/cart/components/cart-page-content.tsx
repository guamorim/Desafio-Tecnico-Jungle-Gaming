import { Link } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getCartErrorMessage } from "../cart-error-message";
import { calculateEthTotal } from "../cart-totals";
import { clearCartMutationOptions } from "../mutations/clear-cart-mutation";
import { removeCartItemMutationOptions } from "../mutations/remove-cart-item-mutation";
import { updateCartItemMutationOptions } from "../mutations/update-cart-item-mutation";
import type { CartResponse } from "../types";

type CartPageContentProps = {
  readonly cart: CartResponse;
};

export function CartPageContent({
  cart,
}: CartPageContentProps) {
  const queryClient = useQueryClient();
  const updateItemMutation = useMutation(
    updateCartItemMutationOptions(queryClient),
  );
  const removeItemMutation = useMutation(
    removeCartItemMutationOptions(queryClient),
  );
  const clearCartMutation = useMutation(
    clearCartMutationOptions(queryClient),
  );
  const networkFeeEth = "0.016";
  const totalEth = calculateEthTotal([
    {
      priceEth: cart.subtotalEth,
      quantity: 1,
    },
    {
      priceEth: networkFeeEth,
      quantity: 1,
    },
  ]);
  const mutationError =
    updateItemMutation.error ??
    removeItemMutation.error ??
    clearCartMutation.error;
  const isMutating =
    updateItemMutation.isPending ||
    removeItemMutation.isPending ||
    clearCartMutation.isPending;

  function resetMutations() {
    updateItemMutation.reset();
    removeItemMutation.reset();
    clearCartMutation.reset();
  }

  function updateQuantity(
    itemId: string,
    quantity: number,
  ) {
    resetMutations();
    updateItemMutation.mutate({ itemId, quantity });
  }

  function removeItem(itemId: string) {
    resetMutations();
    removeItemMutation.mutate(itemId);
  }

  return (
    <div className="grid items-start overflow-hidden rounded-3xl bg-card md:grid-cols-[minmax(0,1fr)_20rem] md:gap-10 md:overflow-visible md:rounded-none md:bg-transparent lg:gap-16">
      <section
        className="p-3 md:p-0"
        aria-labelledby="cart-items-title"
      >
        <div className="mb-3 flex items-end justify-between pb-2 md:border-b md:pb-3">
          <h2
            id="cart-items-title"
            className="sr-only text-xl font-bold md:not-sr-only"
          >
            NFTs
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <p className="hidden text-sm text-muted-foreground md:block">
              {cart.totalQuantity} unidades
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-destructive"
              disabled={isMutating}
              onClick={() => {
                resetMutations();
                clearCartMutation.mutate();
              }}
            >
              {clearCartMutation.isPending
                ? "Limpando..."
                : "Limpar carrinho"}
            </Button>
          </div>
        </div>

        {mutationError && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {getCartErrorMessage(
              mutationError,
              "Não foi possível atualizar o carrinho.",
            )}
          </p>
        )}

        <div className="hidden grid-cols-[minmax(0,1.6fr)_0.7fr_0.7fr_0.7fr_auto] gap-4 px-4 pb-2 text-sm font-bold md:grid">
          <span>NFT</span>
          <span>Preço</span>
          <span>Edição</span>
          <span>Total</span>
          <span className="sr-only">Remover</span>
        </div>

        <ul className="space-y-3">
          {cart.items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl bg-background/40 md:grid md:grid-cols-[minmax(0,1.6fr)_0.7fr_0.7fr_0.7fr_auto] md:items-center md:gap-4 md:bg-card md:p-4"
            >
              <div className="flex min-w-0 items-center md:contents">
                <Link
                  to="/nfts/$nftId"
                  params={{ nftId: item.nftId }}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring md:gap-4"
                >
                  <img
                    src={item.nft.imageUrl}
                    alt=""
                    className="size-24 shrink-0 rounded-l-xl object-cover md:size-20 md:rounded-lg"
                  />
                  <span className="min-w-0 py-2 md:py-0">
                    <strong className="block truncate text-sm md:text-base">
                      {item.nft.name}
                    </strong>
                    <span className="block truncate text-xs text-muted-foreground md:hidden">
                      Edição: {item.edition.name}
                    </span>
                    <span className="hidden truncate text-sm text-muted-foreground md:block">
                      {item.nft.collectionName}
                    </span>
                    <span className="mt-1 block text-sm font-bold text-primary md:hidden">
                      {item.lineTotalEth} ETH
                    </span>
                  </span>
                </Link>

                <div className="shrink-0 px-3 md:hidden">
                  <QuantityControl
                    quantity={item.quantity}
                    maximumQuantity={Math.min(
                      item.edition.availableQuantity,
                      item.edition.maximumPurchaseQuantity,
                    )}
                    disabled={isMutating}
                    onDecrease={() => {
                      if (item.quantity === 1) {
                        removeItem(item.id);
                        return;
                      }

                      updateQuantity(
                        item.id,
                        item.quantity - 1,
                      );
                    }}
                    onIncrease={() => {
                      updateQuantity(
                        item.id,
                        item.quantity + 1,
                      );
                    }}
                  />
                </div>
              </div>

              <CartValue
                value={`${item.edition.priceEth} ETH`}
              />
              <div className="hidden md:block">
                <QuantityControl
                  quantity={item.quantity}
                  maximumQuantity={Math.min(
                    item.edition.availableQuantity,
                    item.edition.maximumPurchaseQuantity,
                  )}
                  disabled={isMutating}
                  onDecrease={() => {
                    if (item.quantity === 1) {
                      removeItem(item.id);
                      return;
                    }

                    updateQuantity(
                      item.id,
                      item.quantity - 1,
                    );
                  }}
                  onIncrease={() => {
                    updateQuantity(
                      item.id,
                      item.quantity + 1,
                    );
                  }}
                />
              </div>
              <CartValue
                value={`${item.lineTotalEth} ETH`}
                emphasized
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hidden text-muted-foreground hover:text-destructive md:inline-flex"
                disabled={isMutating}
                aria-label={`Remover ${item.nft.name} do carrinho`}
                onClick={() => removeItem(item.id)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <aside
        className="border-t p-6 md:sticky md:top-6 md:rounded-xl md:border md:bg-card"
        aria-labelledby="cart-summary-title"
      >
        <h2
          id="cart-summary-title"
          className="border-b pb-4 text-xl font-bold"
        >
          Resumo da carteira
        </h2>

        <form
          className="flex py-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <label
            htmlFor="promotional-code"
            className="sr-only"
          >
            Código promocional
          </label>
          <input
            id="promotional-code"
            name="promotionalCode"
            type="text"
            placeholder="Digite o código promocional..."
            autoComplete="off"
            className="min-w-0 flex-1 rounded-l-full border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring md:rounded-l-md"
          />
          <Button
            type="submit"
            className="rounded-l-none rounded-r-full px-5 md:rounded-r-md"
            disabled
            title="Códigos promocionais disponíveis em breve"
          >
            Aplicar
          </Button>
        </form>

        <dl className="space-y-4 pb-6">
          <div className="flex items-center justify-between gap-4">
            <dt>Subtotal</dt>
            <dd>{cart.subtotalEth} ETH</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Desconto do lançamento</dt>
            <dd>(-) 0.00</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt>Taxa de rede</dt>
            <dd className="text-right">
              <span className="block">
                {networkFeeEth} ETH
              </span>
              <span className="text-xs text-primary">
                Taxa estimada
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t pt-4 text-lg font-bold">
            <dt>Total</dt>
            <dd className="text-primary">
              {totalEth} ETH
            </dd>
          </div>
        </dl>

        <Button
          type="button"
          className="w-full"
          disabled
          title="Checkout disponível em breve"
        >
          Conectar e finalizar
        </Button>

        <Link
          to="/"
          search={{}}
          hash="catalog"
          className="mt-4 block rounded-md text-center text-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          Continuar explorando
        </Link>
      </aside>
    </div>
  );
}

type CartValueProps = {
  readonly emphasized?: boolean;
  readonly value: string;
};

function CartValue({
  emphasized = false,
  value,
}: CartValueProps) {
  return (
    <p className="hidden md:block">
      <span
        className={
          emphasized
            ? "font-bold text-primary"
            : "text-muted-foreground"
        }
      >
        {value}
      </span>
    </p>
  );
}

type QuantityControlProps = {
  readonly disabled: boolean;
  readonly maximumQuantity: number;
  readonly onDecrease: () => void;
  readonly onIncrease: () => void;
  readonly quantity: number;
};

function QuantityControl({
  disabled,
  maximumQuantity,
  onDecrease,
  onIncrease,
  quantity,
}: QuantityControlProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      aria-label={`Quantidade: ${quantity}`}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        className="rounded-full"
        disabled={disabled}
        aria-label={
          quantity === 1
            ? "Remover item"
            : "Diminuir quantidade"
        }
        onClick={onDecrease}
      >
        <Minus aria-hidden="true" />
      </Button>
      <output
        className="min-w-4 text-center text-sm"
        aria-live="polite"
      >
        {quantity}
      </output>
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        className="rounded-full"
        disabled={
          disabled || quantity >= maximumQuantity
        }
        aria-label="Aumentar quantidade"
        onClick={onIncrease}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
