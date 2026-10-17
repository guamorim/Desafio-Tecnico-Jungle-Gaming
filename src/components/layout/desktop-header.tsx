import { Link } from "@tanstack/react-router";
import { LogIn, Search, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PageContainer } from "./page-container";

type DesktopHeaderProps = {
  readonly cartItemCount: number;
  readonly onLogin: () => void;
  readonly onOpenCart: () => void;
  readonly onSearch: () => void;
};

const navigationLinkClassName =
  "flex h-16 items-center px-3 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DesktopHeader({
  cartItemCount,
  onLogin,
  onOpenCart,
  onSearch,
}: DesktopHeaderProps) {
  return (
    <header className="hidden md:block">
      <PageContainer>
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b">
          <Link
            to="/"
            aria-label="Kurio — página inicial"
            className="justify-self-start text-xs font-bold tracking-[0.28em]"
          >
            KURIO
          </Link>

          <nav aria-label="Navegação principal">
            <ul className="flex items-center">
              <li>
                <Link
                  to="/"
                  className={cn(
                    navigationLinkClassName,
                    "relative text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary after:content-['']",
                  )}
                >
                  Início
                </Link>
              </li>

              <li>
                <a
                  href="#catalog"
                  className={navigationLinkClassName}
                >
                  Mercado
                </a>
              </li>

              <li>
                <a
                  href="#creators"
                  className={navigationLinkClassName}
                >
                  Criadores
                </a>
              </li>

              <li>
                <a
                  href="#journal"
                  className={navigationLinkClassName}
                >
                  Aprenda
                </a>
              </li>
            </ul>
          </nav>

          <div className="flex items-center justify-self-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Buscar NFTs"
              onClick={onSearch}
            >
              <Search aria-hidden="true" />
            </Button>

            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Abrir carrinho com ${cartItemCount} ${cartItemCount === 1 ? "item" : "itens"}`}
                onClick={onOpenCart}
              >
                <ShoppingCart aria-hidden="true" />
              </Button>

              {cartItemCount > 0 && (
                <span
                  className="pointer-events-none absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[0.625rem] font-bold leading-none text-primary-foreground"
                  aria-hidden="true"
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </div>

            <Button
              type="button"
              className="ml-2 px-4"
              onClick={onLogin}
            >
              <LogIn
                data-icon="inline-start"
                aria-hidden="true"
              />
              Entrar
            </Button>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
