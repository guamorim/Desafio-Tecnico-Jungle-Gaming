import { Skeleton } from "@/components/ui/skeleton";

export function CartPageSkeleton() {
  return (
    <section
      className="grid gap-8 md:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16"
      aria-label="Carregando carrinho"
      aria-busy="true"
    >
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-24 w-full rounded-xl"
          />
        ))}
      </div>

      <Skeleton className="h-72 w-full rounded-xl" />
    </section>
  );
}
