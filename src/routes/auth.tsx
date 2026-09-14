import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/logo-mj.jpeg.asset.json";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { ShieldCheck, Lock, Users, Palette, Layers, EyeOff, Sparkles, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: AuthComponent });

function AuthComponent() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = Route.useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message); else { toast.success("Bem-vindo ao MJ Stúdio"); navigate({ to: "/dashboard" }); }
    setLoading(false);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: nome } } });
    if (error) toast.error(error.message); else { toast.success("Conta criada! Verifique seu e-mail."); setMode("login"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-xl border border-border bg-black"><img src={logoAsset.url} alt="MJ" className="h-full w-full object-cover" /></div>
          <span className="font-black tracking-tight">MJ STÚDIO</span>
          <span className="hidden rounded-full bg-primary px-2 py-1 text-[10px] font-black tracking-widest text-primary-foreground lg:inline-flex">MATRIZES PRIVADAS</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="mx-auto grid w-full min-w-0 max-w-[1180px] gap-6 p-3 sm:p-4 lg:grid-cols-[1.05fr_0.95fr] lg:p-8 lg:pt-10">
        {/* Left - pitch */}
        <div className="order-2 lg:order-1">
          <div className="rounded-[24px] bg-foreground p-4 text-background sm:p-6 lg:rounded-[28px] lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-widest"><Sparkles className="h-4 w-4 text-primary" /> BORDADO PROFISSIONAL</div>
            <h1 className="mt-4 text-[30px] font-black leading-[0.95] tracking-tighter lg:text-[42px]">Suas matrizes.<br /><span className="text-primary">100% privadas.</span><br />Seu atelier digital.</h1>
            <p className="mt-4 max-w-[520px] text-sm leading-relaxed text-white/70">Cada cliente vê apenas suas artes e matrizes. Nada é compartilhado. Login autenticado + RLS no Supabase garante isolamento total entre contas.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Feature icon={Lock} title="RLS por usuário" desc="Row Level Security: só seu user_id acessa suas matrizes." />
              <Feature icon={EyeOff} title="Artes sigilosas" desc="Uploads isolados por conta, nunca expostos." />
              <Feature icon={Palette} title="Assistente 7 etapas" desc="Da arte ao arquivo DST/PES sem código." />
              <Feature icon={Layers} title="Biblioteca privada" desc="Filtre por máquina, tecido e bastidor." />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold">✓ Supabase Auth</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold">✓ DST / PES / JEF / EXP</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold">✓ Painel admin no-code</span>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs font-black tracking-widest text-white/50">COMO FUNCIONA O ISOLAMENTO</p>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /><span><b>auth.users</b> → cada login tem um <b>user_id</b> único</span></div>
                <div className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /><span>Tabelas <b>matrizes, projetos</b> com coluna <b>created_by = auth.uid()</b></span></div>
                <div className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /><span>Política RLS: <b>USING (created_by = auth.uid())</b></span></div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat value="4 formatos" label="DST PES JEF EXP" />
            <Stat value="7 etapas" label="Assistente guiado" />
            <Stat value="RLS ativo" label="Privacidade total" />
          </div>
        </div>

        {/* Right - form */}
        <div className="order-1 lg:order-2">
          <div className="rounded-[24px] border bg-card p-4 shadow-xl shadow-black/5 sm:p-6 lg:rounded-[28px] lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">{mode === "login" ? "Entrar no atelier" : "Criar conta privada"}</h2>
                <p className="text-sm text-muted-foreground">{mode === "login" ? "Acesse suas matrizes isoladas." : "Seu espaço privado será criado automaticamente."}</p>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-black lg:flex"><img src={logoAsset.url} alt="MJ" className="h-full w-full rounded-2xl object-cover" /></div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
              <button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")} className={`rounded-full py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${mode === "login" ? "bg-foreground text-background shadow" : "text-muted-foreground"}`}>Entrar</button>
              <button type="button" aria-pressed={mode === "signup"} onClick={() => setMode("signup")} className={`rounded-full py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${mode === "signup" ? "bg-foreground text-background shadow" : "text-muted-foreground"}`}>Cadastrar</button>
            </div>

            <form onSubmit={mode === "login" ? handleLogin : handleSignUp} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome do atelier / responsável</Label>
                  <Input id="signup-name" autoComplete="name" placeholder="Ex: Atelier MJ — Maria" value={nome} onChange={e => setNome(e.target.value)} required={mode === "signup"} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="auth-email">E-mail</Label>
                <Input id="auth-email" type="email" autoComplete="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">Senha</Label>
                <Input id="auth-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Criptografada + isolada por RLS.</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-full py-6 text-sm font-black tracking-wide">
                {loading ? "Processando..." : mode === "login" ? "Entrar no atelier" : "Criar meu espaço privado"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed">
                <p className="font-bold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> Privacidade garantida</p>
                <p className="text-muted-foreground">Suas artes e matrizes ficam vinculadas ao seu <b>user_id</b>. Outros clientes jamais veem seus arquivos — mesmo admins veem via painel controlado.</p>
              </div>
            </form>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4" /> Ao continuar você concorda com o uso privado e isolado dos arquivos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <div className="flex items-center gap-2 text-sm font-black"><Icon className="h-4 w-4 text-primary" /> {title}</div>
      <p className="mt-1 text-xs leading-relaxed text-white/60">{desc}</p>
    </div>
  )
}
function Stat({ value, label }: { value: string, label: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 text-center">
      <div className="text-sm font-black">{value}</div>
      <div className="text-[11px] font-bold tracking-widest text-muted-foreground">{label}</div>
    </div>
  )
}
