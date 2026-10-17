import { Button } from "@/components/ui/button";

export function SocialLoginButtons() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>Ou continue com</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled
        title="Autenticação com Google indisponível"
        aria-label="Autenticação com Google indisponível"
      >
        <span
          aria-hidden="true"
          className="font-bold text-primary"
        >
          G
        </span>
        Continuar com Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled
        title="Autenticação com Facebook indisponível"
        aria-label="Autenticação com Facebook indisponível"
      >
        <span
          aria-hidden="true"
          className="font-bold text-primary"
        >
          f
        </span>
        Continuar com Facebook
      </Button>
    </div>
  );
}
