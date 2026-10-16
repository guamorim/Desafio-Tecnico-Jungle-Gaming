import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProfileAccessRequiredProps = {
  readonly description?: string;
  readonly title?: string;
  readonly onLogin: () => void;
};

export function ProfileAccessRequired({
  description = "Seus dados pessoais e configurações são privados.",
  title = "Entre para acessar seu perfil",
  onLogin,
}: ProfileAccessRequiredProps) {
  return (
    <section className="grid min-h-[60svh] place-items-center py-16 text-center">
      <div className="max-w-md space-y-5">
        <span className="mx-auto grid size-14 place-items-center rounded-full border bg-card text-primary">
          <LockKeyhole aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          type="button"
          className="h-10 px-6"
          onClick={onLogin}
        >
          Entrar
        </Button>
      </div>
    </section>
  );
}
