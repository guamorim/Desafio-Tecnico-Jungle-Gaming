import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { isAxiosError } from "axios";

import { DesktopDetailHeader } from "@/components/layout/desktop-detail-header";
import { PageContainer } from "@/components/layout/page-container";
import { cartQueryOptions } from "@/features/cart/queries/cart-query";
import { useCartOwnerId } from "@/features/cart/use-cart-owner-id";
import { restoreMocking } from "@/mocks/enable-mocking";
import { NftDetailContent } from "@/features/nfts/components/nft-detail-content";
import { NftDetailError } from "@/features/nfts/components/nft-detail-error";
import { NftDetailSkeleton } from "@/features/nfts/components/nft-detail-skeleton";
import { nftDetailQueryOptions } from "@/features/nfts/queries/nft-detail-query";

export const Route = createFileRoute(
  "/nfts/$nftId",
)({
  component: NftDetailPage,
});

function NftDetailPage() {
  const { nftId } = Route.useParams();
  const cartOwnerId = useCartOwnerId();
  const { data: cart } = useQuery(
    cartQueryOptions(cartOwnerId),
  );
  const {
    data: nft,
    error,
    isPending,
    refetch,
  } = useQuery(nftDetailQueryOptions(nftId));

  const cartItemCount = cart?.totalQuantity ?? 0;

  let content;

  if (isPending) {
    content = <NftDetailSkeleton />;
  } else if (!nft) {
    content = (
      <NftDetailError
        isNotFound={
          isAxiosError(error) &&
          error.response?.status === 404
        }
        onRetry={() => {
          void restoreMocking().then(() => refetch());
        }}
      />
    );
  } else {
    content = <NftDetailContent key={nft.id} nft={nft} />;
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <DesktopDetailHeader
        cartItemCount={cartItemCount}
      />
      <PageContainer>{content}</PageContainer>
    </main>
  );
}
