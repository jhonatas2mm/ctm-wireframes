import { FileSpreadsheet, FileText, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Padrão de anexo no wireframe (um único arquivo; a área some depois de anexar): clicar na área já simula um arquivo anexado (sem seletor de arquivos).
//   <AttachField value={docs} onChange={setDocs} />
const exemplos = ['Plano de trabalho.pdf', 'Planilha de custos.xlsx', 'Ofício de solicitação.pdf', 'Termo de referência.docx', 'Cronograma.pdf']
// Tamanho fictício estável por nome
const tamanho = (n: string) => `${((([...n].reduce((t, c) => t + c.charCodeAt(0), 0) % 900) + 120) / 100).toFixed(1)} MB`

export function AttachField({ value, onChange, label = 'Anexar documento' }: { value: string[]; onChange: (v: string[]) => void; label?: string }) {
  const anexar = () => onChange([exemplos[0]])
  return (
    <div className="grid gap-2">
      {value.length === 0 && (
      <button
        type="button"
        onClick={anexar}
        className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-left transition-colors hover:border-foreground/40 hover:bg-muted/50"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Upload className="size-4 text-muted-foreground" />
        </span>
        <span className="min-w-0 text-sm">
          <span className="font-medium">{label}</span>
          <span className="block text-xs text-muted-foreground">Clique ou arraste o arquivo · PDF, DOCX ou XLSX até 10 MB</span>
        </span>
      </button>
      )}
      {value.length > 0 && (
        <ul className="grid gap-1.5">
          {value.map((d, i) => {
            const Icon = d.endsWith('.xlsx') ? FileSpreadsheet : FileText
            return (
              <li key={i} className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">{d}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{tamanho(d)}</span>
                <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remover ${d}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  <Trash2 />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
