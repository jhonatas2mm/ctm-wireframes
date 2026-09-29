import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PageHeader, Req } from '@/components/wf'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

// Meu perfil: aberto pelo avatar no rodapé do menu. Dados de acesso (perfil, DR, e-mail) vêm do cadastro e são só leitura;
// a pessoa edita só os próprios contatos e as preferências de aviso. Protótipo: salva só na tela (volta ao recarregar).
const Info = ({ rotulo, children }: { rotulo: string; children: React.ReactNode }) => (
  <div className="grid gap-1">
    <dt className="text-xs text-muted-foreground">{rotulo}</dt>
    <dd className="text-sm font-medium">{children}</dd>
  </div>
)
const Travado = ({ children }: { children: React.ReactNode }) => (
  <Badge variant="outline" className="gap-1 font-normal"><Lock className="size-3" /> {children}</Badge>
)

export default function MeuPerfil() {
  const perfil = useProfile()
  const def = profileOf(perfil)
  const user = def.user ?? { nome: 'Maria Silva', email: 'maria.silva@senai.br' }
  const iniciais = user.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')

  const inicial = { nome: user.nome, telefone: '(31) 99876-5432', ramal: '4521' }
  const [f, setF] = useState(inicial)
  const [avisos, setAvisos] = useState({ email: true, sistema: true })
  const [salvo, setSalvo] = useState(true)
  // Trocar de perfil na casca troca a pessoa: recarrega os dados de exemplo.
  useEffect(() => { setF({ nome: user.nome, telefone: '(31) 99876-5432', ramal: '4521' }); setSalvo(true) }, [user.nome])
  const mudar = (v: Partial<typeof f>) => (setF({ ...f, ...v }), setSalvo(false))

  return (
    <>
      <PageHeader title="Meu perfil" />
      <div className="flex items-center gap-4 rounded-[1.25rem] border bg-card p-5">
        <Avatar className="size-16">
          <AvatarImage src={`${import.meta.env.BASE_URL}avatars/${user.email}.jpg`} alt="" />
          <AvatarFallback className="bg-[#1670FA] text-xl font-semibold text-white">{iniciais}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xl font-semibold">{f.nome}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {perfil && <Badge variant="outline" className="mt-1.5">{def.caixa ?? perfil}</Badge>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-[1.25rem] border bg-card p-5">
          <h2 className="font-semibold">Dados pessoais</h2>
          <div className="grid gap-1.5"><Label>Nome <Req /></Label><Input value={f.nome} onChange={(e) => mudar({ nome: e.target.value })} /></div>
          <div className="grid grid-cols-[1fr_8rem] gap-3">
            <div className="grid gap-1.5"><Label>Telefone</Label><Input value={f.telefone} onChange={(e) => mudar({ telefone: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Ramal</Label><Input value={f.ramal} onChange={(e) => mudar({ ramal: e.target.value })} /></div>
          </div>
          <div className="flex justify-end">
            <Button disabled={salvo} motivo="Nenhuma alteração para salvar" onClick={() => setSalvo(true)}>Salvar perfil</Button>
          </div>
        </section>

        <section className="space-y-4 rounded-[1.25rem] border bg-card p-5">
          <h2 className="font-semibold">Acesso</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Info rotulo="E-mail corporativo"><Travado>{user.email}</Travado></Info>
            <Info rotulo="Perfil"><Travado>{def.grupo ?? perfil ?? '—'}</Travado></Info>
            <Info rotulo="Subperfil"><Travado>{def.caixa ?? '—'}</Travado></Info>
            <Info rotulo="Departamento Regional"><Travado>{def.dr?.sigla ?? 'SENAI-DN'}</Travado></Info>
            {user.cargo && <Info rotulo="Cargo"><Travado>{user.cargo}</Travado></Info>}
            <Info rotulo="Último acesso">29/09/2026 às 08:42</Info>
          </dl>
          <p className="text-xs text-muted-foreground">Perfil, DR e e-mail são definidos pelo administrador (Gestão de usuários).</p>
        </section>

        <section className="space-y-3 rounded-[1.25rem] border bg-card p-5 lg:col-span-2">
          <h2 className="font-semibold">Avisos</h2>
          <label className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm">
            <span>Receber avisos por e-mail (TAAs, propostas, prazos)</span>
            <Switch checked={avisos.email} onCheckedChange={(v) => setAvisos({ ...avisos, email: v })} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm">
            <span>Mostrar avisos no sistema (Precisa de atenção)</span>
            <Switch checked={avisos.sistema} onCheckedChange={(v) => setAvisos({ ...avisos, sistema: v })} />
          </label>
        </section>
      </div>
    </>
  )
}
