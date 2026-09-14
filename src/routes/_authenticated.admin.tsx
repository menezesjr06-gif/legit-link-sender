import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getAdminStore, adminHelpers, subscribeAdmin } from "@/lib/admin-store";
import { toast } from "sonner";
import { Users, Cog, Frame, Shirt, Layers, Plus, Trash2, Edit3, ShieldCheck, Save, EyeOff, Database, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({ component: Admin });

function Admin() {
  const [store, setStore] = useState(() => getAdminStore());
  useEffect(() => subscribeAdmin(setStore), []);
  // local forms
  const [mForm, setMForm] = useState({ nome: "", marca: "", agulhas: "", formato: "" });
  const [hForm, setHForm] = useState({ nome: "", tamanho: "", uso: "" });
  const [fForm, setFForm] = useState({ nome: "", estabilizacao: "", agulha: "" });
  const [pForm, setPForm] = useState({ nome: "", densidade: "", underlay: "", pull: "", velocidade: "", descricao: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");

  const save = () => {
    toast.success("Catálogos salvos — assistente atualizado instantaneamente!");
  };

  const addMachine = () => {
    if (!mForm.nome || !mForm.marca || !mForm.agulhas) { toast.error("Preencha nome, marca e agulhas"); return; }
    adminHelpers.addMachine({ id: `m${Date.now()}`, nome: mForm.nome, marca: mForm.marca, agulhas: Number(mForm.agulhas), velocidade: "1000 ppm", formato: mForm.formato || "DST", ativo: true });
    setMForm({ nome: "", marca: "", agulhas: "", formato: "" });
    toast.success("Máquina adicionada");
  };
  const addHoop = () => {
    if (!hForm.nome || !hForm.tamanho) { toast.error("Preencha nome e tamanho"); return; }
    const mm = hForm.tamanho.replace(/\s/g, "").replace("×", "x");
    adminHelpers.addHoop({ id: `h${Date.now()}`, nome: hForm.nome, tamanho: hForm.tamanho, mm, uso: hForm.uso || "Geral", ativo: true });
    setHForm({ nome: "", tamanho: "", uso: "" });
    toast.success("Bastidor adicionado");
  };
  const addFabric = () => {
    if (!fForm.nome) { toast.error("Nome obrigatório"); return; }
    adminHelpers.addFabric({ id: `f${Date.now()}`, nome: fForm.nome, peso: "Médio", estabilizacao: fForm.estabilizacao || "Cut-away", agulha: fForm.agulha || "80/12", cor: "#fef3c7", ativo: true });
    setFForm({ nome: "", estabilizacao: "", agulha: "" });
    toast.success("Tecido adicionado");
  };
  const addPreset = () => {
    if (!pForm.nome || !pForm.densidade) { toast.error("Nome e densidade obrigatórios"); return; }
    adminHelpers.addPreset({ id: `p${Date.now()}`, nome: pForm.nome, densidade: pForm.densidade, underlay: pForm.underlay || "Zig-zag", pull: pForm.pull || "0.3 mm", velocidade: pForm.velocidade || "700 ppm", descricao: pForm.descricao || "Preset customizado" });
    setPForm({ nome: "", densidade: "", underlay: "", pull: "", velocidade: "", descricao: "" });
    toast.success("Preset criado");
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[24px] border bg-foreground text-background overflow-hidden">
        <CardContent className="p-6 lg:p-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary lg:flex"><ShieldCheck className="h-6 w-6 text-primary-foreground" /></div>
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-primary">PAINEL ADMINISTRATIVO • NO-CODE</p>
              <h2 className="text-xl font-black tracking-tight">Atualize tudo sem tocar no código</h2>
              <p className="text-sm text-white/70">Máquinas, bastidores, tecidos e presets refletem ao vivo no assistente. Persistido em localStorage + Supabase quando migrado.</p>
            </div>
          </div>
          <Button onClick={save} className="w-full rounded-full bg-white font-black text-black hover:bg-white/90 sm:w-auto"><Save className="mr-2 h-4 w-4" /> Salvar alterações</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="maquinas" className="w-full">
        <TabsList className="flex w-full flex-wrap h-auto justify-start gap-2 bg-transparent p-0">
          <TabTrigger value="usuarios" icon={Users} label="Usuários" />
          <TabTrigger value="maquinas" icon={Cog} label="Máquinas" />
          <TabTrigger value="bastidores" icon={Frame} label="Bastidores" />
          <TabTrigger value="tecidos" icon={Shirt} label="Tecidos" />
          <TabTrigger value="digitalizacao" icon={Layers} label="Digitalização" />
        </TabsList>

        <TabsContent value="usuarios" className="mt-6 space-y-4">
          <Card className="rounded-[20px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-black flex items-center gap-2"><Users className="h-5 w-5" /> Usuários & privacidade</CardTitle>
              <Badge variant="outline" className="rounded-full gap-1"><Lock className="h-3 w-3" /> RLS ativo</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-muted/20 p-4 text-sm leading-relaxed">
                <p className="font-bold flex gap-2"><Database className="h-4 w-4" /> Isolamento por RLS</p>
                <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                  <li><b>projetos.created_by = auth.uid()</b> — cada SELECT filtra por usuário.</li>
                  <li>Policy: <code className="rounded bg-foreground px-1.5 py-0.5 text-background text-xs">FOR ALL USING (created_by = auth.uid())</code></li>
                  <li>Admins via <b>user_roles</b> + <b>has_role('admin')</b> (service_role).</li>
                  <li>Artes armazenadas como dataURL/Storage privado por usuário.</li>
                </ul>
              </div>
              <div className="grid gap-3">
                {[
                  { nome: "Atelier MJ (você)", email: "maria@mjstudio.com", role: "admin" },
                  { nome: "Aurora Noivas", email: "contato@aurora.com", role: "user" },
                  { nome: "Wolves FC", email: "compras@wolves.com", role: "user" },
                ].map(u => (
                  <div key={u.email} className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border p-3 sm:flex-nowrap sm:gap-4 sm:p-4">
                    <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-black">{u.nome[0]}</div>
                    <div className="flex-1 min-w-0"><p className="font-bold truncate">{u.nome}</p><p className="text-xs text-muted-foreground truncate">{u.email}</p></div>
                    <Badge className={u.role === "admin" ? "bg-primary" : "bg-muted text-foreground"}>{u.role}</Badge>
                    <Badge variant="outline" className="rounded-full gap-1"><EyeOff className="h-3 w-3" /> privado</Badge>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2"><Label>Convidar — e-mail</Label><Input placeholder="cliente@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} /></div>
                <div className="space-y-2"><Label>Papel</Label><select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="user">user (cliente)</option><option value="admin">admin</option></select></div>
                <div className="flex items-end"><Button className="w-full rounded-full" onClick={() => { if (!inviteEmail.includes("@")) { toast.error("E-mail inválido"); return; } toast.success(`Convite enviado para ${inviteEmail} como ${inviteRole}`); setInviteEmail(""); }}>+ Convidar</Button></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maquinas" className="mt-6">
          <Card className="rounded-[20px]">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base font-black">Máquinas de bordado</CardTitle><Badge variant="outline" className="rounded-full">{store.machines.length} itens</Badge></CardHeader>
            <CardContent className="space-y-3">
              {store.machines.map(m => (
                <div key={m.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border p-3 sm:flex-nowrap">
                  <div className="flex-1"><p className="font-bold">{m.nome} <span className="text-xs text-muted-foreground">• {m.marca}</span></p><p className="text-xs text-muted-foreground">{m.agulhas} agulhas • {m.velocidade} • {m.formato}</p></div>
                  <div className="flex items-center gap-2">
                    <Switch aria-label={`${m.ativo ? "Ocultar" : "Ativar"} máquina ${m.nome}`} checked={m.ativo} onCheckedChange={() => adminHelpers.toggleMachine(m.id)} />
                    <span className={`text-xs font-bold ${m.ativo ? "text-emerald-600" : "text-muted-foreground"}`}>{m.ativo ? "Ativa" : "Oculta"}</span>
                    <Button variant="ghost" size="icon" aria-label={`Excluir máquina ${m.nome}`} className="rounded-full text-destructive" onClick={() => adminHelpers.deleteMachine(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-dashed p-4 space-y-3">
                <p className="text-sm font-bold">Adicionar máquina (sem código)</p>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Input placeholder="Nome (ex: Brother PR1055X)" value={mForm.nome} onChange={e => setMForm({ ...mForm, nome: e.target.value })} />
                  <Input placeholder="Marca" value={mForm.marca} onChange={e => setMForm({ ...mForm, marca: e.target.value })} />
                  <Input placeholder="Agulhas" inputMode="numeric" value={mForm.agulhas} onChange={e => setMForm({ ...mForm, agulhas: e.target.value.replace(/\D/g, "") })} />
                  <Input placeholder="Formato (PES/DST)" value={mForm.formato} onChange={e => setMForm({ ...mForm, formato: e.target.value })} />
                </div>
                <Button className="rounded-full" onClick={addMachine}><Plus className="mr-2 h-4 w-4" /> Adicionar máquina</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bastidores" className="mt-6">
          <Card className="rounded-[20px]">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base font-black">Bastidores (hoops)</CardTitle><Badge variant="outline" className="rounded-full">{store.hoops.length} itens</Badge></CardHeader>
            <CardContent className="space-y-3">
              {store.hoops.map(h => (
                <div key={h.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border p-3 sm:flex-nowrap">
                  <div className="flex-1"><p className="font-bold">{h.nome}</p><p className="text-xs text-muted-foreground">{h.tamanho} • {h.uso}</p></div>
                  <div className="flex items-center gap-2">
                    <Switch aria-label={`${h.ativo ? "Ocultar" : "Ativar"} bastidor ${h.nome}`} checked={h.ativo} onCheckedChange={() => adminHelpers.toggleHoop(h.id)} />
                    <span className={`text-xs font-bold ${h.ativo ? "text-emerald-600" : "text-muted-foreground"}`}>{h.ativo ? "Ativo" : "Oculto"}</span>
                    <Button variant="ghost" size="icon" aria-label={`Excluir bastidor ${h.nome}`} className="rounded-full text-destructive" onClick={() => adminHelpers.deleteHoop(h.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-dashed p-4 space-y-3">
                <p className="text-sm font-bold">Adicionar bastidor</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input placeholder="Nome (ex: Grande 200x300)" value={hForm.nome} onChange={e => setHForm({ ...hForm, nome: e.target.value })} />
                  <Input placeholder="Tamanho (ex: 200 × 300 mm)" value={hForm.tamanho} onChange={e => setHForm({ ...hForm, tamanho: e.target.value })} />
                  <Input placeholder="Uso (ex: costas, jaquetas)" value={hForm.uso} onChange={e => setHForm({ ...hForm, uso: e.target.value })} />
                </div>
                <Button className="rounded-full" onClick={addHoop}><Plus className="mr-2 h-4 w-4" /> Adicionar bastidor</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tecidos" className="mt-6">
          <Card className="rounded-[20px]">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base font-black">Tecidos & estabilização</CardTitle><Badge variant="outline" className="rounded-full">{store.fabrics.length} itens</Badge></CardHeader>
            <CardContent className="space-y-3">
              {store.fabrics.map(f => (
                <div key={f.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border p-3 sm:flex-nowrap">
                  <span className="h-8 w-8 rounded-lg border" style={{ background: f.cor }} />
                  <div className="flex-1"><p className="font-bold">{f.nome}</p><p className="text-xs text-muted-foreground">{f.peso} • {f.estabilizacao} • Agulha {f.agulha}</p></div>
                  <div className="flex items-center gap-2">
                    <Switch aria-label={`${f.ativo ? "Ocultar" : "Ativar"} tecido ${f.nome}`} checked={f.ativo} onCheckedChange={() => adminHelpers.toggleFabric(f.id)} />
                    <span className={`text-xs font-bold ${f.ativo ? "text-emerald-600" : "text-muted-foreground"}`}>{f.ativo ? "Ativo" : "Oculto"}</span>
                    <Button variant="ghost" size="icon" aria-label={`Excluir tecido ${f.nome}`} className="rounded-full text-destructive" onClick={() => adminHelpers.deleteFabric(f.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-dashed p-4 space-y-3">
                <p className="text-sm font-bold">Adicionar tecido</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input placeholder="Tecido (ex: Sarja)" value={fForm.nome} onChange={e => setFForm({ ...fForm, nome: e.target.value })} />
                  <Input placeholder="Estabilização" value={fForm.estabilizacao} onChange={e => setFForm({ ...fForm, estabilizacao: e.target.value })} />
                  <Input placeholder="Agulha (ex: 80/12)" value={fForm.agulha} onChange={e => setFForm({ ...fForm, agulha: e.target.value })} />
                </div>
                <Button className="rounded-full" onClick={addFabric}><Plus className="mr-2 h-4 w-4" /> Adicionar tecido</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digitalizacao" className="mt-6 space-y-4">
          <Card className="rounded-[20px]">
            <CardHeader><CardTitle className="text-base font-black">Presets de digitalização</CardTitle><p className="text-sm text-muted-foreground">Editados aqui e usados na etapa 5 do assistente.</p></CardHeader>
            <CardContent className="space-y-3">
              {store.presets.map(p => (
                <div key={p.id} className="flex min-w-0 flex-wrap gap-4 rounded-2xl border p-4 sm:flex-nowrap">
                  <div className="flex-1"><p className="font-black">{p.nome}</p><p className="text-xs text-muted-foreground">{p.descricao}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs"><Badge variant="secondary">{p.densidade}</Badge><Badge variant="secondary">{p.underlay}</Badge><Badge variant="secondary">Pull {p.pull}</Badge><Badge variant="secondary">{p.velocidade}</Badge></div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Excluir preset ${p.nome}`} className="rounded-full text-destructive" onClick={() => adminHelpers.deletePreset(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="rounded-2xl border border-dashed p-4 grid gap-3">
                <p className="font-bold text-sm">Adicionar preset</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Nome (ex: Micro texto 5mm)" value={pForm.nome} onChange={e => setPForm({ ...pForm, nome: e.target.value })} />
                  <Input placeholder="Densidade (ex: 5.2 linhas/mm)" value={pForm.densidade} onChange={e => setPForm({ ...pForm, densidade: e.target.value })} />
                  <Input placeholder="Underlay" value={pForm.underlay} onChange={e => setPForm({ ...pForm, underlay: e.target.value })} />
                  <Input placeholder="Pull (ex: 0.15 mm)" value={pForm.pull} onChange={e => setPForm({ ...pForm, pull: e.target.value })} />
                  <Input placeholder="Velocidade (ex: 600 ppm)" value={pForm.velocidade} onChange={e => setPForm({ ...pForm, velocidade: e.target.value })} />
                  <Input placeholder="Descrição" value={pForm.descricao} onChange={e => setPForm({ ...pForm, descricao: e.target.value })} />
                </div>
                <Button className="rounded-full w-fit" onClick={addPreset}><Plus className="mr-2 h-4 w-4" /> Adicionar preset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TabTrigger({ value, icon: Icon, label }: { value: string, icon: any, label: string }) {
  return <TabsTrigger value={value} className="rounded-full border data-[state=active]:bg-foreground data-[state=active]:text-background gap-2 px-4 py-2 font-bold"><Icon className="h-4 w-4" /> {label}</TabsTrigger>
}
