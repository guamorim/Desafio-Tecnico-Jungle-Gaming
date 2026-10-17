import { Link } from "@tanstack/react-router";
import { Check, CircleAlert, Clock3, ExternalLink, ReceiptText } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { Order } from "../types";

type OrderReceiptProps = {
  readonly order: Order;
};

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function OrderReceipt({ order }: OrderReceiptProps) {
  const isPending = order.status === "pending";
  const isConfirmed = order.status === "confirmed";

  return (
    <article
      className="w-full max-w-xl overflow-hidden rounded-3xl border bg-card shadow-2xl md:rounded-lg"
      aria-live="polite"
    >
      <header className="border-b bg-primary/10 px-5 py-7 text-center md:px-8">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full border border-primary/50 bg-background text-primary">
          {isPending ? (
            <Clock3 className="size-7 animate-pulse" aria-hidden="true" />
          ) : isConfirmed ? (
            <Check className="size-7" aria-hidden="true" />
          ) : (
            <CircleAlert className="size-7" aria-hidden="true" />
          )}
        </span>
        <h1 className="text-xl font-bold">
          {isPending
            ? "Processando seu pedido"
            : isConfirmed
              ? "Seus NFTs agora estão na sua carteira"
              : "Pagamento recusado"}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {isPending
            ? "A confirmação simulada está sendo processada. Não feche esta página."
            : isConfirmed
              ? "A transação foi confirmada e registrada na rede simulada."
              : order.refusalReason ?? "A carteira não autorizou esta compra."}
        </p>
      </header>

      <div className="space-y-6 p-5 md:p-8">
        <dl className="grid gap-4 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Pedido</dt>
            <dd className="mt-1 break-all font-bold">{order.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Data</dt>
            <dd className="mt-1 font-bold">{formatOrderDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Carteira</dt>
            <dd className="mt-1 truncate font-bold">{order.wallet.label}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="mt-1 font-bold text-primary">{order.summary.totalEth} ETH</dd>
          </div>
        </dl>

        <section aria-labelledby="transaction-details-title">
          <h2 id="transaction-details-title" className="mb-3 flex items-center gap-2 font-bold">
            <ReceiptText className="size-4 text-primary" aria-hidden="true" />
            Detalhes da transação
          </h2>
          <ul className="space-y-3 border-y py-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <img src={item.imageUrl} alt="" className="size-12 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-xs">{item.name}</strong>
                  <span className="block text-[0.6875rem] text-muted-foreground">
                    {item.editionName} × {item.quantity}
                  </span>
                </span>
                <span className="text-xs font-bold text-primary">{item.lineTotalEth} ETH</span>
              </li>
            ))}
          </ul>
        </section>

        <dl className="space-y-2 text-xs">
          <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{order.summary.subtotalEth} ETH</dd></div>
          <div className="flex justify-between gap-4"><dt>Desconto</dt><dd>(-) {order.summary.discountEth} ETH</dd></div>
          <div className="flex justify-between gap-4"><dt>Taxa de rede</dt><dd>{order.summary.networkFeeEth} ETH</dd></div>
          <div className="flex justify-between gap-4 border-t pt-3 text-sm font-bold">
            <dt>Total</dt><dd className="text-primary">{order.summary.totalEth} ETH</dd>
          </div>
        </dl>

        {isConfirmed && order.transactionId && (
          <div className="space-y-3 text-center">
            <p className="break-all text-[0.6875rem] text-muted-foreground">
              ID da transação: {order.transactionId}
            </p>
            {order.explorerUrl && (
              <a
                href={order.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ className: "w-full" })}
              >
                Ver no Etherscan
                <ExternalLink aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        {order.status === "refused" && (
          <Link to="/checkout" search={{ scenario: "success" }} className={buttonVariants({ className: "w-full" })}>
            Tentar novamente
          </Link>
        )}

        {isConfirmed && (
          <Link to="/" search={{}} className={buttonVariants({ variant: "outline", className: "w-full" })}>
            Continuar explorando
          </Link>
        )}
      </div>

      <div className="h-1 bg-primary" aria-hidden="true" />
    </article>
  );
}
