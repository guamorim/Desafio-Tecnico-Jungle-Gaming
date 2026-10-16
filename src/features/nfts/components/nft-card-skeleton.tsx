import { Skeleton } from "@/components/ui/skeleton";

export function NftCardSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm"
      aria-hidden="true"
    >
      <Skeleton className="aspect-square rounded-none" />

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-32" />
        </div>

        <div className="flex items-end justify-between gap-4 border-t pt-4">
          <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>

          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </article>
  );
}
