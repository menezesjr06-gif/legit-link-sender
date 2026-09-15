import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, TopBar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import logoAsset from "@/assets/logo-mj.jpeg.asset.json";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      } as any);
    }

    return { session };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full min-w-0 overflow-x-clip bg-background">
      <aside className="sticky top-0 hidden h-dvh w-[280px] shrink-0 overflow-hidden border-r bg-sidebar xl:block">
        <AppSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-sidebar/95 px-3 text-sidebar-foreground shadow-sm backdrop-blur-xl xl:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu de navegação"
            aria-expanded={open}
            className="shrink-0 text-white hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
              <img src={logoAsset.url} alt="Logotipo MJ Stúdio" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-tight tracking-tight">MJ STÚDIO</p>
              <p className="truncate text-[10px] font-semibold text-white/55">Matrizes e bordados</p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-primary px-2 py-1 text-[9px] font-black tracking-wider text-primary-foreground">
            PRO
          </span>
        </header>

        <div className="hidden xl:block">
          <TopBar />
        </div>

        <main className="min-w-0 flex-1 bg-muted/30 pb-[calc(76px+env(safe-area-inset-bottom))] xl:pb-0">
          <div className="mx-auto w-full min-w-0 max-w-[1280px] p-3 sm:p-5 lg:p-8">
            <Outlet />
          </div>
        </main>

        <MobileBottomNav />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-[min(280px,calc(100vw-1rem))] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
