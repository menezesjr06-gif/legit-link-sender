import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Ruler, Shirt, Cog, Layers, Palette, CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Eye, Download, Wand2, X } from "lucide-react";
import { getAdminStore, subscribeAdmin } from "@/lib/admin-store";
import { createProjeto } from "@/lib/projects-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/assistente")({ component: Assistente });

const steps = [
  { n: 1, title: "Arte base", icon: Upload, desc: "Imagem & nome" },
  { n: 2, title: "Tamanho & Bastidor", icon: Ruler, desc: "Área de bordado" },
  { n: 3, title: "Tecido", icon: Shirt, desc: "Base & estabilização" },
  { n: 4, title: "Máquina", icon: Cog, desc: "Modelo & formato" },
  { n: 5, title: "Pontos & Densidade", icon: Layers, desc: "Digitalização" },
  { n: 6, title: "Cores & Linhas", icon: Palette, desc: "Fios & sequência" },
  { n: 7, title: "Revisão & Exportar", icon: CheckCircle2, desc: "Gerar matriz" },
]

function useAdminCatalog() {
  const [store, setStore] = useState(() => getAdminStore());
  useEffect(() => subscribeAdmin(setStore), []);
  return store;
}

function Assistente() {
  const navigate = useNavigate();
  const catalog = useAdminCatalog();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [artePreview, setArtePreview] = useState<string>("https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=400&fit=crop");
  const [arteFileName, setArteFileName] = useState("leao-mj.png");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "Leão MJ — nova arte",
    categoria: "Logo",
    observacao: "",
    quantidade: "1",
    valorUnitario: "",
    largura: "110",
    altura: "85",
    bastidor: "h2",
    tecido: "f2",
    maquina: "m1",
    preset: "p1",
    cores: ["#0a0a0a", "#d4af37", "#ffffff"] as string[],
  });

  const selectedHoop = catalog.hoops.find(h => h.id === form.bastidor) ?? catalog.hoops[0];
  const selectedFabric = catalog.fabrics.find(f => f.id === form.tecido) ?? catalog.fabrics[0];
  const selectedMachine = catalog.machines.find(m => m.id === form.maquina) ?? catalog.machines.find(m => m.ativo) ?? catalog.machines[0];
  const selectedPreset = catalog.presets.find(p => p.id === form.preset) ?? catalog.presets[0];
  const quantidade = Number(form.quantidade) || 0;
  const valorUnitario = Number(form.valorUnitario.replace(",", ".")) || 0;
  const subtotal = quantidade * valorUnitario;
  const percentualDesconto = quantidade > 10 ? 0.1 : 0;
  const valorDesconto = subtotal * percentualDesconto;
  const total = subtotal - valorDesconto;
  const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // garante seleções ativas se admin desativar
  useEffect(() => {
    if (!catalog.hoops.find(h => h.id === form.bastidor && h.ativo)) {
      const first = catalog.hoops.find(h => h.ativo);
      if (first) setForm(s => ({ ...s, bastidor: first.id }));
    }
  }, [catalog.hoops, form.bastidor]);
  useEffect(() => {
    if (!catalog.machines.find(m => m.id === form.maquina && m.ativo)) {
      const first = catalog.machines.find(m => m.ativo);
      if (first) setForm(s => ({ ...s, maquina: first.id }));
    }
  }, [catalog.machines, form.maquina]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Envie PNG, JPG ou SVG"); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Máximo 8MB"); return; }
    setArteFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => setArtePreview(reader.result as string);
    reader.readAsDataURL(f);
    toast.success("Arte carregada — privada na sua conta");
  };

  const validateNext = (): boolean => {
    if (step === 1 && !form.titulo.trim()) { toast.error("Informe o nome do projeto"); return false; }
    if (step === 1 && (!quantidade || quantidade < 1)) { toast.error("Informe uma quantidade válida"); return false; }
    if (step === 1 && (!valorUnitario || valorUnitario <= 0)) { toast.error("Informe o valor unitário em reais"); return false; }
    if (step === 2) {
      const w = Number(form.largura), h = Number(form.altura);
      if (!w || !h || w < 10 || h < 10 || w > 500 || h > 500) { toast.error("Largura/altura entre 10 e 500mm"); return false; }
    }
    return true;
  };

  const next = async () => {
    if (!validateNext()) return;
    if (step < 7) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    // gerar
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const pontos = Math.round((Number(form.largura) * Number(form.altura) * 8) + 8000);
      await createProjeto({
        titulo: form.titulo.trim(),
        arte: artePreview,
        cliente: (session?.user.user_metadata?.full_name as string) || session?.user.email?.split("@")[0] || "Você",
        status: "pronto",
        bastidor: selectedHoop.mm,
        tecido: selectedFabric.nome,
        maquina: selectedMachine.nome,
        pontos,
        cores: form.cores,
        privado: true,
      } as any);
      toast.success("Matriz gerada e salva na sua biblioteca privada!");
      navigate({ to: "/biblioteca" } as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally { setSaving(false); }
  };
  const prev = () => setStep(s => Math.max(1, s - 1));

  const addColor = () => {
    const c = prompt("Cor hex (ex: #ff0000)", "#0ea5e9");
    if (c && /^#[0-9a-fA-F]{6}$/.test(c)) setForm({ ...form, cores: [...form.cores, c] });
    else if (c) toast.error("Hex inválido");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground lg:flex"><Wand2 className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-black tracking-[0.14em] text-primary">ASSISTENTE 7 ETAPAS</p>
              <p className="text-sm font-bold leading-none">Etapa {step} de 7 — {steps[step - 1].title}</p>
            </div>
          </div>
          <span className="w-fit shrink-0 rounded-full bg-foreground px-3 py-1.5 text-xs font-black text-background">{Math.round(step / 7 * 100)}% concluído</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Progresso do assistente" aria-valuemin={1} aria-valuemax={7} aria-valuenow={step}><div className="h-full bg-primary transition-all duration-500" style={{ width: `${step / 7 * 100}%` }} /></div>
        <div className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {steps.map(s => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <button key={s.n} type="button" aria-current={active ? "step" : undefined} aria-label={`Etapa ${s.n}: ${s.title}`} onClick={() => setStep(s.n)} className={`min-w-0 rounded-2xl border p-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:p-3 ${active ? "bg-foreground text-background border-foreground shadow" : done ? "bg-emerald-500 text-white border-emerald-500" : "bg-card hover:bg-muted"}`}>
                <s.icon className={`mx-auto h-5 w-5 ${active || done ? "" : "text-muted-foreground"}`} />
                <p className="mt-1 hidden text-[11px] font-bold leading-none lg:block">{s.title}</p>
                <p className="hidden text-[10px] opacity-60 lg:block">{s.desc}</p>
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black lg:hidden">{s.n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.75fr]">
        <Card className="rounded-[24px] border shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {step === 1 && (
              <div className="space-y-5">
                <Header k="01" title="Envie sua arte base" desc="PNG, JPG, SVG ou PDF em alta. Sua arte fica isolada na sua conta — privada por RLS." />
                <div className="rounded-[20px] border-2 border-dashed bg-muted/20 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background"><Upload className="h-6 w-6" /></div>
                  <p className="mt-3 font-bold">Arraste a arte aqui ou clique para enviar</p>
                  <p className="text-xs text-muted-foreground">PNG/JPG/SVG • até 8MB • fundo transparente ideal</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  <Button variant="outline" className="mt-4 rounded-full" onClick={() => fileRef.current?.click()}>Selecionar arquivo</Button>
                  <div className="mx-auto mt-4 grid max-w-[420px] gap-2 sm:grid-cols-3">
                    <img src={artePreview} alt="arte" className="h-24 w-full rounded-xl object-cover border" />
                    <div className="rounded-xl border bg-background p-3 text-left"><p className="text-xs font-bold truncate">{arteFileName}</p><p className="text-[11px] text-muted-foreground">prévia real</p><span className="mt-2 inline-flex rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">PRIVADO</span></div>
                    <div className="rounded-xl bg-primary p-3 text-left text-primary-foreground"><p className="text-xs font-black">Auto-limpeza</p><p className="text-[11px] opacity-80">Remoção de fundo sugerida</p></div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Nome do projeto *</Label><Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Leão MJ dourado" /></div>
                  <div className="space-y-2"><Label>Categoria</Label><select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option>Logo</option><option>Monograma</option><option>Escudo</option><option>Floral</option><option>Patch</option></select></div>
                </div>
                <div className="grid gap-4 rounded-2xl border bg-muted/20 p-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Quantidade *</Label><Input inputMode="numeric" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value.replace(/\D/g, "") })} placeholder="Ex: 12" /><p className="text-xs text-muted-foreground">Acima de 10 unidades recebe 10% de desconto.</p></div>
                  <div className="space-y-2"><Label>Valor unitário (R$) *</Label><Input inputMode="decimal" value={form.valorUnitario} onChange={e => setForm({ ...form, valorUnitario: e.target.value.replace(/\./g, ",").replace(/[^\d,]/g, "").replace(/,(?=.*?,)/g, "") })} placeholder="Ex: 25,00" /><p className="text-xs text-muted-foreground">Informe o valor correspondente à lista enviada.</p></div>
                </div>
                <div className="space-y-2"><Label>Observações (opcional)</Label><Textarea placeholder="Ex: dourado metálico, contorno preto 1.5mm, para boné" value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <Header k="02" title="Defina tamanho e bastidor" desc="O tamanho determina pontos, tempo e compatibilidade com a máquina." />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Largura (mm) *</Label><Input inputMode="numeric" value={form.largura} onChange={e => setForm({ ...form, largura: e.target.value.replace(/\D/g, "") })} /></div>
                  <div className="space-y-2"><Label>Altura (mm) *</Label><Input inputMode="numeric" value={form.altura} onChange={e => setForm({ ...form, altura: e.target.value.replace(/\D/g, "") })} /></div>
                </div>
                <div className="grid gap-3">
                  {catalog.hoops.map(h => (
                    <label key={h.id} className={`flex cursor-pointer flex-wrap items-center gap-3 rounded-2xl border p-3 transition sm:gap-4 sm:p-4 ${form.bastidor === h.id ? "border-foreground bg-foreground text-background" : "hover:bg-muted/50"} ${!h.ativo ? "opacity-50" : ""}`}>
                      <input type="radio" name="hoop" checked={form.bastidor === h.id} onChange={() => setForm({ ...form, bastidor: h.id })} className="accent-black" disabled={!h.ativo} />
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-background text-foreground text-xs font-black">{h.mm}</div>
                      <div className="flex-1"><p className="font-bold leading-none">{h.nome}</p><p className="text-xs opacity-70">{h.tamanho} • {h.uso}</p></div>
                      {form.bastidor === h.id && <span className="rounded-full bg-primary px-2 py-1 text-xs font-black text-primary-foreground">Selecionado</span>}
                      {!h.ativo && <span className="text-xs font-bold">Oculto no admin</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <Header k="03" title="Escolha o tecido" desc="Cada tecido pede estabilização, agulha e densidade diferentes. Configure sem código no admin." />
                <div className="grid gap-3 sm:grid-cols-2">
                  {catalog.fabrics.filter(f => f.ativo).map(f => (
                    <label key={f.id} className={`cursor-pointer rounded-2xl border p-4 transition ${form.tecido === f.id ? "border-foreground bg-foreground text-background" : "hover:bg-muted/40"}`}>
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl border" style={{ background: f.cor }} />
                        <div className="flex-1"><p className="font-bold leading-none">{f.nome}</p><p className="text-xs opacity-70">{f.peso} • {f.agulha}</p></div>
                        <input type="radio" name="fabric" checked={form.tecido === f.id} onChange={() => setForm({ ...form, tecido: f.id })} />
                      </div>
                      <p className="mt-3 rounded-full bg-background/10 px-3 py-1.5 text-xs">Estabilização: <b>{f.estabilizacao}</b></p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <Header k="04" title="Selecione a máquina" desc="Formato e agulhas ajustados automaticamente. Edite no Painel Admin sem código." />
                <div className="grid gap-3">
                  {catalog.machines.filter(m => m.ativo).map(m => (
                    <label key={m.id} className={`flex cursor-pointer flex-wrap items-center gap-3 rounded-2xl border p-3 sm:gap-4 sm:p-4 ${form.maquina === m.id ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}>
                      <input type="radio" name="machine" checked={form.maquina === m.id} onChange={() => setForm({ ...form, maquina: m.id })} />
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background font-black text-xs">{m.marca[0]}</div>
                      <div className="flex-1"><p className="font-bold">{m.nome}</p><p className="text-xs text-muted-foreground">{m.agulhas} agulhas • {m.velocidade} • {m.formato}</p></div>
                      <span className="rounded-full border bg-emerald-500 px-2 py-1 text-xs font-bold text-white">Ativa</span>
                    </label>
                  ))}
                  {catalog.machines.filter(m => m.ativo).length === 0 && <p className="text-sm text-destructive">Nenhuma máquina ativa — ative no Admin.</p>}
                </div>
                <p className="text-xs text-muted-foreground">Precisa de outro modelo? Vá em <b>Admin → Máquinas</b> e adicione sem código — reflete aqui instantaneamente.</p>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <Header k="05" title="Ajuste pontos e densidade" desc="Presets validados pelo admin. Você só escolhe." />
                <div className="grid gap-3">
                  {catalog.presets.map(p => (
                    <label key={p.id} className={`cursor-pointer rounded-2xl border p-4 ${form.preset === p.id ? "border-foreground bg-foreground text-background" : "hover:bg-muted/40"}`}>
                      <div className="flex items-start gap-3">
                        <input type="radio" name="preset" checked={form.preset === p.id} onChange={() => setForm({ ...form, preset: p.id })} className="mt-1" />
                        <div className="flex-1"><p className="font-black">{p.nome}</p><p className="text-xs opacity-70">{p.descricao}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="rounded-full border bg-background px-2 py-1 text-foreground">{p.densidade}</span><span className="rounded-full border bg-background px-2 py-1 text-foreground">{p.underlay}</span><span className="rounded-full border bg-background px-2 py-1 text-foreground">{p.pull}</span></div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                <Header k="06" title="Cores e sequência de linhas" desc="Cada cor vira uma parada de linha na máquina." />
                <div className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between"><p className="text-sm font-bold">Paleta ({form.cores.length} cores)</p><Button variant="outline" size="sm" className="rounded-full" onClick={addColor}>+ Cor</Button></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.cores.map((c, i) => (
                      <div key={`${c}-${i}`} className="flex items-center gap-2 rounded-full border px-2 py-1 bg-card">
                        <span className="h-6 w-6 rounded-full border" style={{ background: c }} />
                        <span className="text-xs font-bold">{c}</span>
                        <button type="button" aria-label={`Remover a cor ${c}`} onClick={() => setForm({ ...form, cores: form.cores.filter((_, idx) => idx !== i) })} className="rounded-full p-1 hover:bg-muted"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3">
                    {form.cores.map((c, i) => (
                      <div key={i} className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border p-3"><span className="h-8 w-8 shrink-0 rounded-full border-2 border-white shadow" style={{ background: c }} /><span className="min-w-[130px] flex-1 text-sm font-semibold">{i + 1} — {c} • parada {i + 1}</span><input aria-label={`Alterar cor ${i + 1}`} type="color" value={c} onChange={e => setForm({ ...form, cores: form.cores.map((cc, idx) => idx === i ? e.target.value : cc) })} className="h-11 w-11 shrink-0 rounded" /></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-5">
                <Header k="07" title="Revisão final" desc="Confira antes de exportar. Será salvo privado na sua biblioteca." />
                <div className="grid gap-4">
                  <div className="overflow-hidden rounded-2xl border">
                    <div className="h-48 bg-muted flex items-center justify-center relative">
                      <img src={artePreview} alt="preview" className="h-full w-full object-cover opacity-90" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-white">Prévia — {form.largura}×{form.altura}mm</span>
                      <span className="absolute top-3 right-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">PRONTO PARA BORDAR</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-4 text-sm lg:grid-cols-4">
                      <Info label="Bastidor" value={selectedHoop?.tamanho ?? "-"} />
                      <Info label="Tecido" value={selectedFabric?.nome ?? "-"} />
                      <Info label="Máquina" value={selectedMachine?.nome ?? "-"} />
                      <Info label="Densidade" value={selectedPreset?.densidade ?? "-"} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border p-4 text-center"><p className="text-xs font-bold text-muted-foreground">TEMPO EST.</p><p className="text-xl font-black">{Math.max(8, Math.round(Number(form.largura) * Number(form.altura) / 220))} min</p><p className="text-xs text-muted-foreground">{selectedPreset?.velocidade ?? "700 ppm"}</p></div>
                    <div className="rounded-2xl border p-4 text-center"><p className="text-xs font-bold text-muted-foreground">PONTOS</p><p className="text-xl font-black">{(Math.round(Number(form.largura) * Number(form.altura) * 8) + 8000).toLocaleString("pt-BR")}</p><p className="text-xs text-muted-foreground">{form.cores.length} paradas</p></div>
                    <div className="rounded-2xl border p-4 text-center"><p className="text-xs font-bold text-muted-foreground">FORMATOS</p><p className="text-xl font-black">DST • PES</p><p className="text-xs text-muted-foreground">{selectedMachine?.formato ?? ""}</p></div>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black tracking-widest text-muted-foreground">RESUMO DO VALOR</p><p className="text-sm font-semibold">{quantidade} unidades × {formatCurrency(valorUnitario)}</p></div>{percentualDesconto > 0 && <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">10% OFF</span>}</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Info label="Subtotal" value={formatCurrency(subtotal)} />
                      <Info label="Desconto" value={percentualDesconto > 0 ? `- ${formatCurrency(valorDesconto)}` : "Não aplicado"} />
                      <div className="rounded-xl bg-foreground p-3 text-background"><p className="text-[11px] font-black tracking-widest opacity-60">TOTAL</p><p className="text-xl font-black">{formatCurrency(total)}</p></div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div className="text-sm"><b>Salvo como privado</b><p className="text-muted-foreground">Vinculado ao seu user_id. Outros clientes não veem — RLS: created_by = auth.uid().</p></div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between [&_button]:w-full sm:[&_button]:w-auto">
              <Button variant="outline" onClick={prev} disabled={step === 1 || saving} className="rounded-full"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
              <Button onClick={next} disabled={saving} className="rounded-full px-6 font-black">
                {saving ? "Salvando..." : step === 7 ? <><Download className="mr-2 h-4 w-4" /> Gerar matriz privada</> : <>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[24px]"><CardContent className="p-5">
            <p className="text-xs font-black tracking-widest text-muted-foreground">RESUMO AO VIVO</p>
            <div className="mt-3 space-y-3 text-sm">
              <Row label="Projeto" value={form.titulo || "(sem nome)"} />
              <Row label="Tamanho" value={`${form.largura}×${form.altura}mm`} />
              <Row label="Bastidor" value={selectedHoop?.nome ?? "-"} />
              <Row label="Tecido" value={`${selectedFabric?.nome ?? "-"} • ${selectedFabric?.estabilizacao ?? ""}`} />
              <Row label="Máquina" value={selectedMachine?.nome ?? "-"} />
              <Row label="Preset" value={selectedPreset?.nome ?? "-"} />
              <Row label="Quantidade" value={`${quantidade} unidade${quantidade === 1 ? "" : "s"}`} />
              <Row label="Valor unitário" value={formatCurrency(valorUnitario)} />
              <Row label="Desconto" value={percentualDesconto > 0 ? `10% (- ${formatCurrency(valorDesconto)})` : "Não aplicado"} />
              <Row label="Total" value={formatCurrency(total)} />
            </div>
            <div className="mt-4 rounded-2xl bg-foreground p-4 text-background">
              <p className="text-xs font-black tracking-widest opacity-60">PRIVACIDADE</p>
              <p className="mt-1 text-sm font-semibold leading-snug">Tudo vinculado ao seu user_id. Ao salvar, só você enxerga na Biblioteca.</p>
            </div>
          </CardContent></Card>
          <Card className="rounded-[24px] border-primary/20 bg-primary/5"><CardContent className="p-5">
            <p className="flex items-center gap-2 text-sm font-black"><Sparkles className="h-4 w-4 text-primary" /> Dica da etapa {step}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step === 1 && "Use PNG sem fundo para bordado limpo."}
              {step === 2 && "Bonés: até 100mm de largura."}
              {step === 3 && "Elásticos pedem cut-away."}
              {step === 4 && "Velocidade varia por máquina (admin)."}
              {step === 5 && "Densidade alta = cobertura total."}
              {step === 6 && "Bordar do fundo para detalhe."}
              {step === 7 && "DST para produção, PES para edição."}
            </p>
            <Button variant="outline" size="sm" className="mt-3 rounded-full w-full" onClick={() => toast.info("Exemplo: matriz leão 18k pontos, 22min") }><Eye className="mr-2 h-4 w-4" /> Ver exemplo real</Button>
          </CardContent></Card>
        </div>
      </div>
    </div>
  )
}

function Header({ k, title, desc }: { k: string, title: string, desc: string }) {
  return <div className="flex min-w-0 gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">{k}</span><div className="min-w-0"><h2 className="text-lg font-black tracking-tight">{title}</h2><p className="text-sm text-muted-foreground">{desc}</p></div></div>
}
function Row({ label, value }: { label: string, value: string }) {
  return <div className="flex min-w-0 justify-between gap-3 border-b pb-2 last:border-0"><span className="shrink-0 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span><span className="max-w-[60%] break-words text-right text-xs font-semibold">{value}</span></div>
}
function Info({ label, value }: { label: string, value: string }) {
  return <div><p className="text-[11px] font-black tracking-widest text-muted-foreground">{label}</p><p className="font-bold">{value}</p></div>
}
