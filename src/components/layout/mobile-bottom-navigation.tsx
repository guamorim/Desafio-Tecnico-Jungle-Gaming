import { Link } from "@tanstack/react-router";
import {
  Heart,
  Home,
  ScanLine,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/features/auth/use-auth";

type MobileBottomNavigationProps = {
  readonly cartItemCount: number;
};

const navigationItemClassName =
  "relative grid size-11 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring";

export function MobileBottomNavigation({
  cartItemCount,
}: MobileBottomNavigationProps) {
  const { session, openLogin } = useAuth();
  const isAuthenticated = Boolean(session);

  return (
    <nav
      aria-label="Navegação principal mobile"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="pointer-events-auto relative mx-auto grid min-h-20 max-w-md grid-cols-5 items-end rounded-[2rem] border bg-card px-3 pb-3 pt-5 shadow-2xl shadow-black/50">
        <Link
          to="/"
          search={{}}
          aria-label="Início"
          aria-current="page"
          className={`${navigationItemClassName} text-primary`}
        >
          <Home aria-hidden="true" />
        </Link>

        <button
          type="button"
          disabled
          aria-label="Favoritos — requer autenticação"
          title="Entre para acessar os favoritos"
          className={`${navigationItemClassName} cursor-not-allowed`}
        >
          <Heart aria-hidden="true" />
        </button>

        <div className="grid place-items-center">
          <span
            aria-hidden="true"
            className="grid size-16 -translate-y-4 place-items-center rounded-full border-8 border-background bg-primary text-primary-foreground shadow-lg"
          >
            <ScanLine className="size-7" />
          </span>
        </div>

        <Link
          to="/cart"
          aria-label={
            cartItemCount > 0
              ? `Carrinho com ${cartItemCount} unidades`
              : "Carrinho vazio"
          }
          className={navigationItemClassName}
        >
          <ShoppingCart aria-hidden="true" />

          {cartItemCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold leading-5 text-primary-foreground"
            >
              {cartItemCount > 99
                ? "99+"
                : cartItemCount}
            </span>
          )}
        </Link>

        {isAuthenticated ? (
          <Link
            to="/profile"
            aria-label="Abrir meu perfil"
            className={navigationItemClassName}
          >
            <UserRound aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Entrar para acessar o perfil"
            title="Entre para acessar o perfil"
            className={`${navigationItemClassName} cursor-pointer`}
            onClick={openLogin}
          >
            <UserRound aria-hidden="true" />
          </button>
        )}
      </div>
    </nav>
  );
}
