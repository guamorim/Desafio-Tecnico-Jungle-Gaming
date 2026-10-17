import { useState, type ReactNode } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { getCartErrorMessage } from "@/features/cart/cart-error-message";
import { addCartItemMutationOptions } from "@/features/cart/mutations/add-cart-item-mutation";
import { useCartOwnerId } from "@/features/cart/use-cart-owner-id";
import { cn } from "@/lib/utils";

import type { NftEdition } from "../types";

type NftEditionPurchasePanelProps = {
  readonly children?: ReactNode;
  readonly editions: readonly NftEdition[];
  readonly isFavorite: boolean;
  readonly isFavoritePending: boolean;
  readonly nftId: string;
  readonly onEditionChange: (editionId: string) => void;
  readonly onFavorite: () => void;
  readonly selectedEditionId: string;
};

export function NftEditionPurchasePanel({
  children,
  editions,
  isFavorite,
  isFavoritePending,
  nftId,
  onEditionChange,
  onFavorite,
  selectedEditionId,
}: NftEditionPurchasePanelProps) {
  const queryClient = useQueryClient();
  const cartOwnerId = useCartOwnerId();
  const addItemMutation = useMutation(
    addCartItemMutationOptions(
      queryClient,
      cartOwnerId,
    ),
  );
  const initialEdition =
    editions.find(
      (edition) =>
        edition.name === "1/50" &&
        edition.availableQuantity > 0,
    ) ??
    editions.find(
      (edition) => edition.availableQuantity > 0,
    ) ?? editions[0];

  const [quantitySelection, setQuantitySelection] =
    useState({
      editionId: initialEdition?.id ?? "",
      value: initialEdition?.availableQuantity ? 1 : 0,
    });

  const selectedEdition =
    editions.find(
      (edition) => edition.id === selectedEditionId,
    ) ?? initialEdition;

  const purchaseLimit = selectedEdition
    ? Math.min(
        selectedEdition.availableQuantity,
        selectedEdition.maximumPurchaseQuantity,
      )
    : 0;

  const quantity =
    quantitySelection.editionId === selectedEdition?.id
      ? quantitySelection.value
      : selectedEdition?.availableQuantity
        ? 1
        : 0;

  const normalizedQuantity =
    purchaseLimit === 0
      ? 0
      : Math.min(
          Math.max(quantity, 1),
          purchaseLimit,
        );

  if (!selectedEdition) {
    return (
      <p role="alert" className="text-destructive">
        Este NFT não possui edições disponíveis.
      </p>
    );
  }

  const isUnavailable = purchaseLimit === 0;

  return (
    <section
      className="flex flex-col gap-5"
      aria-labelledby="nft-edition-title"
    >
      <fieldset className="order-1 space-y-3">
        <legend
          id="nft-edition-title"
          className="font-semibold"
        >
          Edição:
        </legend>

        <div className="flex flex-wrap gap-2">
          {editions.map((edition) => {
            const isSelected =
              edition.id === selectedEdition.id;
            const isSoldOut =
              edition.availableQuantity === 0;

            return (
              <label
                key={edition.id}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                  "has-focus-visible:ring-2 has-focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/10 font-bold text-primary"
                    : "border-primary/25 text-muted-foreground hover:border-primary/60",
                  isSoldOut && "opacity-65",
                )}
              >
                <input
                  type="radio"
                  name="nft-edition"
                  value={edition.id}
                  checked={isSelected}
                  disabled={cartOwnerId === null}
                  className="sr-only"
                  onChange={() => {
                    addItemMutation.reset();
                    onEditionChange(edition.id);
                    setQuantitySelection({
                      editionId: edition.id,
                      value: isSoldOut ? 0 : 1,
                    });
                  }}
                />

                <span>{edition.name}</span>
                {isSoldOut && (
                  <span className="sr-only"> — esgotada</span>
                )}
              </label>
            );
          })}
        </div>

        <p
          className={cn(
            "text-xs",
            isUnavailable
              ? "font-semibold text-destructive"
              : "text-muted-foreground",
          )}
          role="status"
        >
          {isUnavailable
            ? "Edição indisponível"
            : `${selectedEdition.availableQuantity} unidades disponíveis`}
        </p>
      </fieldset>

      {children && (
        <div className="order-2 md:order-3">
          {children}
        </div>
      )}

      <div className="order-3 rounded-2xl bg-background/25 p-4 md:order-2 md:rounded-none md:bg-transparent md:p-0">
        {!isUnavailable && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Qtd.
                </span>
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Diminuir quantidade"
                  disabled={
                    cartOwnerId === null ||
                    normalizedQuantity <= 1
                  }
                  onClick={() => {
                    addItemMutation.reset();
                    setQuantitySelection({
                      editionId: selectedEdition.id,
                      value: normalizedQuantity - 1,
                    });
                  }}
                >
                  <Minus aria-hidden="true" />
                </Button>

                <output
                  className="min-w-5 text-center font-semibold"
                  aria-live="polite"
                  aria-label={`Quantidade selecionada: ${normalizedQuantity}`}
                >
                  {normalizedQuantity}
                </output>

                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Aumentar quantidade"
                  disabled={
                    cartOwnerId === null ||
                    normalizedQuantity >= purchaseLimit
                  }
                  onClick={() => {
                    addItemMutation.reset();
                    setQuantitySelection({
                      editionId: selectedEdition.id,
                      value: normalizedQuantity + 1,
                    });
                  }}
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>

              <p className="text-xl font-bold text-primary md:text-2xl">
                {selectedEdition.priceEth} ETH
              </p>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Limite de {purchaseLimit} por compra
            </p>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-3 md:flex">
              <Button
                type="button"
                size="lg"
                className="w-full md:max-w-xs"
                disabled={
                  cartOwnerId === null ||
                  addItemMutation.isPending
                }
                onClick={() => {
                  addItemMutation.mutate({
                    nftId,
                    editionId: selectedEdition.id,
                    quantity: normalizedQuantity,
                  });
                }}
              >
                {addItemMutation.isPending
                  ? "Adicionando..."
                  : "Comprar NFT"}
              </Button>

              <Link
                to="/cart"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "icon-lg",
                  }),
                  "rounded-full md:hidden",
                )}
                aria-label="Abrir carrinho"
              >
                <ShoppingCart aria-hidden="true" />
              </Link>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="hidden md:inline-flex"
                aria-label={
                  isFavorite
                    ? "Remover NFT dos favoritos"
                    : "Adicionar NFT aos favoritos"
                }
                aria-pressed={isFavorite}
                disabled={isFavoritePending}
                onClick={onFavorite}
              >
                <Heart
                  aria-hidden="true"
                  className={cn(
                    isFavorite &&
                      "fill-primary text-primary",
                  )}
                />
                {isFavorite
                  ? "Remover favorito"
                  : "Favoritar"}
              </Button>
            </div>
          </>
        )}

        {addItemMutation.isSuccess && (
          <p
            role="status"
            className="mt-3 text-sm font-medium text-primary"
          >
            Item adicionado ao carrinho.
          </p>
        )}

        {addItemMutation.isError && (
          <p
            role="alert"
            className="mt-3 text-sm text-destructive"
          >
            {getCartErrorMessage(
              addItemMutation.error,
              "Não foi possível adicionar o item ao carrinho.",
            )}
          </p>
        )}
      </div>
    </section>
  );
}
