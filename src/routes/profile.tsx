import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  createFileRoute,
} from "@tanstack/react-router";
import { ChevronLeft, LogOut } from "lucide-react";

import { DesktopDetailHeader } from "@/components/layout/desktop-detail-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ProfileAccessRequired } from "@/features/auth/components/profile-access-required";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { ProfileMobileNavigation } from "@/features/auth/components/profile-mobile-navigation";
import { ProfilePageSkeleton } from "@/features/auth/components/profile-page-skeleton";
import { ProfileSidebar } from "@/features/auth/components/profile-sidebar";
import { logoutMutationOptions } from "@/features/auth/mutations/auth-mutations";
import { useAuth } from "@/features/auth/use-auth";
import { cartQueryOptions } from "@/features/cart/queries/cart-query";
import { useCartOwnerId } from "@/features/cart/use-cart-owner-id";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
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
  const logoutMutation = useMutation(
    logoutMutationOptions(queryClient),
  );

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        void navigate({
          to: "/",
          search: {},
        });
      },
    });
  }

  let content;

  if (isSessionPending) {
    content = <ProfilePageSkeleton />;
  } else if (!session) {
    content = (
      <ProfileAccessRequired onLogin={openLogin} />
    );
  } else {
    content = (
      <div className="grid gap-8 py-8 md:grid-cols-[13rem_minmax(0,1fr)] md:py-12">
        <ProfileSidebar
          activeItem="profile"
          isLoggingOut={logoutMutation.isPending}
          onLogout={handleLogout}
        />

        <div className="min-w-0">
          <ProfileMobileNavigation activeItem="profile" />
          <ProfileForm user={session.user} />

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
            to="/"
            search={{}}
            className="absolute left-0 grid size-9 place-items-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Voltar ao início"
          >
            <ChevronLeft
              className="size-4"
              aria-hidden="true"
            />
          </Link>
          <h1 className="font-bold">Meu perfil</h1>
        </header>

        {content}
      </PageContainer>
    </main>
  );
}
