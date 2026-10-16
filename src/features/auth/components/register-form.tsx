import {
  useState,
  type FormEvent,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthErrorResponse } from "../auth-error";
import { registerMutationOptions } from "../mutations/auth-mutations";

type RegisterFormProps = {
  readonly onAuthenticated: () => void;
};

const inputClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive/30";

export function RegisterForm({
  onAuthenticated,
}: RegisterFormProps) {
  const queryClient = useQueryClient();
  const registerMutation = useMutation(
    registerMutationOptions(queryClient),
  );
  const [displayName, setDisplayName] =
    useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);
  const errorResponse = getAuthErrorResponse(
    registerMutation.error,
  );
  const fieldErrors = errorResponse?.fieldErrors;

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    registerMutation.mutate(
      {
        displayName,
        email,
        password,
        passwordConfirmation,
      },
      { onSuccess: onAuthenticated },
    );
  }

  function renderPasswordToggle() {
    return isPasswordVisible ? (
      <EyeOff aria-hidden="true" />
    ) : (
      <Eye aria-hidden="true" />
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit}
    >
      <div className="space-y-1">
        <label
          htmlFor="auth-register-name"
          className="text-xs font-bold"
        >
          Nome de usuário
        </label>
        <input
          id="auth-register-name"
          name="displayName"
          autoComplete="name"
          autoFocus
          required
          minLength={2}
          maxLength={60}
          value={displayName}
          placeholder="Nome de usuário"
          aria-invalid={Boolean(fieldErrors?.displayName)}
          aria-describedby={
            fieldErrors?.displayName
              ? "auth-register-name-error"
              : undefined
          }
          className={inputClassName}
          onChange={(event) => {
            setDisplayName(
              event.currentTarget.value,
            );
          }}
        />
        {fieldErrors?.displayName && (
          <p
            id="auth-register-name-error"
            className="text-xs text-destructive"
          >
            {fieldErrors.displayName}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="auth-register-email"
          className="text-xs font-bold"
        >
          E-mail
        </label>
        <input
          id="auth-register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          placeholder="Digite seu e-mail"
          aria-invalid={Boolean(fieldErrors?.email)}
          aria-describedby={
            fieldErrors?.email
              ? "auth-register-email-error"
              : undefined
          }
          className={inputClassName}
          onChange={(event) => {
            setEmail(event.currentTarget.value);
          }}
        />
        {fieldErrors?.email && (
          <p
            id="auth-register-email-error"
            className="text-xs text-destructive"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {(
        [
          {
            id: "auth-register-password",
            label: "Senha",
            name: "password",
            value: password,
            error: fieldErrors?.password,
            autoComplete: "new-password",
            onChange: setPassword,
          },
          {
            id: "auth-register-password-confirmation",
            label: "Confirmar senha",
            name: "passwordConfirmation",
            value: passwordConfirmation,
            error: fieldErrors?.passwordConfirmation,
            autoComplete: "new-password",
            onChange: setPasswordConfirmation,
          },
        ] as const
      ).map((field) => (
        <div
          key={field.id}
          className="space-y-1"
        >
          <label
            htmlFor={field.id}
            className="text-xs font-bold"
          >
            {field.label}
          </label>
          <div className="relative">
            <input
              id={field.id}
              name={field.name}
              type={
                isPasswordVisible
                  ? "text"
                  : "password"
              }
              autoComplete={field.autoComplete}
              required
              minLength={8}
              value={field.value}
              aria-invalid={Boolean(field.error)}
              aria-describedby={
                field.error
                  ? `${field.id}-error`
                  : undefined
              }
              className={`${inputClassName} pr-11`}
              onChange={(event) => {
                field.onChange(
                  event.currentTarget.value,
                );
              }}
            />
            <button
              type="button"
              className="absolute right-0 top-0 grid size-11 place-items-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={
                isPasswordVisible
                  ? "Ocultar senhas"
                  : "Mostrar senhas"
              }
              onClick={() => {
                setIsPasswordVisible(
                  (current) => !current,
                );
              }}
            >
              {renderPasswordToggle()}
            </button>
          </div>
          {field.error && (
            <p
              id={`${field.id}-error`}
              className="text-xs text-destructive"
            >
              {field.error}
            </p>
          )}
        </div>
      ))}

      {registerMutation.isError &&
        !fieldErrors && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-foreground"
          >
            {errorResponse?.message ??
              "Não foi possível criar a conta. Tente novamente."}
          </p>
        )}

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending
          ? "Criando perfil..."
          : "Criar perfil"}
      </Button>
    </form>
  );
}
