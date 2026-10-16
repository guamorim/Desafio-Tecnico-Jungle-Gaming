import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export function CartEmptyState() {
  return (
    <section className="grid min-h-[55svh] place-items-center py-16 text-center">
      <div className="max-w-md space-y-5">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-card text-primary">
          <ShoppingCart
            className="size-7"
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Seu carrinho está vazio
          </h2>
          <p className="text-muted-foreground">
            Explore o mercado e escolha uma edição para começar sua coleção.
          </p>
        </div>

        <Link
          to="/"
          search={{}}
          hash="catalog"
          className={buttonVariants()}
        >
          Explorar NFTs
        </Link>
      </div>
    </section>
  );
}
