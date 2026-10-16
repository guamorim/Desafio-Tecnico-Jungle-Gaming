import { ArrowRight } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

const diaryArticles = [
  {
    title: "Como funciona a propriedade de NFTs",
    description:
      "Aprenda a colecionar, negociar e verificar ativos digitais.",
    date: "12 de setembro",
    readingTime: "Leitura de 6 min",
    image: "/images/nfts/cyber-tiger.webp",
  },
  {
    title: "10 artistas digitais para acompanhar",
    description:
      "Conheça criadores que moldam a cultura digital.",
    date: "13 de setembro",
    readingTime: "Leitura de 2 min",
    image: "/images/nfts/aurora-ape.webp",
  },
  {
    title: "Raridade, atributos e procedência",
    description:
      "Entenda raridade, metadados e direitos autorais.",
    date: "15 de setembro",
    readingTime: "Leitura de 3 min",
    image: "/images/nfts/midnight-totem.webp",
  },
  {
    title: "Como proteger sua carteira",
    description:
      "Proteja sua carteira, seus ativos e sua identidade.",
    date: "15 de setembro",
    readingTime: "Leitura de 2 min",
    image: "/images/nfts/ether-bloom.webp",
  },
] as const;

export function HomeEditorialSections() {
  return (
    <PageContainer className="pb-16 md:pb-24">
      <section
        className="grid gap-5 md:grid-cols-2"
        aria-label="Destaques editoriais"
      >
        <PromoPanel
          image="/images/nfts/aurora-ape.webp"
          title="Lançamentos gênesis de edição limitada"
          description="Colecione edições escassas diretamente dos criadores antes da revelação pública."
        />
        <PromoPanel
          image="/images/nfts/cyber-tiger.webp"
          title="Arte digital selecionada e muito mais"
          description="Explore novos artistas, coleções verificadas e obras digitais que definem a cultura."
        />
      </section>

      <section
        className="mt-16 md:mt-24"
        aria-labelledby="minting-diary-title"
      >
        <header className="mx-auto mb-8 max-w-3xl text-center">
          <h2
            id="minting-diary-title"
            className="text-2xl font-bold md:text-3xl"
          >
            Diário da Cunhagem
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {diaryArticles.map((article) => (
            <article
              key={article.title}
              className="overflow-hidden rounded-xl bg-card"
            >
              <img
                src={article.image}
                alt=""
                width={480}
                height={320}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />

              <div className="space-y-3 p-4">
                <p className="text-[0.7rem] font-bold text-muted-foreground">
                  {article.date} · {article.readingTime}
                </p>
                <h3 className="font-bold leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {article.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Ler mais
                  <ArrowRight aria-hidden="true" className="size-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}

type PromoPanelProps = {
  readonly description: string;
  readonly image: string;
  readonly title: string;
};

function PromoPanel({
  description,
  image,
  title,
}: PromoPanelProps) {
  const imageElement = (
    <img
      src={image}
      alt=""
      width={480}
      height={360}
      loading="lazy"
      decoding="async"
      className="h-full min-h-56 w-full object-cover"
    />
  );

  return (
    <article className="grid overflow-hidden rounded-xl bg-card sm:grid-cols-2">
      {imageElement}

      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-bold leading-snug">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-4"
          title="Conteúdo demonstrativo"
        >
          Explorar
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
