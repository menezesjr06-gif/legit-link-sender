import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Wand2, Library, ShieldCheck, Settings2 } from "lucide-react";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { to: "/assistente", icon: Wand2, label: "Criar" },
  { to: "/biblioteca", icon: Library, label: "Biblioteca" },
  { to: "/admin", icon: ShieldCheck, label: "Admin" },
  { to: "/settings", icon: Settings2, label: "Ajustes" },
]

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Navegação principal" className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 xl:hidden">
      <div className="mx-auto flex max-w-[640px] items-stretch justify-around px-1 pt-1.5 safe-area-pb sm:px-2">
        {items.map(item => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/")
          return (
            <Link key={item.to} to={item.to} aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition-all sm:px-3 sm:text-[11px] ${active ? "bg-foreground text-background shadow-lg" : "text-muted-foreground"}`}>
              <item.icon className={`h-5 w-5 shrink-0 ${active ? "" : "opacity-70"}`} />
              <span className="max-w-full truncate leading-none tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
