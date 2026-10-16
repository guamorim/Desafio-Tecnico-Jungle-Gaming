import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = ComponentProps<"div">;

export function PageContainer({
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      {...props}
      data-slot="page-container"
      className={cn(
        "mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-10",
        className,
      )}
    />
  );
}
