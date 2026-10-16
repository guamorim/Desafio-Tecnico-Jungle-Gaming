import {
  useState,
  type FormEvent,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthErrorResponse } from "../auth-error";
import { updateProfileMutationOptions } from "../mutations/auth-mutations";
import type {
  AuthFieldErrors,
  AuthUser,
} from "../types";

type ProfileFormProps = {
  readonly user: AuthUser;
};

type ProfileTextFieldProps = {
  readonly autoComplete?: string;
  readonly error?: string;
  readonly id: string;
  readonly label: string;
  readonly maxLength?: number;
  readonly name: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly type?: "email" | "text";
  readonly value: string;
};

const inputClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive/30";

function ProfileTextField({
  autoComplete,
  error,
  id,
  label,
  maxLength,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: ProfileTextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-bold"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={name !== "ensName" && name !== "walletNickname"}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClassName}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function ProfileForm({
  user,
}: ProfileFormProps) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation(
    updateProfileMutationOptions(queryClient),
  );
  const [displayName, setDisplayName] = useState(
    user.displayName,
  );
  const [username, setUsername] = useState(
    user.username,
  );
  const [email, setEmail] = useState(user.email);
  const [ensName, setEnsName] = useState(
    user.ensName,
  );
  const [walletNickname, setWalletNickname] =
    useState(user.walletNickname);
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] =
    useState("");
  const [arePasswordsVisible, setArePasswordsVisible] =
    useState(false);
  const [showSuccess, setShowSuccess] =
    useState(false);
  const errorResponse = getAuthErrorResponse(
    updateMutation.error,
  );
  const fieldErrors: AuthFieldErrors | undefined =
    errorResponse?.fieldErrors;

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setShowSuccess(false);

    updateMutation.mutate(
      {
        displayName,
        username,
        email,
        ensName,
        walletNickname,
        currentPassword:
          currentPassword || undefined,
        newPassword:
          newPassword || undefined,
        newPasswordConfirmation:
          newPasswordConfirmation || undefined,
      },
      {
        onSuccess: (response) => {
          const updatedUser =
            response.session?.user;

          if (updatedUser) {
            setDisplayName(
              updatedUser.displayName,
            );
            setUsername(updatedUser.username);
            setEmail(updatedUser.email);
            setEnsName(updatedUser.ensName);
            setWalletNickname(
              updatedUser.walletNickname,
            );
          }

          setCurrentPassword("");
          setNewPassword("");
          setNewPasswordConfirmation("");
          setShowSuccess(true);
        },
      },
    );
  }

  const initials = user.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <section aria-labelledby="profile-title">
      <header className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-[0.18em] text-primary">
          Área privada
        </p>
        <h1
          id="profile-title"
          className="text-2xl font-bold"
        >
          Perfil do colecionador
        </h1>
      </header>

      <form
        className="space-y-8"
        onSubmit={handleSubmit}
      >
        <fieldset className="space-y-5">
          <legend className="mb-4 font-bold">
            Dados do perfil
          </legend>

          <div className="grid gap-5 lg:grid-cols-2">
            <ProfileTextField
              id="profile-display-name"
              name="displayName"
              label="Nome de exibição"
              autoComplete="name"
              maxLength={60}
              value={displayName}
              error={fieldErrors?.displayName}
              onChange={setDisplayName}
            />
            <ProfileTextField
              id="profile-username"
              name="username"
              label="Nome de usuário"
              autoComplete="username"
              maxLength={30}
              value={username}
              error={fieldErrors?.username}
              onChange={setUsername}
            />
            <ProfileTextField
              id="profile-email"
              name="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              error={fieldErrors?.email}
              onChange={setEmail}
            />
            <ProfileTextField
              id="profile-ens-name"
              name="ensName"
              label="Nome ENS"
              maxLength={67}
              value={ensName}
              placeholder="nome.eth"
              error={fieldErrors?.ensName}
              onChange={setEnsName}
            />
            <ProfileTextField
              id="profile-wallet-nickname"
              name="walletNickname"
              label="Apelido da carteira"
              maxLength={40}
              value={walletNickname}
              placeholder="Carteira principal"
              error={fieldErrors?.walletNickname}
              onChange={setWalletNickname}
            />

            <div className="space-y-2">
              <p className="text-xs font-bold">
                Avatar
              </p>
              <div className="flex h-11 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border bg-primary/10 text-xs font-bold text-primary">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : initials ? (
                    initials
                  ) : (
                    <UserRound aria-hidden="true" />
                  )}
                </span>
                <Button
                  type="button"
                  size="sm"
                  disabled
                  title="Upload de avatar no próximo passo"
                >
                  Alterar
                </Button>
                <button
                  type="button"
                  disabled
                  title="Remoção de avatar no próximo passo"
                  className="text-xs text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t pt-6">
          <legend className="pr-3 font-bold">
            Alterar senha
          </legend>
          <p className="text-xs text-muted-foreground">
            Deixe os três campos vazios para manter sua senha atual.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {(
              [
                {
                  id: "profile-current-password",
                  label: "Senha atual",
                  value: currentPassword,
                  error: fieldErrors?.currentPassword,
                  autoComplete: "current-password",
                  onChange: setCurrentPassword,
                },
                {
                  id: "profile-new-password",
                  label: "Nova senha",
                  value: newPassword,
                  error: fieldErrors?.newPassword,
                  autoComplete: "new-password",
                  onChange: setNewPassword,
                },
                {
                  id: "profile-new-password-confirmation",
                  label: "Confirmar nova senha",
                  value: newPasswordConfirmation,
                  error:
                    fieldErrors?.newPasswordConfirmation,
                  autoComplete: "new-password",
                  onChange: setNewPasswordConfirmation,
                },
              ] as const
            ).map((field) => (
              <div
                key={field.id}
                className="space-y-1.5"
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
                    type={
                      arePasswordsVisible
                        ? "text"
                        : "password"
                    }
                    autoComplete={field.autoComplete}
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
                      arePasswordsVisible
                        ? "Ocultar senhas"
                        : "Mostrar senhas"
                    }
                    onClick={() => {
                      setArePasswordsVisible(
                        (current) => !current,
                      );
                    }}
                  >
                    {arePasswordsVisible ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
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
          </div>
        </fieldset>

        {updateMutation.isError &&
          !fieldErrors && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm"
            >
              {errorResponse?.message ??
                "Não foi possível atualizar o perfil."}
            </p>
          )}

        {showSuccess && (
          <p
            role="status"
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm"
          >
            Perfil atualizado com sucesso.
          </p>
        )}

        <Button
          type="submit"
          className="h-10 w-full px-6 sm:w-auto"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending
            ? "Salvando..."
            : "Salvar alterações"}
        </Button>
      </form>
    </section>
  );
}
