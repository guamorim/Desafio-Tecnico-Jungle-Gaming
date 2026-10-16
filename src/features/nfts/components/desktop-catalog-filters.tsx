import { Button } from "@/components/ui/button";
import {
  nftNetworkOptions,
  nftPriceLimits,
} from "@/features/nfts/catalog-filters";
import type {
  NftCatalogFilters,
  NftCatalogSearch,
} from "@/features/nfts/catalog-search";

import { CategoryMultiselect } from "./category-multiselect";

type DesktopCatalogFiltersProps = {
  readonly search: NftCatalogSearch;
  readonly onApply: (
    filters: NftCatalogFilters,
  ) => void;
};

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

export function DesktopCatalogFilters({
  search,
  onApply,
}: DesktopCatalogFiltersProps) {
  const priceFormKey = [
    search.minimumPrice ?? "",
    search.maximumPrice ?? "",
  ].join(":");

  function updateFilters(
    changes: Partial<NftCatalogFilters>,
  ) {
    onApply({
      categories: search.categories,
      network: search.network,
      minimumPrice: search.minimumPrice,
      maximumPrice: search.maximumPrice,
      ...changes,
    });
  }

  return (
    <div
      aria-label="Filtros do catálogo"
    >
      <div className="space-y-8 rounded-xl bg-card p-5">
        <section
          aria-labelledby="desktop-category-title"
          className="space-y-3"
        >
          <h3
            id="desktop-category-title"
            className="font-bold"
          >
            Categorias
          </h3>

          <CategoryMultiselect
            id="desktop-filter-category"
            selectedCategories={search.categories}
            onSelectionChange={(categories) => {
              updateFilters({
                categories:
                  categories.length > 0
                    ? categories
                    : undefined,
              });
            }}
          />
        </section>

        <form
          key={priceFormKey}
          className="space-y-3 border-y py-6"
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

            updateFilters({
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
          }}
        >
          <h3 className="font-bold">
            Faixa de preço
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-2 text-xs text-muted-foreground">
              <span>Mínimo</span>

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
                className="h-10 w-full rounded-lg border bg-background px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onInput={(event) => {
                  event.currentTarget.setCustomValidity(
                    "",
                  );
                }}
              />
            </label>

            <label className="space-y-2 text-xs text-muted-foreground">
              <span>Máximo</span>

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
                className="h-10 w-full rounded-lg border bg-background px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onInput={(event) => {
                  event.currentTarget.setCustomValidity(
                    "",
                  );
                }}
              />
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Valores em ETH
          </p>

          <Button
            type="submit"
            className="w-full"
          >
            Aplicar preço
          </Button>
        </form>

        <section
          aria-labelledby="desktop-network-title"
          className="space-y-3"
        >
          <h3
            id="desktop-network-title"
            className="font-bold"
          >
            Rede
          </h3>

          <ul className="space-y-1">
            <li>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                aria-pressed={!search.network}
                onClick={() => {
                  updateFilters({
                    network: undefined,
                  });
                }}
              >
                Todas as redes
              </Button>
            </li>

            {nftNetworkOptions.map((option) => {
              const isSelected =
                search.network === option.value;

              return (
                <li key={option.value}>
                  <Button
                    type="button"
                    variant="ghost"
                    className={
                      isSelected
                        ? "w-full justify-start bg-primary/10 text-primary"
                        : "w-full justify-start text-muted-foreground"
                    }
                    aria-pressed={isSelected}
                    onClick={() => {
                      updateFilters({
                        network: option.value,
                      });
                    }}
                  >
                    {option.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
