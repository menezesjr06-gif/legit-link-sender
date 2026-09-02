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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="mx-auto flex max-w-[560px] items-center justify-around px-2 py-1.5 safe-area-pb">
        {items.map(item => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/")
          return (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-[11px] font-bold transition-all ${active ? "bg-foreground text-background shadow-lg" : "text-muted-foreground"}`}>
              <item.icon className={`h-5 w-5 ${active ? "" : "opacity-70"}`} />
              <span className="leading-none tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
