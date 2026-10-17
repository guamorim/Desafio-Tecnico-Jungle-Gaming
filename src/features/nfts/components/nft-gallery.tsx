import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

import type { NftEdition } from "../types";

type NftGalleryProps = {
  readonly editions: readonly NftEdition[];
  readonly images: readonly string[];
  readonly nftName: string;
  readonly onEditionChange: (editionId: string) => void;
  readonly selectedEditionId: string;
};

export function NftGallery({
  editions,
  images,
  nftName,
  onEditionChange,
  selectedEditionId,
}: NftGalleryProps) {
  const fallbackImage = images[0];
  const galleryItems = [...editions]
    .reverse()
    .map((edition, index) => ({
      edition,
      image: images[index] ?? fallbackImage,
    }));
  const activeItem =
    galleryItems.find(
      ({ edition }) => edition.id === selectedEditionId,
    ) ?? galleryItems[0];
  const activeImage = activeItem?.image;

  if (!activeImage) {
    return null;
  }

  return (
    <div className="md:grid md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-5">
      <div className="hidden space-y-3 md:block">
        {galleryItems.map(({ edition, image }, index) => (
          <button
            key={edition.id}
            type="button"
            aria-label={`Selecionar edição ${edition.name}, imagem ${index + 1} de ${nftName}`}
            aria-pressed={edition.id === activeItem.edition.id}
            className={cn(
              "aspect-square w-full overflow-hidden rounded-lg border-2 bg-muted outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              edition.id === activeItem.edition.id
                ? "border-primary"
                : "border-transparent hover:border-primary/60",
            )}
            onClick={() => onEditionChange(edition.id)}
          >
            <img
              src={image}
              alt=""
              width={144}
              height={144}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="size-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="relative aspect-square overflow-hidden rounded-t-[1.75rem] bg-muted md:rounded-xl md:border md:bg-card md:p-4">
        <img
          src={activeImage}
          alt={`Obra ${nftName}`}
          width={960}
          height={960}
          decoding="async"
          fetchPriority="high"
          className="size-full object-cover md:rounded-lg"
        />

        <a
          href={activeImage}
          target="_blank"
          rel="noreferrer"
          aria-label="Abrir imagem em tamanho completo"
          className="absolute right-6 top-6 hidden size-9 place-items-center rounded-full border bg-background/80 text-foreground backdrop-blur outline-none hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring md:grid"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </div>
    </div>
  );
}
