import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutPageSkeleton() {
  return (
    <section
      aria-label="Carregando pagamento"
      aria-busy="true"
      className="grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_22rem] md:py-12"
    >
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-[32rem] w-full rounded-2xl" />
    </section>
  );
}
