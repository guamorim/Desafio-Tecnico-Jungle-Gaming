import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, WalletCards } from "lucide-react";

import { DesktopDetailHeader } from "@/components/layout/desktop-detail-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProfileAccessRequired } from "@/features/auth/components/profile-access-required";
import { useAuth } from "@/features/auth/use-auth";
import { cartQueryOptions } from "@/features/cart/queries/cart-query";
import { useCartOwnerId } from "@/features/cart/use-cart-owner-id";
import { CheckoutPageContent } from "@/features/checkout/components/checkout-page-content";
import { CheckoutPageSkeleton } from "@/features/checkout/components/checkout-page-skeleton";
import type { CheckoutScenario } from "@/features/checkout/types";
import { walletsQueryOptions } from "@/features/wallets/queries/wallets-query";
import { restoreMocking } from "@/mocks/enable-mocking";

type CheckoutSearch = {
  readonly scenario: CheckoutScenario;
};

const checkoutScenarios = new Set<CheckoutScenario>([
  "success",
  "wallet-rejected",
  "payment-refused",
  "order-timeout",
]);

export const Route = createFileRoute("/checkout")({
  validateSearch: (search): CheckoutSearch => ({
    scenario:
      typeof search.scenario === "string" &&
      checkoutScenarios.has(search.scenario as CheckoutScenario)
        ? (search.scenario as CheckoutScenario)
        : "success",
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = Route.useNavigate();
  const { scenario } = Route.useSearch();
  const { session, isSessionPending, openLogin } = useAuth();
  const cartOwnerId = useCartOwnerId();
  const {
    data: cart,
    isPending: isCartPending,
    isError: isCartError,
    refetch: refetchCart,
  } = useQuery({
    ...cartQueryOptions(cartOwnerId),
    enabled: Boolean(session) && !isSessionPending && cartOwnerId !== null,
  });
  const {
    data: wallets,
    isPending: areWalletsPending,
    isError: areWalletsError,
    refetch: refetchWallets,
  } = useQuery({
    ...walletsQueryOptions(session?.user.id ?? "anonymous"),
    enabled: Boolean(session) && !isSessionPending,
  });

  let content;

  if (isSessionPending || (session && (isCartPending || areWalletsPending))) {
    content = <CheckoutPageSkeleton />;
  } else if (!session) {
    content = (
      <ProfileAccessRequired
        title="Entre para continuar o pagamento"
        description="Seu pedido, suas carteiras e a confirmação da compra ficam vinculados à sua conta."
        onLogin={openLogin}
      />
    );
  } else if (isCartError || areWalletsError || !cart || !wallets) {
    content = (
      <section className="grid min-h-[55svh] place-items-center py-16 text-center">
        <div className="max-w-md space-y-5">
          <WalletCards className="mx-auto size-12 text-primary" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Não foi possível preparar o pagamento</h1>
            <p className="text-sm text-muted-foreground">
              Restaure a conexão com a API simulada e tente novamente.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              void restoreMocking().then(() =>
                Promise.all([refetchCart(), refetchWallets()]),
              );
            }}
          >
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  } else if (cart.items.length === 0) {
    content = (
      <section className="grid min-h-[55svh] place-items-center py-16 text-center">
        <div className="max-w-md space-y-5">
          <WalletCards className="mx-auto size-12 text-primary" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
            <p className="text-sm text-muted-foreground">
              Adicione pelo menos uma edição antes de iniciar o pagamento.
            </p>
          </div>
          <Link to="/" search={{}} hash="catalog" className={buttonVariants()}>
            Explorar NFTs
          </Link>
        </div>
      </section>
    );
  } else if (wallets.items.length === 0) {
    content = (
      <section className="grid min-h-[55svh] place-items-center py-16 text-center">
        <div className="max-w-md space-y-5">
          <WalletCards className="mx-auto size-12 text-primary" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Cadastre uma carteira</h1>
            <p className="text-sm text-muted-foreground">
              Você precisa de uma carteira cadastrada para conectar e confirmar a compra.
            </p>
          </div>
          <Link to="/wallets" className={buttonVariants()}>
            Gerenciar carteiras
          </Link>
        </div>
      </section>
    );
  } else {
    content = (
      <CheckoutPageContent
        key={`${session.user.id}:${cart.id}`}
        cart={cart}
        scenario={scenario}
        user={session.user}
        wallets={wallets}
        onOrderCreated={(orderId) => {
          void navigate({
            to: "/orders/$orderId",
            params: { orderId },
          });
        }}
      />
    );
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <DesktopDetailHeader activeItem="market" cartItemCount={cart?.totalQuantity ?? 0} />
      <PageContainer>
        <header className="relative flex items-center justify-center py-6 md:hidden">
          <Link
            to="/cart"
            className="absolute left-0 grid size-9 place-items-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Voltar ao carrinho"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
          <h1 className="font-bold">Pagamento</h1>
        </header>

        <nav
          aria-label="Navegação estrutural"
          className="hidden flex-wrap items-center gap-2 py-6 text-sm font-bold md:flex"
        >
          <Link to="/" search={{}} className="outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/" search={{}} hash="catalog" className="outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
            Mercado
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Pagamento</span>
        </nav>

        {content}
      </PageContainer>
    </main>
  );
}
