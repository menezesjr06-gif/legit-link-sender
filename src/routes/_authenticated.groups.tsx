import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroups, createGroup } from "@/lib/campaigns.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({ // Temporarily using dashboard file as base for logic
  component: GroupsComponent,
});

function GroupsComponent() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [whatsappId, setWhatsappId] = useState("");
  const [category, setCategory] = useState("");

  const { data: groups } = useSuspenseQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups(),
  });

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setOpen(false);
      setName("");
      setWhatsappId("");
      setCategory("");
      toast.success("Grupo cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao cadastrar grupo");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, whatsapp_group_id: whatsappId, category });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
          <p className="text-muted-foreground">Gerencie as listas de destinatários autorizadas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Grupo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input placeholder="Nome do Grupo" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Input placeholder="ID do WhatsApp (ex: 12036302...) " value={whatsappId} onChange={e => setWhatsappId(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Input placeholder="Categoria (ex: Promoção, VIP)" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp ID</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum grupo cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                groups?.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.whatsapp_group_id}</TableCell>
                    <TableCell>{group.category || "Geral"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Ativo
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
