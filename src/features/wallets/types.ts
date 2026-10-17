export const walletNetworkOptions = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "solana", label: "Solana" },
] as const;

export const walletProviderOptions = [
  { value: "metamask", label: "MetaMask" },
  { value: "walletconnect", label: "WalletConnect" },
  { value: "coinbase", label: "Coinbase Wallet" },
] as const;

export type WalletNetwork =
  (typeof walletNetworkOptions)[number]["value"];

export type WalletProvider =
  (typeof walletProviderOptions)[number]["value"];

export type WalletConnectionStatus =
  | "connected"
  | "disconnected";

export type WalletConnectionScenario =
  | "success"
  | "rejected";

export type ConnectWalletInput = {
  readonly network: WalletNetwork;
  readonly provider: WalletProvider;
  readonly scenario?: WalletConnectionScenario;
};

export type CollectorWallet = {
  readonly id: string;
  readonly label: string;
  readonly network: WalletNetwork;
  readonly profileName: string;
  readonly address: string;
  readonly ensName: string;
  readonly provider: WalletProvider;
  readonly referralCode: string;
  readonly email: string;
  readonly isPrimary: boolean;
  readonly connectionStatus: WalletConnectionStatus;
  readonly version: number;
};

export type SaveWalletInput = {
  readonly label: string;
  readonly network: WalletNetwork;
  readonly profileName: string;
  readonly address: string;
  readonly ensName: string;
  readonly provider: WalletProvider;
  readonly referralCode: string;
  readonly email: string;
  readonly isPrimary: boolean;
};

export type WalletsResponse = {
  readonly items: readonly CollectorWallet[];
};

export type WalletFieldErrors = Partial<
  Record<keyof SaveWalletInput, string>
>;

export type WalletErrorResponse = {
  readonly message: string;
  readonly fieldErrors?: WalletFieldErrors;
};
