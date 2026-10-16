import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { isAxiosError } from "axios";

import { PageContainer } from "@/components/layout/page-container";
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
  const {
    data: nft,
    error,
    isPending,
    refetch,
  } = useQuery(nftDetailQueryOptions(nftId));

  let content;

  if (isPending) {
    content = <NftDetailSkeleton />;
  } else if (error || !nft) {
    content = (
      <NftDetailError
        isNotFound={
          isAxiosError(error) &&
          error.response?.status === 404
        }
        onRetry={() => void refetch()}
      />
    );
  } else {
    content = <NftDetailContent nft={nft} />;
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageContainer>{content}</PageContainer>
    </main>
  );
}
