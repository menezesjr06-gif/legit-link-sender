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
import { Plus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/groups")({
  component: GroupsComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["groups"],
      queryFn: () => getGroups(),
    });
  },
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

  const createGroupFn = useServerFn(createGroup);

  const mutation = useMutation({
    mutationFn: (vars: { name: string; whatsapp_group_id: string; category?: string }) => createGroupFn({ data: vars }),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
          <p className="text-muted-foreground">Gerencie as listas de destinatários autorizadas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Grupo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="group-name" className="text-sm font-medium">Nome do grupo</label>
                <Input id="group-name" placeholder="Ex: Clientes VIP" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="group-whatsapp-id" className="text-sm font-medium">ID do WhatsApp</label>
                <Input id="group-whatsapp-id" placeholder="Ex: 12036302..." value={whatsappId} onChange={e => setWhatsappId(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="group-category" className="text-sm font-medium">Categoria</label>
                <Input id="group-category" placeholder="Ex: Promoção, VIP" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 lg:hidden">
        {groups?.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Nenhum grupo cadastrado</CardContent></Card>
        ) : groups?.map((group) => (
          <Card key={group.id} className="border-primary/10 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="min-w-0 flex-1 break-words font-semibold">{group.name}</h2>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Ativo</span>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="min-w-0"><dt className="text-xs font-medium text-muted-foreground">WhatsApp ID</dt><dd className="break-all">{group.whatsapp_group_id}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Categoria</dt><dd>{group.category || "Geral"}</dd></div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden border-primary/10 shadow-lg shadow-primary/5 lg:block">
        <CardContent className="p-0">
          <Table className="min-w-[640px]">
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
