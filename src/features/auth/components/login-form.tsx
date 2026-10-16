import {
  useState,
  type FormEvent,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthErrorResponse } from "../auth-error";
import { loginMutationOptions } from "../mutations/auth-mutations";

type LoginFormProps = {
  readonly onAuthenticated: () => void;
};

const inputClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive/30";

export function LoginForm({
  onAuthenticated,
}: LoginFormProps) {
  const queryClient = useQueryClient();
  const loginMutation = useMutation(
    loginMutationOptions(queryClient),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);
  const errorResponse = getAuthErrorResponse(
    loginMutation.error,
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    loginMutation.mutate(
      { email, password },
      { onSuccess: onAuthenticated },
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-1.5">
        <label
          htmlFor="auth-login-email"
          className="text-xs font-bold"
        >
          E-mail
        </label>
        <input
          id="auth-login-email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          placeholder="contato@email.com"
          className={inputClassName}
          onChange={(event) => {
            setEmail(event.currentTarget.value);
          }}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="auth-login-password"
          className="text-xs font-bold"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="auth-login-password"
            name="password"
            type={
              isPasswordVisible
                ? "text"
                : "password"
            }
            autoComplete="current-password"
            required
            value={password}
            className={`${inputClassName} pr-11`}
            onChange={(event) => {
              setPassword(
                event.currentTarget.value,
              );
            }}
          />

          <button
            type="button"
            className="absolute right-0 top-0 grid size-11 place-items-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={
              isPasswordVisible
                ? "Ocultar senha"
                : "Mostrar senha"
            }
            onClick={() => {
              setIsPasswordVisible(
                (current) => !current,
              );
            }}
          >
            {isPasswordVisible ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled
        title="Recuperação de senha indisponível"
        className="ml-auto block text-xs text-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        Esqueceu a senha?
      </button>

      {loginMutation.isError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-foreground"
        >
          {errorResponse?.message ??
            "Não foi possível entrar. Tente novamente."}
        </p>
      )}

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending
          ? "Entrando..."
          : "Entrar"}
      </Button>
    </form>
  );
}
