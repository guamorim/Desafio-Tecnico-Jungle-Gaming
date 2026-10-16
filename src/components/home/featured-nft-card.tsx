export function FeaturedNftCard() {
  return (
    <article className="overflow-hidden rounded-xl bg-card">
      <header className="space-y-1 p-5 text-center uppercase">
        <p className="font-bold text-primary">
          NFT em destaque
        </p>
        <h3 className="text-sm font-bold">
          Oferta limitada
        </h3>
      </header>

      <img
        src="/images/nfts/midnight-totem.webp"
        alt="Midnight Totem, NFT em destaque"
        width={480}
        height={480}
        loading="lazy"
        decoding="async"
        className="aspect-square w-full object-cover"
      />
    </article>
  );
}
