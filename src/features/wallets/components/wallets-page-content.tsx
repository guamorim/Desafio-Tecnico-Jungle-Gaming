import type { AuthUser } from "@/features/auth/types";

import type { WalletsResponse } from "../types";
import { WalletForm } from "./wallet-form";

type WalletsPageContentProps = {
  readonly user: AuthUser;
  readonly wallets: WalletsResponse;
};

export function WalletsPageContent({
  user,
  wallets,
}: WalletsPageContentProps) {
  const primaryWallet = wallets.items.find(
    (wallet) => wallet.isPrimary,
  );
  const secondaryWallet = wallets.items.find(
    (wallet) => !wallet.isPrimary,
  );

  return (
    <section aria-labelledby="wallets-title">
      <header className="mb-7 space-y-1">
        <p className="text-xs uppercase tracking-[0.18em] text-primary">
          Área privada
        </p>
        <h1
          id="wallets-title"
          className="text-2xl font-bold"
        >
          Carteiras do colecionador
        </h1>
      </header>

      <div className="space-y-9">
        <WalletForm
          userId={user.id}
          defaultEmail={user.email}
          defaultProfileName={user.displayName}
          isPrimary
          wallet={primaryWallet}
        />

        <WalletForm
          userId={user.id}
          defaultEmail={user.email}
          defaultProfileName={user.displayName}
          isPrimary={false}
          wallet={secondaryWallet}
        />
      </div>
    </section>
  );
}
