import { Link } from "@tanstack/react-router";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

type NftDetailErrorProps = {
  readonly isNotFound: boolean;
  readonly onRetry: () => void;
};

export function NftDetailError({
  isNotFound,
  onRetry,
}: NftDetailErrorProps) {
  return (
    <section className="grid min-h-[70svh] place-items-center py-16 text-center">
      <div className="max-w-md space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {isNotFound ? "Erro 404" : "Falha na conexão"}
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          {isNotFound
            ? "NFT não encontrado"
            : "Não foi possível carregar o NFT"}
        </h1>

        <p className="text-muted-foreground">
          {isNotFound
            ? "Este item não existe ou deixou de fazer parte do mercado."
            : "Verifique sua conexão e tente novamente."}
        </p>

        {isNotFound ? (
          <Link to="/" className={buttonVariants()}>
            Voltar ao mercado
          </Link>
        ) : (
          <Button onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    </section>
  );
}
