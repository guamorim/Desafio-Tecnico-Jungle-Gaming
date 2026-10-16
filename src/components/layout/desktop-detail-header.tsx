import { Link } from "@tanstack/react-router";
import {
  LogIn,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";

import { PageContainer } from "./page-container";

type DesktopDetailHeaderProps = {
  readonly activeItem?: "home" | "market";
  readonly cartItemCount: number;
};

const navigationClassName =
  "flex h-16 items-center px-3 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

export function DesktopDetailHeader({
  activeItem = "market",
  cartItemCount,
}: DesktopDetailHeaderProps) {
  const { session, openLogin } = useAuth();

  return (
    <header className="hidden md:block">
      <PageContainer>
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b">
          <Link
            to="/"
            search={{}}
            aria-label="Kurio — página inicial"
            className="justify-self-start text-xs font-bold tracking-[0.28em] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            KURIO
          </Link>

          <nav aria-label="Navegação principal">
            <ul className="flex items-center">
              <li>
                <Link
                  to="/"
                  search={{}}
                  className={`${navigationClassName} ${activeItem === "home" ? "relative font-bold text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary after:content-['']" : ""}`}
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  search={{}}
                  hash="catalog"
                  className={`${navigationClassName} ${activeItem === "market" ? "relative font-bold text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary after:content-['']" : ""}`}
                >
                  Mercado
                </Link>
              </li>
              <li>
                <span
                  className={`${navigationClassName} cursor-not-allowed opacity-60`}
                  aria-disabled="true"
                >
                  Criadores
                </span>
              </li>
              <li>
                <span
                  className={`${navigationClassName} cursor-not-allowed opacity-60`}
                  aria-disabled="true"
                >
                  Aprenda
                </span>
              </li>
            </ul>
          </nav>

          <div className="flex items-center justify-self-end gap-2">
            <Link
              to="/"
              search={{}}
              aria-label="Buscar NFTs no mercado"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search aria-hidden="true" className="size-4" />
            </Link>

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

            {session ? (
              <Link
                to="/profile"
                className={buttonVariants({
                  variant: "outline",
                })}
              >
                <UserRound aria-hidden="true" />
                <span className="max-w-32 truncate">
                  {session.user.displayName}
                </span>
              </Link>
            ) : (
              <Button
                type="button"
                onClick={openLogin}
              >
                <LogIn aria-hidden="true" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
