import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileAccessRequired } from "@/features/auth/components/profile-access-required";
import { useAuth } from "@/features/auth/use-auth";
import { createUserCartOwnerId } from "@/features/cart/cart-owner-id";
import { cartQueryKey } from "@/features/cart/queries/cart-query";
import { OrderReceipt } from "@/features/checkout/components/order-receipt";
import { orderQueryOptions } from "@/features/checkout/queries/order-query";
import { nftViewerQueryKey } from "@/features/nfts/queries/nft-query-keys";
import { useRealtime } from "@/features/realtime/use-realtime";
import { restoreMocking } from "@/mocks/enable-mocking";

export const Route = createFileRoute("/orders/$orderId")({
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const queryClient = useQueryClient();
  const { session, isSessionPending, openLogin } = useAuth();
  const { connectionStatus } = useRealtime();
  const { data: order, error, isPending, refetch } = useQuery({
    ...orderQueryOptions(
      session?.user.id ?? "anonymous",
      orderId,
      connectionStatus !== "connected",
    ),
    enabled: Boolean(session) && !isSessionPending,
  });

  useEffect(() => {
    if (!session || order?.status !== "confirmed") return;

    void queryClient.invalidateQueries({
      queryKey: cartQueryKey(createUserCartOwnerId(session.user.id)),
      exact: true,
    });
    void queryClient.invalidateQueries({
      queryKey: nftViewerQueryKey(session.user.id),
    });
  }, [order?.status, queryClient, session]);

  let content;

  if (isSessionPending || (session && isPending)) {
    content = (
      <section aria-label="Carregando pedido" aria-busy="true" className="w-full max-w-xl space-y-4 rounded-3xl border bg-card p-6">
        <Skeleton className="mx-auto size-14 rounded-full" />
        <Skeleton className="mx-auto h-7 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-56 w-full" />
      </section>
    );
  } else if (!session) {
    content = (
      <ProfileAccessRequired
        title="Entre para consultar seu pedido"
        description="Somente o colecionador responsável pela compra pode acessar esta confirmação."
        onLogin={openLogin}
      />
    );
  } else if (!order) {
    const isNotFound = isAxiosError(error) && error.response?.status === 404;
    content = (
      <section className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">
          {isNotFound ? "Pedido não encontrado" : "Não foi possível consultar o pedido"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isNotFound
            ? "Este pedido não existe ou pertence a outra conta."
            : "Restaure a conexão com a API simulada e tente novamente."}
        </p>
        {!isNotFound && (
          <Button type="button" onClick={() => void restoreMocking().then(() => refetch())}>
            Tentar novamente
          </Button>
        )}
      </section>
    );
  } else {
    content = <OrderReceipt order={order} />;
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-10 text-foreground">
      {content}
    </main>
  );
}
