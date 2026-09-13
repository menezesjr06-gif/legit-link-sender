import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Library, ShieldCheck, Sparkles, TrendingUp, Clock3, Layers, Palette, ArrowRight, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { listProjetos, subscribeProjetos } from "@/lib/projects-store";
import type { Projeto } from "@/lib/embroidery-data";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

function Dashboard() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  useEffect(() => { listProjetos().then(setProjetos); return subscribeProjetos(() => listProjetos().then(setProjetos)); }, []);
  const total = projetos.length || 6;
  const prontos = projetos.filter(p => p.status === "pronto").length || 2;
  const emBordado = projetos.filter(p => p.status === "em_bordado").length || 1;
  const pontos = projetos.reduce((a, b) => a + b.pontos, 0) || 126000;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 rounded-[24px] bg-foreground p-4 text-background sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black tracking-widest"><Sparkles className="h-4 w-4 text-primary" /> MJ STÚDIO • BORDADO PRO</p>
          <h1 className="mt-3 text-[28px] font-black leading-none tracking-tighter lg:text-[36px]">Bem-vindo ao seu<br /><span className="text-primary">atelier privado</span></h1>
          <p className="mt-2 max-w-[560px] text-sm text-white/70">Crie matrizes em 7 etapas, guarde artes e matrizes com isolamento total por conta (RLS). Atualize máquinas, bastidores e tecidos sem código no painel admin.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto">
            <Link to="/assistente"><Button className="rounded-full font-black"><Wand2 className="mr-2 h-4 w-4" /> Criar nova matriz</Button></Link>
            <Link to="/biblioteca"><Button variant="outline" className="rounded-full bg-white text-black hover:bg-white/90 font-bold">Ver biblioteca <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:w-[380px]">
          <MiniStat label="Projetos privados" value={String(total)} sub="só você vê" />
          <MiniStat label="Prontos p/ bordar" value={String(prontos)} sub="DST/PES" />
          <MiniStat label="Pontos totais" value={(pontos / 1000).toFixed(1) + "k"} sub="gerados" />
          <MiniStat label="Em bordado" value={String(emBordado)} sub="em máquina" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[20px] border-primary/20 bg-primary/5">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-black flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" /> Assistente 7 etapas</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Arte → bastidor → tecido → máquina → pontos → cores → exportar. Guiado e à prova de erro.</p><Link to="/assistente" className="mt-3 inline-flex text-sm font-bold text-primary">Começar agora →</Link></CardContent>
        </Card>
        <Card className="rounded-[20px]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-black flex items-center gap-2"><Library className="h-4 w-4" /> Biblioteca privada</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Filtre por máquina, tecido, bastidor. Cada matriz com ficha técnica e download DST/PES.</p><Link to="/biblioteca" className="mt-3 inline-flex text-sm font-bold">Abrir biblioteca →</Link></CardContent>
        </Card>
        <Card className="rounded-[20px]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-black flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Painel admin no-code</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Edite usuários, máquinas, bastidores, tecidos e presets sem tocar no código.</p><Link to="/admin" className="mt-3 inline-flex text-sm font-bold">Gerenciar →</Link></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <Card className="rounded-[20px]">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base font-black">Projetos recentes</CardTitle><Link to="/biblioteca" className="text-xs font-bold text-primary">Ver todos</Link></CardHeader>
          <CardContent className="space-y-3">
            {projetos.slice(0, 4).map(p => (
              <div key={p.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border p-3 hover:bg-muted/40 sm:flex-nowrap">
                <img src={p.arte} alt="" className="h-14 w-14 rounded-xl object-cover border" />
                <div className="min-w-0 flex-1"><p className="font-bold truncate text-sm">{p.titulo}</p><p className="text-xs text-muted-foreground truncate">{p.cliente} • {p.bastidor} • {p.tecido}</p></div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background"><Lock className="h-3 w-3" /> Privado</span>
                <span className="text-xs font-bold">{p.pontos.toLocaleString("pt-BR")} pts</span>
              </div>
            ))}
            {projetos.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Carregando projetos privados...</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[20px] bg-muted/30">
            <CardContent className="p-5">
              <p className="text-xs font-black tracking-widest text-muted-foreground">FLUXO RECOMENDADO</p>
              <ol className="mt-3 space-y-2 text-sm">
                <li className="flex gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-black">1</span> Envie a arte (PNG/SVG)</li>
                <li className="flex gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-black">2</span> Escolha bastidor e tecido</li>
                <li className="flex gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-black">3</span> Selecione máquina & preset</li>
                <li className="flex gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-black">4</span> Exporte DST/PES privado</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="rounded-[20px] border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-5">
              <p className="font-black flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-emerald-600" /> Por que é privado?</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Cada projeto é salvo com <b>created_by = auth.uid()</b>. Política RLS garante que nenhum outro login consiga listar ou baixar — mesmo por API direta.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border bg-background px-2.5 py-1 font-bold flex items-center gap-1"><Layers className="h-3 w-3" /> RLS</span>
                <span className="rounded-full border bg-background px-2.5 py-1 font-bold flex items-center gap-1"><Palette className="h-3 w-3" /> por user_id</span>
                <span className="rounded-full border bg-background px-2.5 py-1 font-bold flex items-center gap-1"><Clock3 className="h-3 w-3" /> auditado</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string, value: string, sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-[11px] font-black tracking-widest text-white/50">{label}</p>
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="text-xs text-white/60">{sub}</p>
    </div>
  )
}
