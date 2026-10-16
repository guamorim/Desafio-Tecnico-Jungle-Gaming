import {
  CircleHelp,
  Download,
  Heart,
  LogOut,
  Tag,
  UserRound,
  WalletCards,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type ProfileSidebarProps = {
  readonly activeItem?: "profile" | "wallets";
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
};

const disabledItems = [
  { label: "Ofertas", icon: Tag },
  { label: "Arquivos baixados", icon: Download },
  { label: "Suporte", icon: CircleHelp },
] as const;

export function ProfileSidebar({
  activeItem = "profile",
  isLoggingOut,
  onLogout,
}: ProfileSidebarProps) {
  return (
    <aside className="hidden border-r pr-5 md:block">
      <h2 className="mb-3 font-bold">
        Meu perfil
      </h2>

      <nav aria-label="Navegação do perfil">
        <ul className="space-y-1 text-xs">
          <li>
            <Link
              to="/profile"
              aria-current={
                activeItem === "profile"
                  ? "page"
                  : undefined
              }
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring ${activeItem === "profile" ? "bg-primary/10 font-bold text-primary" : "text-muted-foreground"}`}
            >
              <UserRound
                className="size-4"
                aria-hidden="true"
              />
              Dados do perfil
            </Link>
          </li>

          <li>
            <Link
              to="/wallets"
              aria-current={
                activeItem === "wallets"
                  ? "page"
                  : undefined
              }
              className={`flex items-center gap-2 rounded-md px-3 py-2.5 outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring ${activeItem === "wallets" ? "bg-primary/10 font-bold text-primary" : "text-muted-foreground"}`}
            >
              <WalletCards
                className="size-4"
                aria-hidden="true"
              />
              Carteiras
            </Link>
          </li>

          <li>
            <Link
              to="/favorites"
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-muted-foreground outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Heart
                className="size-4"
                aria-hidden="true"
              />
              Lista de interesse
            </Link>
          </li>

          {disabledItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <span
                  aria-disabled="true"
                  title="Disponível em breve"
                  className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2.5 text-muted-foreground opacity-60"
                >
                  <Icon
                    className="size-4"
                    aria-hidden="true"
                  />
                  {item.label}
                </span>
              </li>
            );
          })}

          <li className="border-t pt-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              <LogOut
                className="size-4"
                aria-hidden="true"
              />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
