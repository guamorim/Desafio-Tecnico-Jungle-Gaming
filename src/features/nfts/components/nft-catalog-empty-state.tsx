import { PackageOpen } from "lucide-react";

export function NftCatalogEmptyState() {
  return (
    <section
      className="rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center"
      aria-labelledby="nft-empty-state-title"
    >
      <PackageOpen
        className="mx-auto size-10 text-muted-foreground"
        aria-hidden="true"
      />

      <h2
        id="nft-empty-state-title"
        className="mt-4 text-xl font-semibold tracking-tight"
      >
        Nenhum NFT encontrado
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Não há itens digitais para exibir no momento.
      </p>
    </section>
  );
}
