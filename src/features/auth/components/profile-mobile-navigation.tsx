import { Link } from "@tanstack/react-router";
import {
  Heart,
  UserRound,
  WalletCards,
} from "lucide-react";

type ProfileMobileNavigationProps = {
  readonly activeItem: "profile" | "wallets" | "favorites";
};

const items = [
  {
    id: "profile",
    label: "Perfil",
    to: "/profile",
    icon: UserRound,
  },
  {
    id: "wallets",
    label: "Carteiras",
    to: "/wallets",
    icon: WalletCards,
  },
  {
    id: "favorites",
    label: "Favoritos",
    to: "/favorites",
    icon: Heart,
  },
] as const;

export function ProfileMobileNavigation({
  activeItem,
}: ProfileMobileNavigationProps) {
  return (
    <nav
      aria-label="Navegação da conta"
      className="mb-7 grid grid-cols-3 gap-2 rounded-2xl border bg-card p-2 md:hidden"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === activeItem;

        return (
          <Link
            key={item.id}
            to={item.to}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[0.6875rem] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${isActive ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
