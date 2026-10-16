import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = ComponentProps<"div">;

function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      {...props}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "after:absolute after:inset-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-foreground/10 after:to-transparent after:content-['']",
        "motion-reduce:after:hidden",
        className,
      )}
    />
  );
}

export { Skeleton };
