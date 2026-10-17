import { useQuery } from "@tanstack/react-query";
import {
  Link,
  createFileRoute,
} from "@tanstack/react-router";
import {
  ChevronLeft,
  Heart,
  LockKeyhole,
} from "lucide-react";

import { DesktopDetailHeader } from "@/components/layout/desktop-detail-header";
import { MobileBottomNavigation } from "@/components/layout/mobile-bottom-navigation";
import { PageContainer } from "@/components/layout/page-container";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";
import { cartQueryOptions } from "@/features/cart/queries/cart-query";
import { useCartOwnerId } from "@/features/cart/use-cart-owner-id";
import { NftCard } from "@/features/nfts/components/nft-card";
import { NftCatalogSkeleton } from "@/features/nfts/components/nft-catalog-skeleton";
import { favoriteNftsQueryOptions } from "@/features/nfts/queries/favorite-nfts-query";
import { restoreMocking } from "@/mocks/enable-mocking";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const {
    session,
    isSessionPending,
    openLogin,
  } = useAuth();
  const cartOwnerId = useCartOwnerId();
  const { data: cart } = useQuery(
    cartQueryOptions(cartOwnerId),
  );
  const {
    data,
    isPending,
    isError,
    refetch,
  } = useQuery({
    ...favoriteNftsQueryOptions(
      session?.user.id ?? "anonymous",
    ),
    enabled: Boolean(session) && !isSessionPending,
  });

  let content;

  if (isSessionPending) {
    content = <NftCatalogSkeleton />;
  } else if (!session) {
    content = (
      <section className="grid min-h-[55svh] place-items-center py-16 text-center">
        <div className="max-w-md space-y-5">
          <span className="mx-auto grid size-14 place-items-center rounded-full border bg-card text-primary">
            <LockKeyhole aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              Entre para acessar seus favoritos
            </h1>
            <p className="text-sm text-muted-foreground">
              Sua lista de interesse é privada e vinculada à sua conta.
            </p>
          </div>
          <Button type="button" onClick={openLogin}>
            Entrar
          </Button>
        </div>
      </section>
    );
  } else if (isError) {
    content = (
      <section className="grid min-h-[45svh] place-items-center text-center">
        <div className="space-y-4">
          <p role="alert">
            Não foi possível carregar seus favoritos.
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
  } else if (isPending) {
    content = <NftCatalogSkeleton />;
  } else if (!data || data.items.length === 0) {
    content = (
      <section className="grid min-h-[45svh] place-items-center py-16 text-center">
        <div className="max-w-md space-y-4">
          <Heart
            aria-hidden="true"
            className="mx-auto size-12 text-primary"
          />
          <h2 className="text-2xl font-bold">
            Sua lista está vazia
          </h2>
          <p className="text-sm text-muted-foreground">
            Adicione NFTs aos favoritos no mercado para encontrá-los rapidamente aqui.
          </p>
          <Link
            to="/"
            search={{}}
            hash="catalog"
            className={buttonVariants()}
          >
            Explorar NFTs
          </Link>
        </div>
      </section>
    );
  } else {
    content = (
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((nft) => (
          <li key={nft.id}>
            <NftCard nft={nft} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="min-h-svh bg-background pb-28 text-foreground md:pb-0">
      <DesktopDetailHeader
        activeItem="home"
        cartItemCount={cart?.totalQuantity ?? 0}
      />

      <PageContainer>
        <header className="relative flex items-center justify-center py-6 md:justify-start md:py-10">
          <Link
            to="/"
            search={{}}
            className="absolute left-0 grid size-9 place-items-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label="Voltar ao mercado"
          >
            <ChevronLeft
              className="size-4"
              aria-hidden="true"
            />
          </Link>
          <div>
            <h1 className="text-xl font-bold md:text-3xl">
              Lista de interesse
            </h1>
            {session && (
              <p className="mt-2 hidden text-sm text-muted-foreground md:block">
                Seus NFTs favoritos em um só lugar.
              </p>
            )}
          </div>
        </header>

        {content}
      </PageContainer>

      <MobileBottomNavigation
        activeItem="favorites"
        cartItemCount={cart?.totalQuantity ?? 0}
      />
    </main>
  );
}
