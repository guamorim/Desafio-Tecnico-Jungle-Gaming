import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { SocialLoginButtons } from "./social-login-buttons";

export type AuthMode = "login" | "register";

type AuthDialogProps = {
  readonly mode: AuthMode;
  readonly open: boolean;
  readonly onModeChange: (mode: AuthMode) => void;
  readonly onOpenChange: (open: boolean) => void;
};

export function AuthDialog({
  mode,
  open,
  onModeChange,
  onOpenChange,
}: AuthDialogProps) {
  function handleAuthenticated() {
    onOpenChange(false);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-[2px] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />

        <Dialog.Popup className="fixed inset-4 z-50 mx-auto max-w-md overflow-y-auto rounded-3xl border bg-card p-6 text-card-foreground shadow-2xl transition duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[calc(100dvh-3rem)] md:w-[26rem] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl">
          <Dialog.Close
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-4 top-4"
              />
            }
          >
            <X aria-hidden="true" />
            <span className="sr-only">
              Fechar autenticação
            </span>
          </Dialog.Close>

          <p className="mb-8 text-center text-lg font-bold tracking-[0.22em] md:hidden">
            KURIO
          </p>

          <Dialog.Title className="text-center text-base font-bold">
            {mode === "login"
              ? "Entrar"
              : "Criar perfil de colecionador"}
          </Dialog.Title>

          <Dialog.Description className="mt-2 text-center text-xs text-muted-foreground">
            {mode === "login"
              ? "Entre para gerenciar sua carteira, coleção e perfil." 
              : "Crie sua conta de colecionador para começar."}
          </Dialog.Description>

          <div
            className="my-5 grid grid-cols-2 rounded-lg border bg-background p-1"
            aria-label="Escolher autenticação"
          >
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-2 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={mode === "login"}
              onClick={() => {
                onModeChange("login");
              }}
            >
              Entrar
            </button>

            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-2 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === "register"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={mode === "register"}
              onClick={() => {
                onModeChange("register");
              }}
            >
              Criar conta
            </button>
          </div>

          {mode === "login" ? (
            <LoginForm
              onAuthenticated={handleAuthenticated}
            />
          ) : (
            <RegisterForm
              onAuthenticated={handleAuthenticated}
            />
          )}

          <div className="mt-5">
            <SocialLoginButtons />
          </div>

          <button
            type="button"
            className="mx-auto mt-5 block text-xs text-muted-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            onClick={() => {
              onModeChange(
                mode === "login"
                  ? "register"
                  : "login",
              );
            }}
          >
            {mode === "login"
              ? "Novo na Kurio? Crie uma conta"
              : "Já tem uma conta? Entre"}
          </button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
