import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoAsset from "@/assets/logo-mj.jpeg.asset.json";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthComponent,
});

function AuthComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = Route.useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
      navigate({ to: "/dashboard" });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Sign up successful! Check your email.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-black border-2 border-primary/20 overflow-hidden shadow-2xl shadow-primary/20 ring-4 ring-primary/5">
            <img src={logoAsset.url} alt="MJ Logo" className="h-full w-full object-cover" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter uppercase text-foreground">MJApp Link Bot</CardTitle>
          <CardDescription className="font-semibold text-primary/80 uppercase tracking-widest text-xs mt-1">Gestão de links & automação</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full font-bold uppercase tracking-wide" onClick={handleLogin} disabled={loading}>
            {loading ? "Carregando..." : "Login"}
          </Button>
          <Button variant="outline" className="w-full font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all" onClick={handleSignUp} disabled={loading}>
            Criar Conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
