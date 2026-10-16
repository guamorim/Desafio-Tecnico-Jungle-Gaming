import { ArrowRight } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";

export function HomeHero() {
  return (
    <section
      className="pt-6 md:pt-8"
      aria-labelledby="home-hero-title"
    >
      <PageContainer>
        <div className="relative isolate grid min-h-96 grid-cols-[1.1fr_0.9fr] items-center gap-3 overflow-hidden rounded-[2rem] bg-card px-5 pb-12 pt-5 md:min-h-[400px] md:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] md:gap-12 md:rounded-none md:bg-transparent md:px-6 md:py-4 lg:px-8">
          <span
            className="pointer-events-none absolute -left-24 top-0 size-80 rounded-full bg-primary/20 md:hidden"
            aria-hidden="true"
          />

          <span
            className="pointer-events-none absolute left-1/4 top-0 size-96 rounded-full bg-primary/10 md:hidden"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <p className="mb-4 text-sm font-bold md:text-base">
              Bem-vindo à Kurio
            </p>

            <h1
              id="home-hero-title"
              className="text-[clamp(1.65rem,7vw,2.25rem)] font-bold uppercase leading-[1.45] tracking-tight md:max-w-2xl md:text-5xl md:leading-[1.6]"
            >
              Seja dono da{" "}
              <span className="md:hidden">
                cultura digital
              </span>
              <span className="hidden md:inline">
                futuro da arte digital
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
              <span className="md:hidden">
                Descubra NFTs selecionados de criadores do
                mundo todo.
              </span>

              <span className="hidden md:inline">
                Descubra NFTs selecionados de criadores
                emergentes e consagrados. Colecione arte
                digital rara, apoie artistas e faça parte da
                cultura da internet.
              </span>
            </p>

            <a
              href="#catalog"
              className="mt-4 inline-flex items-center gap-2 font-bold uppercase text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring md:mt-6 md:rounded-md md:bg-primary md:px-5 md:py-3 md:text-primary-foreground md:hover:bg-primary/80 md:hover:text-primary-foreground"
            >
              Explorar
              <ArrowRight
                className="size-5"
                aria-hidden="true"
              />
            </a>
          </div>

          <div className="relative z-10 justify-self-end md:w-full md:max-w-md">
            <img
              src="/images/nfts/aurora-ape.webp"
              alt="NFT de um personagem da coleção Jungle Genesis"
              width={640}
              height={640}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="aspect-square w-full rounded-3xl object-cover"
            />

            <img
              src="/images/nfts/midnight-totem.webp"
              alt=""
              width={192}
              height={192}
              decoding="async"
              className="absolute -bottom-4 -left-4 size-24 rounded-3xl border-4 border-card object-cover md:hidden"
            />
          </div>

          <div
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            aria-hidden="true"
          >
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary" />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
