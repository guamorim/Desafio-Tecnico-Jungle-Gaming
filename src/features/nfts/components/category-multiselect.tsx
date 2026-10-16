import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  nftCategoryOptions,
  type NftCategory,
} from "@/features/nfts/catalog-filters";

type CategoryMultiselectProps = {
  readonly id: string;
  readonly selectedCategories?: readonly NftCategory[];
  readonly onSelectionChange?: (
    categories: readonly NftCategory[],
  ) => void;
};

export function CategoryMultiselect({
  id,
  selectedCategories = [],
  onSelectionChange,
}: CategoryMultiselectProps) {
  const [localCategories, setLocalCategories] =
    useState<readonly NftCategory[]>(
      selectedCategories,
    );

  const activeCategories = onSelectionChange
    ? selectedCategories
    : localCategories;

  function changeSelection(
    category: NftCategory,
    checked: boolean,
  ) {
    const nextCategories = checked
      ? [...activeCategories, category]
      : activeCategories.filter(
          (currentCategory) =>
            currentCategory !== category,
        );

    if (onSelectionChange) {
      onSelectionChange(nextCategories);
    } else {
      setLocalCategories(nextCategories);
    }
  }

  function clearSelection() {
    if (onSelectionChange) {
      onSelectionChange([]);
    } else {
      setLocalCategories([]);
    }
  }

  const summary =
    activeCategories.length === 0
      ? "Todas as categorias"
      : `${activeCategories.length} selecionada${activeCategories.length > 1 ? "s" : ""}`;

  return (
    <details className="group">
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>

        <ChevronDown
          className="size-4 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="mt-2 space-y-1 rounded-lg border bg-popover p-2 shadow-md">
        {nftCategoryOptions.map((option) => {
          const inputId = `${id}-${option.value}`;
          const isSelected =
            activeCategories.includes(option.value);

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
            >
              <input
                id={inputId}
                name="categories"
                type="checkbox"
                value={option.value}
                checked={isSelected}
                className="size-4 accent-primary"
                onChange={(event) => {
                  changeSelection(
                    option.value,
                    event.currentTarget.checked,
                  );
                }}
              />

              <span>{option.label}</span>
            </label>
          );
        })}

        {activeCategories.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 w-full"
            onClick={clearSelection}
          >
            Limpar categorias
          </Button>
        )}
      </div>
    </details>
  );
}
