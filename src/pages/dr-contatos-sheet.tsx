import { Copy, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

// Contatos FICTÍCIOS de cada DR, gerados a partir da UF.
const CARGOS = ['Diretor(a) Regional', 'Gerente de Educação', 'Coordenador(a) de Credenciamento']
const NOMES = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Elisa Prado', 'Fábio Nunes']
export const contatosDr = (uf: string) => {
  const k = uf.charCodeAt(0) + uf.charCodeAt(1)
  return CARGOS.map((cargo, i) => ({
    nome: NOMES[(k + i) % NOMES.length],
    cargo,
    email: `${NOMES[(k + i) % NOMES.length].split(' ')[0].toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')}@senai${uf.toLowerCase()}.org.br`,
    telefone: `(${String(10 + (k % 89))}) 3${String(k * 37 + i * 101).padStart(3, '0').slice(-3)}-${String(1000 + k * 13 + i * 7).slice(-4)}`,
  }))
}

function Linha({ icon: Icon, texto }: { icon: typeof Mail; texto: string }) {
  return (
    <p className="flex items-center gap-2 text-sm">
      <Icon className="text-muted-foreground size-3.5" /> <span className="flex-1">{texto}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Copiar ${texto}`}
        onClick={() => void navigator.clipboard.writeText(texto).catch(() => {})}
      >
        <Copy />
      </Button>
    </p>
  )
}

// Um bloco por DR com seus contatos.
function BlocoDr({ uf }: { uf: string }) {
  return (
    <section className="grid gap-3">
      <h3 className="font-semibold">SENAI-{uf}</h3>
      <ul className="grid gap-3">
        {contatosDr(uf).map((c) => (
          <li key={c.cargo} className="rounded-lg border p-3">
            <p className="font-medium">{c.nome}</p>
            <p className="text-muted-foreground text-xs">{c.cargo}</p>
            <div className="mt-2 grid">
              <Linha icon={Mail} texto={c.email} />
              <Linha icon={Phone} texto={c.telefone} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function DrContatosSheet({ ufs, titulo, onClose }: { ufs: string[] | null; titulo?: string; onClose: () => void }) {
  return (
    <Sheet open={!!ufs} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{titulo ?? 'Contatos dos DRs'}</SheetTitle>
          <SheetDescription>Pessoas de referência de cada DR credenciado.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 overflow-y-auto px-4 pb-6">
          {ufs?.map((uf) => <BlocoDr key={uf} uf={uf} />)}
        </div>
      </SheetContent>
    </Sheet>
  )
}
