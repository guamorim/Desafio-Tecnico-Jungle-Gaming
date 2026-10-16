import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  LogIn,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import { PageContainer } from "./page-container";

type DesktopHomeHeaderProps = {
  readonly cartItemCount: number;
  readonly initialSearchValue?: string;
  readonly onSearchSubmit: (
    value: string,
  ) => void;
};

export function DesktopHomeHeader({
  cartItemCount,
  initialSearchValue = "",
  onSearchSubmit,
}: DesktopHomeHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const [searchValue, setSearchValue] =
    useState(initialSearchValue);

  function closeSearch() {
    setIsSearchOpen(false);

    requestAnimationFrame(() => {
      document
        .getElementById(
          "desktop-search-trigger",
        )
        ?.focus();
    });
  }

  return (
    <header className="hidden border-b md:block">
      <PageContainer>
        <div className="flex h-16 items-center gap-8">
          <Link
            to="/"
            search={{}}
            className="shrink-0 font-bold uppercase tracking-[0.2em] text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Kurio
          </Link>

          {isSearchOpen ? (
            <form
              id="desktop-catalog-search-form"
              role="search"
              className="flex min-w-0 flex-1 items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                onSearchSubmit(searchValue);
                setIsSearchOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeSearch();
                }
              }}
            >
              <label
                htmlFor="desktop-catalog-search"
                className="sr-only"
              >
                Buscar NFTs
              </label>

              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="desktop-catalog-search"
                  name="search"
                  type="search"
                  value={searchValue}
                  placeholder="Buscar por NFT, criador ou coleção"
                  autoComplete="off"
                  autoFocus
                  className="h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) => {
                    setSearchValue(
                      event.currentTarget.value,
                    );
                  }}
                />
              </div>

              <Button type="submit">
                Buscar
              </Button>
            </form>
          ) : (
            <nav
              aria-label="Navegação principal"
              className="flex flex-1 items-center justify-center gap-8 text-sm"
            >
              <Link
                to="/"
                search={{}}
                className="font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Início
              </Link>

              <a
                href="#catalog"
                className="text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Mercado
              </a>

              <span
                aria-disabled="true"
                title="Disponível em breve"
                className="cursor-not-allowed text-muted-foreground/60"
              >
                Criadores
              </span>

              <span
                aria-disabled="true"
                title="Disponível em breve"
                className="cursor-not-allowed text-muted-foreground/60"
              >
                Aprenda
              </span>
            </nav>
          )}

          <div className="flex shrink-0 items-center gap-2">
            <Button
              id="desktop-search-trigger"
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                isSearchOpen
                  ? "Fechar busca"
                  : "Abrir busca"
              }
              aria-controls="desktop-catalog-search-form"
              aria-expanded={isSearchOpen}
              onClick={() => {
                if (isSearchOpen) {
                  closeSearch();
                } else {
                  setIsSearchOpen(true);
                }
              }}
            >
              {isSearchOpen ? (
                <X aria-hidden="true" />
              ) : (
                <Search aria-hidden="true" />
              )}
            </Button>

            {!isSearchOpen && (
              <>
                <div className="relative">
                  <Link
                    to="/cart"
                    aria-label={`Abrir carrinho com ${cartItemCount} unidades`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon",
                    })}
                  >
                    <ShoppingCart aria-hidden="true" />
                  </Link>

                  {cartItemCount > 0 && (
                    <span
                      className="pointer-events-none absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {cartItemCount > 9
                        ? "9+"
                        : cartItemCount}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  disabled
                  title="Login disponível em breve"
                >
                  <LogIn aria-hidden="true" />
                  Entrar
                </Button>
              </>
            )}
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
