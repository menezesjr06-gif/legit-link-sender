import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Wand2, Library, Settings2, ShieldCheck, LogOut, Sparkles, ChevronRight, Search, Bell, MessagesSquare, ContactRound } from "lucide-react";
import logoAsset from "@/assets/logo-mj.jpeg.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", desc: "Visão geral" },
  { label: "Assistente", icon: Wand2, to: "/assistente", desc: "7 etapas", badge: "NOVO" },
  { label: "Biblioteca", icon: Library, to: "/biblioteca", desc: "Matrizes & artes" },
]

const adminNav = [
  { label: "Campanhas", icon: MessagesSquare, to: "/campaigns", desc: "Envios" },
  { label: "Grupos", icon: ContactRound, to: "/groups", desc: "Destinatários" },
  { label: "Painel Admin", icon: ShieldCheck, to: "/admin", desc: "Sem código" },
  { label: "Configurações", icon: Settings2, to: "/settings", desc: "Conta" },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/auth"; };

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
            <img src={logoAsset.url} alt="MJ" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-black tracking-tight leading-none">MJ STÚDIO</span>
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-black tracking-widest text-primary-foreground">PRO</span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-primary">MATRIZES • BORDADO</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 pr-2">
          <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">MJ</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold leading-none">Atelier privado</p>
            <p className="text-[10px] text-white/60">matrizes isoladas por cliente</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input aria-label="Buscar projeto ou arte" placeholder="Buscar projeto, arte..." className="h-9 bg-white/[0.06] border-white/10 pl-9 text-sm placeholder:text-white/40 focus-visible:ring-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          <p className="px-2 pb-2 text-[10px] font-black tracking-[0.16em] text-white/40">CRIAÇÃO</p>
          <nav className="space-y-1">
            {mainNav.map(item => (
              <Link key={item.to} to={item.to} onClick={onNavigate}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${isActive(item.to) ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-white/[0.06] text-white/80 hover:text-white"}`}>
                <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.to) ? "" : "text-white/60 group-hover:text-white"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold leading-none">{item.label}</span>
                    {item.badge && <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black tracking-widest text-black">{item.badge}</span>}
                  </div>
                  <span className={`text-xs ${isActive(item.to) ? "text-white/80" : "text-white/45"}`}>{item.desc}</span>
                </div>
                <ChevronRight className={`h-4 w-4 opacity-40 ${isActive(item.to) ? "opacity-90" : ""}`} />
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-2 pb-2 text-[10px] font-black tracking-[0.16em] text-white/40">GESTÃO</p>
          <nav className="space-y-1">
            {adminNav.map(item => (
              <Link key={item.to} to={item.to} onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive(item.to) ? "bg-white text-black font-semibold" : "hover:bg-white/[0.06] text-white/75"}`}>
                <item.icon className="h-5 w-5" />
                <span className="flex-1 font-medium">{item.label}</span>
                <span className={`text-xs ${isActive(item.to) ? "text-black/50" : "text-white/40"}`}>{item.desc}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/20 via-white/[0.03] to-transparent p-4">
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-primary"><Sparkles className="h-4 w-4" /> ASSISTENTE 7 ETAPAS</div>
          <p className="mt-2 text-sm font-semibold leading-snug">Transforme qualquer arte em matriz pronta para bordar, sem código.</p>
          <p className="mt-1 text-xs text-white/55">Arte → bastidor → tecido → máquina → pontos → cores → exportar</p>
          <Link to="/assistente" onClick={onNavigate} className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            Começar agora
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Abrir notificações" className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"><Bell className="h-4 w-4" /></Button>
          <ThemeToggle />
          <div className="flex-1" />
          <Button variant="ghost" onClick={handleLogout} className="h-8 gap-2 text-white/70 hover:bg-white/10 hover:text-white text-xs font-semibold"><LogOut className="h-4 w-4" /> Sair</Button>
        </div>
        <p className="mt-3 text-center text-[10px] tracking-widest text-white/30">RLS ATIVO • DADOS PRIVADOS POR USUÁRIO</p>
      </div>
    </div>
  )
}

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/assistente": "Assistente de Matriz",
    "/biblioteca": "Biblioteca",
    "/campaigns": "Campanhas",
    "/groups": "Grupos",
    "/admin": "Painel Administrativo",
    "/settings": "Configurações",
  }
  const title = titles[pathname] ?? "MJ Stúdio"
  return (
    <div className="sticky top-0 z-10 flex min-h-[64px] min-w-0 items-center gap-4 border-b bg-background/80 px-3 py-2 backdrop-blur-xl sm:px-4 lg:px-8">
      <div className="min-w-0">
        <h1 className="text-lg font-black tracking-tight lg:text-xl">{title}</h1>
        <p className="hidden text-xs text-muted-foreground lg:block">Matrizes privadas por conta • Supabase RLS • sem exposição entre clientes</p>
      </div>
      <div className="ml-auto hidden items-center gap-2 xl:flex">
        <span className="rounded-full border bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">● Sessão privada</span>
        <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">Bordado Pro</span>
      </div>
    </div>
  )
}
