import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
      <section className="flex max-w-xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Jungle NFT Marketplace
        </h1>

        <Button size="lg" disabled>
          Marketplace coming soon
        </Button>
      </section>
    </main>
  );
}
