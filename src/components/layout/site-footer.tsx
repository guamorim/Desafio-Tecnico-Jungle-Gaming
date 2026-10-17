import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const benefits = [
  {
    initial: "W",
    title: "Segurança da carteira",
    description:
      "Proteja sua carteira e sua coleção de arte digital com segurança.",
  },
  {
    initial: "C",
    title: "Criadores em destaque",
    description:
      "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    initial: "D",
    title: "Alertas de lançamentos",
    description:
      "Receba calendários de cunhagem, novidades sobre listas de acesso e análises do mercado.",
  },
] as const;

const profileLinks = [
  "Meu perfil",
  "Minha coleção",
  "Atividade",
  "Estúdio do criador",
  "Lista de interesse",
] as const;

const helpLinks = [
  "Central de ajuda",
  "Como comprar NFTs",
  "Carteira e segurança",
  "Política do mercado",
  "Denunciar item",
] as const;

const collectionLinks = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Utilidade",
] as const;

const socialNetworks = [
  { label: "Facebook", initial: "f" },
  { label: "Instagram", initial: "ig" },
  { label: "Twitter", initial: "x" },
  { label: "LinkedIn", initial: "in" },
  { label: "YouTube", initial: "yt" },
] as const;

export function SiteFooter() {
  const [newsletterMessage, setNewsletterMessage] =
    useState("");

  function handleNewsletterSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    event.currentTarget.reset();
    setNewsletterMessage(
      "E-mail cadastrado para a demonstração.",
    );
  }

  return (
    <footer className="bg-card text-card-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 md:px-8 lg:px-10">
        <div className="grid gap-8 border-b pb-8 sm:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="space-y-3 xl:border-r xl:pr-7"
            >
              <div className="grid size-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                {benefit.initial}
              </div>
              <h2 className="font-bold">{benefit.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {benefit.description}
              </p>
            </article>
          ))}

          <section aria-labelledby="newsletter-title">
            <h2
              id="newsletter-title"
              className="font-bold leading-tight"
            >
              Antecipe-se ao próximo lançamento
            </h2>
            <form
              className="mt-4 flex"
              onSubmit={handleNewsletterSubmit}
            >
              <label htmlFor="footer-email" className="sr-only">
                Seu e-mail
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="digite seu e-mail..."
                className="min-w-0 flex-1 rounded-l-md border bg-background/40 px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" className="rounded-l-none">
                Enviar
              </Button>
            </form>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
            {newsletterMessage && (
              <p
                role="status"
                className="mt-2 text-xs text-primary"
              >
                {newsletterMessage}
              </p>
            )}
          </section>
        </div>

        <div className="grid gap-5 bg-accent/25 px-5 py-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/"
            search={{}}
            className="font-bold tracking-[0.18em] outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            KURIO
          </Link>
          <p>Feito para colecionadores e criadores digitais</p>
          <a
            href="mailto:contato@email.com"
            className="outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            contato@email.com
          </a>
          <a
            href="tel:+551140028922"
            className="outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            +55 11 4002 8922
          </a>
        </div>

        <div className="grid gap-9 border-b px-1 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterLinkGroup title="Meu perfil" links={profileLinks} />
          <FooterLinkGroup title="Central de ajuda" links={helpLinks} />
          <FooterLinkGroup title="Coleções" links={collectionLinks} />

          <section className="space-y-5">
            <div>
              <h2 className="font-bold">Redes sociais</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {socialNetworks.map(({ label, initial }) => (
                  <button
                    key={label}
                    type="button"
                    disabled
                    aria-label={`${label} — disponível em breve`}
                    title="Disponível em breve"
                    className="grid size-8 place-items-center rounded-md border border-primary text-primary disabled:opacity-70"
                  >
                    <span
                      aria-hidden="true"
                      className="text-[0.65rem] font-bold uppercase"
                    >
                      {initial}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-bold">Carteiras compatíveis</h2>
              <p className="mt-3 text-xs font-bold uppercase text-primary">
                MetaMask · WalletConnect · Coinbase
              </p>
            </div>
          </section>
        </div>

        <p className="pt-6 text-center text-xs text-muted-foreground">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  );
}

type FooterLinkGroupProps = {
  readonly links: readonly string[];
  readonly title: string;
};

function FooterLinkGroup({
  links,
  title,
}: FooterLinkGroupProps) {
  return (
    <nav aria-label={title}>
      <h2 className="font-bold">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link}>
            <span aria-disabled="true">{link}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
