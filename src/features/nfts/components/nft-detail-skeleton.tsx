import { Skeleton } from "@/components/ui/skeleton";

export function NftDetailSkeleton() {
  return (
    <section
      className="py-8 md:py-12"
      aria-label="Carregando detalhes do NFT"
      aria-busy="true"
    >
      <Skeleton className="mb-8 h-5 w-40" />

      <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
        <Skeleton className="aspect-square rounded-3xl" />

        <div className="space-y-6">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </section>
  );
}
