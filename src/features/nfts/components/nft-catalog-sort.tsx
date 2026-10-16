import {
  nftSortOptions,
  type NftCatalogSort,
} from "@/features/nfts/catalog-filters";

type NftCatalogSortProps = {
  readonly value: NftCatalogSort;
  readonly onValueChange: (
    value: NftCatalogSort,
  ) => void;
};

export function NftCatalogSortSelect({
  value,
  onValueChange,
}: NftCatalogSortProps) {
  return (
    <label className="flex w-full items-center justify-between gap-3 text-sm md:w-auto md:justify-start">
      <span className="text-muted-foreground">
        Ordenar por:
      </span>

      <select
        value={value}
        className="h-10 rounded-lg border bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onChange={(event) => {
          const selectedSort =
            nftSortOptions.find(
              (option) =>
                option.value ===
                event.currentTarget.value,
            )?.value ?? "recent";

          onValueChange(selectedSort);
        }}
      >
        {nftSortOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
