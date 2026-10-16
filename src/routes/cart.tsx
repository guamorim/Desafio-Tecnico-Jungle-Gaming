import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  createFileRoute,
} from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { DesktopDetailHeader } from "@/components/layout/desktop-detail-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { CartEmptyState } from "@/features/cart/components/cart-empty-state";
import { CartPageContent } from "@/features/cart/components/cart-page-content";
import { CartPageSkeleton } from "@/features/cart/components/cart-page-skeleton";
import { CartRecommendations } from "@/features/cart/components/cart-recommendations";
import { getGuestOwnerId } from "@/features/cart/guest-owner";
import { cartQueryOptions } from "@/features/cart/queries/cart-query";
import { nftListQueryOptions } from "@/features/nfts/queries/nft-list-query";
import { restoreMocking } from "@/mocks/enable-mocking";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const [cartOwnerId] = useState(getGuestOwnerId);
  const {
    data: cart,
    isPending,
    refetch,
  } = useQuery(cartQueryOptions(cartOwnerId));
  const {
    data: catalog,
    isPending: areRecommendationsPending,
  } = useQuery(nftListQueryOptions());

  const cartNftIds = new Set(
    cart?.items.map((item) => item.nftId),
  );
  const recommendations =
    catalog?.items
      .filter((nft) => !cartNftIds.has(nft.id))
      .slice(0, 5) ?? [];

  let content;

  if (isPending) {
    content = <CartPageSkeleton />;
  } else if (!cart) {
    content = (
      <section className="grid min-h-[55svh] place-items-center py-16 text-center">
        <div className="max-w-md space-y-5">
          <h2 className="text-3xl font-bold tracking-tight">
            Não foi possível carregar o carrinho
          </h2>
          <p className="text-muted-foreground">
            Restaure a conexão com a API simulada e tente novamente.
          </p>
          <Button
            type="button"
            onClick={() => {
              void restoreMocking().then(() => refetch());
            }}
          >
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  } else if (cart.items.length === 0) {
    content = <CartEmptyState />;
  } else {
    content = <CartPageContent cart={cart} />;
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <DesktopDetailHeader
        cartItemCount={cart?.totalQuantity ?? 0}
      />

      <PageContainer>
        <header className="relative flex items-center justify-center py-6 md:sr-only">
          <Link
            to="/"
            search={{}}
            className="absolute left-0 grid size-9 place-items-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Voltar ao mercado"
          >
            <ChevronLeft
              className="size-4"
              aria-hidden="true"
            />
          </Link>
          <h1 className="font-bold">Carrinho de NFTs</h1>
        </header>

        <nav
          aria-label="Navegação estrutural"
          className="hidden flex-wrap items-center gap-2 py-6 text-sm font-bold md:flex"
        >
          <Link
            to="/"
            search={{}}
            className="rounded-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to="/"
            search={{}}
            hash="catalog"
            className="rounded-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            Mercado
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Carrinho</span>
        </nav>

        <div className="pb-16 md:pb-24">
          {content}

          <CartRecommendations
            isPending={areRecommendationsPending}
            items={recommendations}
          />
        </div>
      </PageContainer>
    </main>
  );
}
