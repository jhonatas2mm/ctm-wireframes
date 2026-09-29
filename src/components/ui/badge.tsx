import type * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Tom semântico do status (Tags do DS SENAI), igual em todo o protótipo. Só tem efeito visual com html.ds-senai (src/index.css).
// verde = concluído/positivo · azul = em curso · laranja = aguardando/atenção · vermelho = negativo · cinza = inicial/encerrado.
// Badge padrão com texto fora desta lista fica cinza (nunca na cor principal).
const tones: Record<string, "green" | "blue" | "orange" | "red" | "gray"> = {
  Pronta: "green", Criada: "green", "Em planejamento": "blue", "Em criação": "blue", "Em avaliação do tutor": "orange", "Parametrizar avaliações": "orange", "Não criada": "gray",
  Vigente: "green", Ativo: "green", Ativa: "green", Aceito: "green", Aceita: "green", Aprovado: "green", Aprovada: "green", Validado: "green", Integrada: "green", "Em dia": "green", Criou: "green", Aceitou: "green",
  "Em andamento": "blue", Encaminhado: "blue", "Em negociação": "blue", "A iniciar": "blue", "Aceita pelo contratante": "blue", Anexou: "blue", Exportou: "blue", Transferido: "blue",
  "Em análise": "orange", "Em risco": "orange", "Buscar tutor": "orange", Retornado: "orange", Aguardando: "orange", Editou: "orange", Trancado: "orange",
  Recusada: "red", Recusado: "red", Reprovado: "red", Reprovada: "red", Evadido: "red", Desistente: "red", Excluiu: "red", Recusou: "red",
  Rascunho: "gray", "Em elaboração": "gray", Encerrado: "gray", Finalizada: "gray", Inativo: "gray", Inativa: "gray", Cancelado: "gray", Cancelada: "gray", "Não integrada": "gray", Login: "gray", Logout: "gray", Visualizou: "gray",
}
const tomDe = (texto: string) => tones[texto] ?? (/^aguardando/i.test(texto) ? "orange" : undefined)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  // Texto do status: o filho string (ou o 1º filho string, ex.: "Aceito · vigência encerrada")
  const kids = Array.isArray(props.children) ? props.children : [props.children]
  const texto = kids.find((k): k is string => typeof k === "string")
  const tone = (texto && tomDe(texto)) || (variant === "default" ? "gray" : undefined)
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
        ...(tone && { "data-tone": tone }),
      } as React.ComponentProps<"span">,
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
