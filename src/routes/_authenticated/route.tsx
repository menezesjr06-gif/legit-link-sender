import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, TopBar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/logo-mj.jpeg.asset.json";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth", search: { redirect: location.href } } as any);
    }
    return { session };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-[300px] shrink-0 border-r bg-sidebar lg:block sticky top-0 h-screen overflow-hidden">
        <AppSidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[56px] items-center gap-3 border-b bg-sidebar px-3 text-sidebar-foreground lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-white hover:bg-white/10 hover:text-white">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-lg border border-white/10 bg-black"><img src={logoAsset.url} alt="MJ" className="h-full w-full object-cover" /></div>
            <span className="text-sm font-black tracking-tight">MJ STÚDIO</span>
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-black text-primary-foreground">PRO</span>
          </div>
          <span className="ml-auto text-[10px] font-bold tracking-widest text-primary">PRIVADO</span>
        </div>

        <TopBar />

        <main className="flex-1 bg-muted/30 pb-[84px] lg:pb-0">
          <div className="mx-auto max-w-[1280px] p-4 lg:p-8">
            <Outlet />
          </div>
        </main>

        <MobileBottomNav />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[300px] bg-sidebar p-0 text-sidebar-foreground border-sidebar-border">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
