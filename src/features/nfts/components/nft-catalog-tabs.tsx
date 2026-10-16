import {
  nftCatalogTabOptions,
  type NftCatalogTab,
} from "@/features/nfts/catalog-filters";

type NftCatalogTabsProps = {
  readonly value: NftCatalogTab;
  readonly onValueChange: (
    value: NftCatalogTab,
  ) => void;
};

export function NftCatalogTabs({
  value,
  onValueChange,
}: NftCatalogTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Visualização do catálogo"
      className="flex overflow-x-auto border-b"
    >
      {nftCatalogTabOptions.map(
        (option, index) => {
          const isSelected =
            value === option.value;

          return (
            <button
              key={option.value}
              id={`catalog-tab-${option.value}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="nft-catalog-results"
              tabIndex={isSelected ? 0 : -1}
              className={
                isSelected
                  ? "shrink-0 border-b-2 border-primary px-3 py-2 text-sm font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  : "shrink-0 border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              }
              onClick={() => {
                onValueChange(option.value);
              }}
              onKeyDown={(event) => {
                let nextIndex:
                  | number
                  | undefined;

                if (
                  event.key === "ArrowRight"
                ) {
                  nextIndex =
                    (index + 1) %
                    nftCatalogTabOptions.length;
                }

                if (
                  event.key === "ArrowLeft"
                ) {
                  nextIndex =
                    (index -
                      1 +
                      nftCatalogTabOptions.length) %
                    nftCatalogTabOptions.length;
                }

                if (event.key === "Home") {
                  nextIndex = 0;
                }

                if (event.key === "End") {
                  nextIndex =
                    nftCatalogTabOptions.length -
                    1;
                }

                if (
                  nextIndex === undefined
                ) {
                  return;
                }

                event.preventDefault();

                const nextOption =
                  nftCatalogTabOptions[
                    nextIndex
                  ];

                const nextElement =
                  document.getElementById(
                    `catalog-tab-${nextOption.value}`,
                  );

                nextElement?.focus();
                onValueChange(
                  nextOption.value,
                );
              }}
            >
              {option.label}
            </button>
          );
        },
      )}
    </div>
  );
}
