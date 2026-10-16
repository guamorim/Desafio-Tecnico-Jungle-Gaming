import { useState, type FormEvent } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

import { saveWalletMutationOptions } from "../mutations/save-wallet-mutation";
import type {
  CollectorWallet,
  SaveWalletInput,
  WalletFieldErrors,
  WalletNetwork,
  WalletProvider,
} from "../types";
import {
  walletNetworkOptions,
  walletProviderOptions,
} from "../types";
import { getWalletErrorResponse } from "../wallet-error";

type WalletFormProps = {
  readonly defaultEmail: string;
  readonly defaultProfileName: string;
  readonly isPrimary: boolean;
  readonly userId: string;
  readonly wallet?: CollectorWallet;
};

type WalletFieldProps = {
  readonly error?: string;
  readonly id: string;
  readonly label: string;
  readonly maxLength?: number;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly type?: "email" | "text";
  readonly value: string;
};

const fieldClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

function WalletField({
  error,
  id,
  label,
  maxLength,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: WalletFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold">
        {label}
        {required && (
          <span aria-hidden="true" className="text-primary">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={fieldClassName}
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

export function WalletForm({
  defaultEmail,
  defaultProfileName,
  isPrimary,
  userId,
  wallet,
}: WalletFormProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    saveWalletMutationOptions(queryClient, userId),
  );
  const prefix = isPrimary
    ? "primary-wallet"
    : "secondary-wallet";
  const [label, setLabel] = useState(
    wallet?.label ??
      (isPrimary ? "Carteira principal" : "Carteira secundária"),
  );
  const [network, setNetwork] =
    useState<WalletNetwork>(
      wallet?.network ?? "ethereum",
    );
  const [profileName, setProfileName] = useState(
    wallet?.profileName ?? defaultProfileName,
  );
  const [address, setAddress] = useState(
    wallet?.address ?? "",
  );
  const [ensName, setEnsName] = useState(
    wallet?.ensName ?? "",
  );
  const [provider, setProvider] =
    useState<WalletProvider>(
      wallet?.provider ?? "metamask",
    );
  const [referralCode, setReferralCode] = useState(
    wallet?.referralCode ?? "",
  );
  const [email, setEmail] = useState(
    wallet?.email ?? defaultEmail,
  );
  const [showSuccess, setShowSuccess] =
    useState(false);
  const errorResponse = getWalletErrorResponse(
    mutation.error,
  );
  const fieldErrors: WalletFieldErrors | undefined =
    errorResponse?.fieldErrors;

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setShowSuccess(false);

    const input = {
      label,
      network,
      profileName,
      address,
      ensName,
      provider,
      referralCode,
      email,
      isPrimary,
    } satisfies SaveWalletInput;

    mutation.mutate(
      {
        walletId: wallet?.id,
        input,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
        },
      },
    );
  }

  const title = isPrimary
    ? "Carteira principal"
    : "Carteira secundária";

  return (
    <section
      className="rounded-3xl border bg-card p-4 shadow-sm md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent md:p-0 md:pb-9 md:shadow-none"
      aria-labelledby={`${prefix}-title`}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${prefix}-title`} className="font-bold">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isPrimary
              ? "Edite os dados da carteira usada como padrão no checkout."
              : "Cadastre uma segunda carteira para escolher durante o pagamento."}
          </p>
        </div>

        {wallet && (
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            {wallet.connectionStatus === "connected"
              ? "Conectada"
              : "Desconectada"}
          </span>
        )}
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <WalletField
            id={`${prefix}-label`}
            label="Apelido da carteira"
            required
            maxLength={40}
            value={label}
            error={fieldErrors?.label}
            onChange={setLabel}
          />

          <WalletField
            id={`${prefix}-profile-name`}
            label="Nome do perfil"
            required
            maxLength={60}
            value={profileName}
            error={fieldErrors?.profileName}
            onChange={setProfileName}
          />

          <div className="space-y-1.5">
            <label
              htmlFor={`${prefix}-network`}
              className="text-xs font-bold"
            >
              Rede<span aria-hidden="true" className="text-primary">*</span>
            </label>
            <select
              id={`${prefix}-network`}
              value={network}
              className={fieldClassName}
              onChange={(event) => {
                setNetwork(
                  event.currentTarget.value as WalletNetwork,
                );
              }}
            >
              {walletNetworkOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <WalletField
            id={`${prefix}-address`}
            label="Endereço da carteira"
            required
            maxLength={100}
            value={address}
            placeholder={
              network === "solana"
                ? "Endereço Solana"
                : "0x..."
            }
            error={fieldErrors?.address}
            onChange={setAddress}
          />

          <div className="space-y-1.5">
            <label
              htmlFor={`${prefix}-provider`}
              className="text-xs font-bold"
            >
              Tipo de carteira<span aria-hidden="true" className="text-primary">*</span>
            </label>
            <select
              id={`${prefix}-provider`}
              value={provider}
              className={fieldClassName}
              onChange={(event) => {
                setProvider(
                  event.currentTarget.value as WalletProvider,
                );
              }}
            >
              {walletProviderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <WalletField
            id={`${prefix}-ens`}
            label="Nome ENS (opcional)"
            maxLength={67}
            value={ensName}
            placeholder="nome.eth"
            error={fieldErrors?.ensName}
            onChange={setEnsName}
          />

          <WalletField
            id={`${prefix}-email`}
            label="E-mail"
            type="email"
            required
            value={email}
            error={fieldErrors?.email}
            onChange={setEmail}
          />

          <WalletField
            id={`${prefix}-referral-code`}
            label="Código de indicação (opcional)"
            maxLength={32}
            value={referralCode}
            error={fieldErrors?.referralCode}
            onChange={setReferralCode}
          />
        </div>

        {mutation.isError && !fieldErrors && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm"
          >
            {errorResponse?.message ??
              "Não foi possível salvar a carteira."}
          </p>
        )}

        {showSuccess && (
          <p
            role="status"
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm"
          >
            {title} salva com sucesso.
          </p>
        )}

        <Button
          type="submit"
          className="h-10 w-full px-6 sm:w-auto"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? "Salvando..."
            : wallet
              ? "Salvar carteira"
              : `Adicionar ${isPrimary ? "principal" : "secundária"}`}
        </Button>
      </form>
    </section>
  );
}
