import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PageContainer } from "./page-container";

type MobileHomeHeaderProps = {
  readonly initialSearchValue?: string;
  readonly isFilterOpen?: boolean;
  readonly onOpenFilters?: () => void;
  readonly onSearchSubmit: (value: string) => void;
};

export function MobileHomeHeader({
  initialSearchValue = "",
  isFilterOpen = false,
  onOpenFilters,
  onSearchSubmit,
}: MobileHomeHeaderProps) {
  const [searchValue, setSearchValue] = useState(
    initialSearchValue,
  );

  return (
    <header className="md:hidden">
      <PageContainer className="pt-10">
        <form
          role="search"
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit(searchValue);
          }}
        >
          <label
            htmlFor="mobile-catalog-search"
            className="sr-only"
          >
            Buscar NFTs
          </label>

          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <input
              id="mobile-catalog-search"
              name="search"
              type="search"
              value={searchValue}
              placeholder="Explorar coleções"
              autoComplete="off"
              className="h-12 w-full appearance-none rounded-2xl border-0 bg-card pl-12 pr-4 text-base font-bold text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => {
                setSearchValue(event.currentTarget.value);
              }}
            />
          </div>

          {onOpenFilters && (
            <Button
              id="mobile-filter-trigger"
              type="button"
              size="icon-lg"
              className="size-12 shrink-0 rounded-2xl"
              aria-label="Abrir filtros"
              aria-controls="catalog-filters"
              aria-expanded={isFilterOpen}
              onClick={onOpenFilters}
            >
              <SlidersHorizontal
                className="size-6"
                aria-hidden="true"
              />
            </Button>
          )}
        </form>
      </PageContainer>
    </header>
  );
}
