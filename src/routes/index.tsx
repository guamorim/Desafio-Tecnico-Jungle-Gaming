import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="grid min-h-svh place-items-center bg-neutral-950 px-6 text-white">
      <h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
        Jungle NFT Marketplace
      </h1>
    </main>
  );
}
