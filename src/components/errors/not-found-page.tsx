import { Link } from "@tanstack/react-router";
import { ArrowLeft, SearchX } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main
      id="main-content"
      className="grid min-h-[70svh] place-items-center py-16 text-foreground"
    >
      <PageContainer>
        <section
          aria-labelledby="not-found-title"
          className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border bg-card px-6 py-14 text-center shadow-sm md:px-12"
        >
          <div
            className="mb-6 grid size-16 place-items-center rounded-full border border-primary/35 bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <SearchX className="size-7" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Erro 404
          </p>
          <h1
            id="not-found-title"
            className="mt-3 text-3xl font-bold tracking-tight md:text-4xl"
          >
            Página não encontrada
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
            O endereço acessado não existe ou deixou de fazer parte do mercado.
            Volte ao início para continuar explorando os NFTs.
          </p>

          <Link
            to="/"
            className={buttonVariants({
              size: "lg",
              className: "mt-8 h-11 rounded-xl px-5",
            })}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Voltar ao mercado
          </Link>
        </section>
      </PageContainer>
    </main>
  );
}
