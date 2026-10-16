import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  createFileRoute,
} from "@tanstack/react-router";
import {
  ChevronLeft,
  LogOut,
  WalletCards,
} from "lucide-react";

import { DesktopDetailHeader } from "@/components/layout/desktop-detail-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ProfileAccessRequired } from "@/features/auth/components/profile-access-required";
import { ProfileMobileNavigation } from "@/features/auth/components/profile-mobile-navigation";
import { ProfilePageSkeleton } from "@/features/auth/components/profile-page-skeleton";
import { ProfileSidebar } from "@/features/auth/components/profile-sidebar";
import { logoutMutationOptions } from "@/features/auth/mutations/auth-mutations";
import { useAuth } from "@/features/auth/use-auth";
import { cartQueryOptions } from "@/features/cart/queries/cart-query";
import { useCartOwnerId } from "@/features/cart/use-cart-owner-id";
import { WalletsPageContent } from "@/features/wallets/components/wallets-page-content";
import { walletsQueryOptions } from "@/features/wallets/queries/wallets-query";
import { restoreMocking } from "@/mocks/enable-mocking";

export const Route = createFileRoute("/wallets")({
  component: WalletsPage,
});

function WalletsPage() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
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
    data: wallets,
    isPending: areWalletsPending,
    isError,
    refetch,
  } = useQuery({
    ...walletsQueryOptions(
      session?.user.id ?? "anonymous",
    ),
    enabled: Boolean(session) && !isSessionPending,
  });
  const logoutMutation = useMutation(
    logoutMutationOptions(queryClient),
  );

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        void navigate({ to: "/", search: {} });
      },
    });
  }

  let content;

  if (isSessionPending || (session && areWalletsPending)) {
    content = <ProfilePageSkeleton />;
  } else if (!session) {
    content = (
      <ProfileAccessRequired
        title="Entre para acessar suas carteiras"
        description="As carteiras cadastradas são privadas e vinculadas à sua conta."
        onLogin={openLogin}
      />
    );
  } else if (isError || !wallets) {
    content = (
      <section className="grid min-h-[55svh] place-items-center text-center">
        <div className="max-w-md space-y-4">
          <WalletCards
            aria-hidden="true"
            className="mx-auto size-12 text-primary"
          />
          <p role="alert">
            Não foi possível carregar suas carteiras.
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
  } else {
    content = (
      <div className="grid gap-8 py-8 md:grid-cols-[13rem_minmax(0,1fr)] md:py-12">
        <ProfileSidebar
          activeItem="wallets"
          isLoggingOut={logoutMutation.isPending}
          onLogout={handleLogout}
        />

        <div className="min-w-0">
          <ProfileMobileNavigation activeItem="wallets" />
          <WalletsPageContent
            user={session.user}
            wallets={wallets}
          />

          <Button
            type="button"
            variant="outline"
            className="mt-8 w-full md:hidden"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" />
            {logoutMutation.isPending
              ? "Saindo..."
              : "Sair da conta"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <DesktopDetailHeader
        activeItem="home"
        cartItemCount={cart?.totalQuantity ?? 0}
      />

      <PageContainer>
        <header className="relative flex items-center justify-center py-6 md:hidden">
          <Link
            to="/profile"
            className="absolute left-0 grid size-9 place-items-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Voltar ao perfil"
          >
            <ChevronLeft
              className="size-4"
              aria-hidden="true"
            />
          </Link>
          <h1 className="font-bold">Minhas carteiras</h1>
        </header>

        {content}
      </PageContainer>
    </main>
  );
}
