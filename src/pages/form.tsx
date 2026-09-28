import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Annotation, PageHeader } from '@/components/wf'
import { useItens } from '@/lib/mock'

export default function FormPage() {
  const navigate = useNavigate()
  const db = useItens()

  return (
    <>
      <PageHeader title="Novo item" description="Preencha os dados básicos" />
      <Annotation>Campos com * são obrigatórios. Ao salvar, volta para a listagem com toast.</Annotation>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          db.add({
            nome: String(f.get('nome')),
            responsavel: String(f.get('responsavel') || 'Ana Souza'),
            status: 'Pendente',
            atualizadoEm: new Date().toLocaleDateString('pt-BR'),
          })
          toast.success('Item salvo')
          navigate('/itens')
        }}
      >
        <Card className="max-w-2xl">
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" name="nome" required placeholder="Ex.: Projeto Alfa" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Responsável</Label>
                <Select name="responsavel" defaultValue="Ana Souza">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Ana Souza', 'Bruno Lima', 'Carla Dias'].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prazo">Prazo</Label>
                <Input id="prazo" type="date" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Prioridade</Label>
              <RadioGroup defaultValue="media" className="flex gap-4">
                {['baixa', 'media', 'alta'].map((v) => (
                  <Label key={v} className="font-normal capitalize">
                    <RadioGroupItem value={v} /> {v === 'media' ? 'média' : v}
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" rows={4} />
            </div>
            <Label className="font-normal">
              <Checkbox defaultChecked /> Notificar responsável por e-mail
            </Label>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}
