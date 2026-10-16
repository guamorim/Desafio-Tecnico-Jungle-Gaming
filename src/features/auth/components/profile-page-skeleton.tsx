import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePageSkeleton() {
  return (
    <div
      className="grid gap-8 py-8 md:grid-cols-[13rem_minmax(0,1fr)]"
      aria-label="Carregando perfil"
    >
      <Skeleton className="hidden h-80 md:block" />
      <div className="space-y-6">
        <Skeleton className="h-7 w-56" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-16"
            />
          ))}
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
