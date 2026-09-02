import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { statusMap } from "@/lib/embroidery-data";
import type { Projeto } from "@/lib/embroidery-data";
import { Search, Grid3X3, List, Lock, Download, Eye, MoreHorizontal, Wand2, Filter, Sparkles, Trash2 } from "lucide-react";
import { listProjetos, subscribeProjetos } from "@/lib/projects-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/biblioteca")({ component: Biblioteca });

function Biblioteca() {
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await listProjetos();
    setProjetos(data);
    setLoading(false);
  };
  useEffect(() => { load(); return subscribeProjetos(load); }, []);

  const filtrados = projetos.filter(p => {
    const matchQ = !q || p.titulo.toLowerCase().includes(q.toLowerCase()) || p.cliente.toLowerCase().includes(q.toLowerCase()) || p.bastidor.toLowerCase().includes(q.toLowerCase());
    const matchF = filtro === "todos" || p.status === filtro;
    return matchQ && matchF;
  });

  const handleDownload = (p: Projeto) => {
    const blob = new Blob([`Matriz: ${p.titulo}\nBastidor: ${p.bastidor}\nTecido: ${p.tecido}\nMaquina: ${p.maquina}\nPontos: ${p.pontos}\nCores: ${p.cores.join(", ")}\nPrivado: sim (RLS)`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${p.titulo.replace(/\s+/g, "_")}.txt`; a.click(); URL.revokeObjectURL(url);
    toast.success(`Download simulado: ${p.titulo} (privado)`);
  };

  const handleView = (p: Projeto) => toast.info(`${p.titulo} — ${p.pontos.toLocaleString("pt-BR")} pontos • ${p.bastidor}`);

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border bg-card p-4 lg:p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-[520px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por título, cliente, bastidor..." value={q} onChange={e => setQ(e.target.value)} className="pl-9 rounded-full bg-muted/50" />
          </div>
          <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 lg:inline-flex"><Lock className="h-3.5 w-3.5" /> Biblioteca privada</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/assistente"><Button className="rounded-full font-black"><Wand2 className="mr-2 h-4 w-4" /> Nova matriz</Button></Link>
          <div className="flex rounded-full border p-1 bg-muted">
            <button onClick={() => setView("grid")} className={`rounded-full p-2 ${view === "grid" ? "bg-foreground text-background" : "text-muted-foreground"}`}><Grid3X3 className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={`rounded-full p-2 ${view === "list" ? "bg-foreground text-background" : "text-muted-foreground"}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["todos", "rascunho", "pronto", "em_bordado", "entregue"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`rounded-full border px-4 py-1.5 text-xs font-bold capitalize transition ${filtro === f ? "bg-foreground text-background border-foreground" : "bg-card hover:bg-muted"}`}>
            {f === "todos" ? `Todos (${projetos.length})` : `${statusMap[f as keyof typeof statusMap]?.label ?? f}`}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{loading ? "carregando..." : `${filtrados.length} projetos • privados por RLS`}</span>
      </div>

      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-64 rounded-[22px] border bg-muted animate-pulse" />)}</div>
        : filtrados.length === 0 ? (
        <Card className="rounded-[22px] border-dashed"><CardContent className="p-10 text-center"><Lock className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-bold">Nenhum projeto privado ainda</p><p className="text-sm text-muted-foreground">Crie sua primeira matriz no assistente — ela ficará isolada na sua conta.</p><Link to="/assistente"><Button className="mt-4 rounded-full">Criar matriz</Button></Link></CardContent></Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map(p => (
            <Card key={p.id} className="overflow-hidden rounded-[22px] border shadow-sm hover:shadow-lg transition-shadow group">
              <div className="relative h-48 overflow-hidden bg-muted">
                <img src={p.arte} alt={p.titulo} className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500" />
                <span className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black text-white ${statusMap[p.status]?.color ?? "bg-zinc-500"}`}><span className="h-2 w-2 rounded-full bg-white" /> {statusMap[p.status]?.label ?? p.status}</span>
                <span className="absolute right-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur flex items-center gap-1"><Lock className="h-3 w-3" /> Privado</span>
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-black">{p.bastidor} • {p.tecido}</span>
                  <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-bold">{p.pontos.toLocaleString("pt-BR")} pts</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-black leading-tight line-clamp-1">{p.titulo}</h3>
                <p className="text-xs text-muted-foreground">{p.cliente} • {p.maquina} • {p.atualizado}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  {p.cores.slice(0,5).map(c => <span key={c} className="h-6 w-6 rounded-full border-2 border-white shadow" style={{ background: c }} />)}
                  <span className="ml-1 text-xs text-muted-foreground">{p.cores.length} cores</span>
                  <span className="ml-auto flex gap-1">
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => handleView(p)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDownload(p)}><Download className="h-4 w-4" /></Button>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-[22px] overflow-hidden">
          <div className="divide-y">
            {filtrados.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-muted/40">
                <img src={p.arte} alt="" className="h-14 w-14 rounded-xl object-cover border" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-none truncate">{p.titulo}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.cliente} • {p.bastidor} • {p.tecido} • {p.maquina}</p>
                </div>
                <span className={`hidden lg:inline-flex rounded-full px-2.5 py-1 text-xs font-bold text-white ${statusMap[p.status]?.color ?? "bg-zinc-500"}`}>{statusMap[p.status]?.label ?? p.status}</span>
                <span className="hidden lg:inline text-xs font-bold">{p.pontos.toLocaleString()} pts</span>
                <div className="flex gap-1"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleView(p)}><Eye className="h-4 w-4" /></Button><Button size="icon" className="h-8 w-8" onClick={() => handleDownload(p)}><Download className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="rounded-[20px] border bg-foreground p-5 text-background flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary lg:flex"><Sparkles className="h-5 w-5 text-primary-foreground" /></div>
          <div><p className="font-black">Seus arquivos nunca vazam</p><p className="text-sm text-white/70">Cada projeto tem <b>created_by = seu user_id</b>. Política RLS no Supabase bloqueia qualquer outro usuário.</p></div>
        </div>
        <Link to="/assistente" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-black text-black hover:bg-white/90">Criar nova matriz</Link>
      </div>
    </div>
  )
}
