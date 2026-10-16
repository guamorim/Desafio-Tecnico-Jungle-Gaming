import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  nftCategoryOptions,
  nftNetworkOptions,
  nftPriceLimits,
} from "@/features/nfts/catalog-filters";
import type {
  NftCatalogFilters,
  NftCatalogSearch,
} from "@/features/nfts/catalog-search";

import { CategoryMultiselect } from "./category-multiselect";

type MobileCatalogFiltersProps = {
  readonly open: boolean;
  readonly search: NftCatalogSearch;
  readonly onApply: (
    filters: NftCatalogFilters,
  ) => void;
  readonly onOpenChange: (
    open: boolean,
  ) => void;
};

function readOptionValue<TValue extends string>(
  value: FormDataEntryValue | null,
  options: readonly {
    readonly value: TValue;
  }[],
) {
  if (typeof value !== "string") {
    return undefined;
  }

  return options.find(
    (option) => option.value === value,
  )?.value;
}

function readPrice(
  value: FormDataEntryValue | null,
  fallback: number,
) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
}

function readCategories(
  values: FormDataEntryValue[],
) {
  const selectedValues = new Set(values);
  const categories = nftCategoryOptions
    .filter((option) =>
      selectedValues.has(option.value),
    )
    .map((option) => option.value);

  return categories.length > 0
    ? categories
    : undefined;
}

export function MobileCatalogFilters({
  open,
  search,
  onApply,
  onOpenChange,
}: MobileCatalogFiltersProps) {
  const formKey = [
    search.categories?.join(",") ?? "",
    search.network ?? "",
    search.minimumPrice ?? "",
    search.maximumPrice ?? "",
  ].join(":");

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        id="catalog-filters"
        side="bottom"
        showCloseButton={false}
        className="max-h-[90dvh] rounded-t-3xl md:hidden"
      >
        <SheetHeader className="flex-row items-start justify-between border-b">
          <div className="space-y-1">
            <SheetTitle>
              Filtrar catálogo
            </SheetTitle>

            <SheetDescription>
              Refine os NFTs por categoria, rede e
              preço.
            </SheetDescription>
          </div>

          <SheetClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Fechar filtros"
              />
            }
          >
            <X aria-hidden="true" />
            <span className="sr-only">
              Fechar filtros
            </span>
          </SheetClose>
        </SheetHeader>

        <form
          key={formKey}
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(
              event.currentTarget,
            );

            const minimumPrice = readPrice(
              formData.get("minimumPrice"),
              nftPriceLimits.minimum,
            );

            const maximumPrice = readPrice(
              formData.get("maximumPrice"),
              nftPriceLimits.maximum,
            );

            if (minimumPrice > maximumPrice) {
              const minimumPriceInput =
                event.currentTarget.elements.namedItem(
                  "minimumPrice",
                );

              if (
                minimumPriceInput instanceof
                HTMLInputElement
              ) {
                minimumPriceInput.setCustomValidity(
                  "O preço mínimo não pode ser maior que o máximo.",
                );
                minimumPriceInput.reportValidity();
              }

              return;
            }

            onApply({
              categories: readCategories(
                formData.getAll("categories"),
              ),
              network: readOptionValue(
                formData.get("network"),
                nftNetworkOptions,
              ),
              minimumPrice:
                minimumPrice >
                nftPriceLimits.minimum
                  ? minimumPrice
                  : undefined,
              maximumPrice:
                maximumPrice <
                nftPriceLimits.maximum
                  ? maximumPrice
                  : undefined,
            });

            onOpenChange(false);
          }}
        >
          <div className="space-y-6 overflow-y-auto p-4">
            <div className="space-y-2">
              <p className="text-sm font-bold">
                Categorias
              </p>

              <CategoryMultiselect
                id="mobile-filter-category"
                selectedCategories={
                  search.categories
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="mobile-filter-network"
                className="text-sm font-bold"
              >
                Rede
              </label>

              <select
                id="mobile-filter-network"
                name="network"
                defaultValue={search.network ?? ""}
                className="h-11 w-full rounded-lg border bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">
                  Todas as redes
                </option>

                {nftNetworkOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-bold">
                Faixa de preço
              </legend>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Mínimo em ETH</span>

                  <input
                    name="minimumPrice"
                    type="number"
                    min={nftPriceLimits.minimum}
                    max={nftPriceLimits.maximum}
                    step="0.01"
                    defaultValue={
                      search.minimumPrice ??
                      nftPriceLimits.minimum
                    }
                    required
                    className="h-11 w-full rounded-lg border bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onInput={(event) => {
                      event.currentTarget.setCustomValidity(
                        "",
                      );
                    }}
                  />
                </label>

                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Máximo em ETH</span>

                  <input
                    name="maximumPrice"
                    type="number"
                    min={nftPriceLimits.minimum}
                    max={nftPriceLimits.maximum}
                    step="0.01"
                    defaultValue={
                      search.maximumPrice ??
                      nftPriceLimits.maximum
                    }
                    required
                    className="h-11 w-full rounded-lg border bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onInput={(event) => {
                      event.currentTarget.setCustomValidity(
                        "",
                      );
                    }}
                  />
                </label>
              </div>
            </fieldset>
          </div>

          <SheetFooter className="grid grid-cols-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onApply({});
                onOpenChange(false);
              }}
            >
              Limpar
            </Button>

            <Button type="submit">
              Aplicar filtros
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
