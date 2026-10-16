import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  buttonVariants,
} from "@/components/ui/button";
import type {
  NftCatalogSearch,
} from "@/features/nfts/catalog-search";
import type {
  PaginationMeta,
} from "@/features/nfts/types";
import { cn } from "@/lib/utils";

type NftCatalogPaginationProps = {
  readonly pagination: PaginationMeta;
  readonly search: NftCatalogSearch;
};

function createPageSearch(
  search: NftCatalogSearch,
  page: number,
): NftCatalogSearch {
  return {
    ...search,
    page: page === 1 ? undefined : page,
  };
}

export function NftCatalogPagination({
  pagination,
  search,
}: NftCatalogPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    { length: pagination.totalPages },
    (_, index) => index + 1,
  );

  const disabledControlClassName = cn(
    buttonVariants({
      variant: "outline",
      size: "icon",
    }),
    "pointer-events-none opacity-40",
  );

  return (
    <nav
      className="mt-10 flex justify-end"
      aria-label="Paginação do catálogo"
    >
      <ul className="flex items-center gap-2">
        <li>
          {pagination.page > 1 ? (
            <Link
              to="/"
              search={createPageSearch(
                search,
                pagination.page - 1,
              )}
              className={buttonVariants({
                variant: "outline",
                size: "icon",
              })}
              aria-label="Ir para a página anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </Link>
          ) : (
            <span
              className={disabledControlClassName}
              aria-disabled="true"
            >
              <ChevronLeft aria-hidden="true" />
              <span className="sr-only">
                Página anterior indisponível
              </span>
            </span>
          )}
        </li>

        {pages.map((page) => {
          const isCurrentPage =
            page === pagination.page;

          return (
            <li key={page}>
              {isCurrentPage ? (
                <span
                  className={buttonVariants({
                    variant: "default",
                    size: "icon",
                  })}
                  aria-current="page"
                >
                  {page}
                </span>
              ) : (
                <Link
                  to="/"
                  search={createPageSearch(
                    search,
                    page,
                  )}
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon",
                  })}
                  aria-label={`Ir para a página ${page}`}
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}

        <li>
          {pagination.page <
          pagination.totalPages ? (
            <Link
              to="/"
              search={createPageSearch(
                search,
                pagination.page + 1,
              )}
              className={buttonVariants({
                variant: "outline",
                size: "icon",
              })}
              aria-label="Ir para a próxima página"
            >
              <ChevronRight aria-hidden="true" />
            </Link>
          ) : (
            <span
              className={disabledControlClassName}
              aria-disabled="true"
            >
              <ChevronRight aria-hidden="true" />
              <span className="sr-only">
                Próxima página indisponível
              </span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
