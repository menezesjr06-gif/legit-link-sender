import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCampaigns, getGroups, createCampaign, updateCampaignStatus } from "@/lib/campaigns.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Play, Pause, XCircle, Clock, RotateCcw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/campaigns")({
  component: CampaignsComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["campaigns"],
        queryFn: () => getCampaigns(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["groups"],
        queryFn: () => getGroups(),
      }),
    ]);
  },
});

function CampaignsComponent() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [scheduleAt, setScheduleAt] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState("1 day");

  const { data: campaigns } = useSuspenseQuery({
    queryKey: ["campaigns"],
    queryFn: () => getCampaigns(),
  });

  const { data: groups } = useSuspenseQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups(),
  });

  const createCampaignFn = useServerFn(createCampaign);
  const updateStatusFn = useServerFn(updateCampaignStatus);

  const createMutation = useMutation({
    mutationFn: (vars: any) => createCampaignFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setOpen(false);
      resetForm();
      toast.success("Campanha criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar campanha");
    }
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: any }) => updateStatusFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Status atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    }
  });

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setLink("");
    setSelectedGroups([]);
    setScheduleAt("");
    setIsRecurring(false);
    setRecurrenceInterval("1 day");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroups.length === 0) {
      toast.error("Selecione pelo menos um grupo");
      return;
    }
    createMutation.mutate({
      title,
      message,
      link,
      group_ids: selectedGroups,
      schedule_at: scheduleAt || undefined,
      is_recurring: isRecurring,
      recurrence_interval: isRecurring ? recurrenceInterval : undefined,
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed': return <Badge variant="outline" className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'sending': return <Badge variant="outline" className="bg-blue-100 text-blue-800 animate-pulse">Enviando</Badge>;
      case 'paused': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pausada</Badge>;
      case 'scheduled': return <Badge variant="outline" className="bg-purple-100 text-purple-800">Agendada</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelada</Badge>;
      default: return <Badge variant="secondary">Rascunho</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie o envio de links e mensagens automáticas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <CardDescription>Configure os detalhes e o agendamento da sua mensagem.</CardDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Título da Campanha</label>
                <Input placeholder="Ex: Promoção de Verão" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea 
                  placeholder="Digite sua mensagem aqui..." 
                  className="min-h-[100px]" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  required 
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Link (opcional)</label>
                <Input placeholder="https://..." value={link} onChange={e => setLink(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Grupos Destinatários</label>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-[150px] overflow-y-auto">
                  {groups?.map(group => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={group.id} 
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedGroups([...selectedGroups, group.id]);
                          else setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                        }}
                      />
                      <label htmlFor={group.id} className="text-sm cursor-pointer truncate">{group.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Agendar para</label>
                  <Input 
                    type="datetime-local" 
                    value={scheduleAt} 
                    onChange={e => setScheduleAt(e.target.value)} 
                  />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="recurring" 
                      checked={isRecurring} 
                      onCheckedChange={(checked) => setIsRecurring(!!checked)} 
                    />
                    <label htmlFor="recurring" className="text-sm font-medium">Recorrente</label>
                  </div>
                  {isRecurring && (
                    <Select value={recurrenceInterval} onValueChange={setRecurrenceInterval}>
                      <SelectTrigger>
                        <SelectValue placeholder="Intervalo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 hour">A cada hora</SelectItem>
                        <SelectItem value="1 day">Diariamente</SelectItem>
                        <SelectItem value="7 days">Semanalmente</SelectItem>
                        <SelectItem value="30 days">Mensalmente</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Campanha"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fila de Envios</CardTitle>
          <CardDescription>Controle as campanhas agendadas e em execução.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-foreground">Campanha</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="font-bold text-foreground">Agendamento</TableHead>
                <TableHead className="font-bold text-foreground">Recorrência</TableHead>
                <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma campanha encontrada
                  </TableCell>
                </TableRow>
              ) : (
                campaigns?.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="font-medium">{campaign.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{campaign.message}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell className="text-sm">
                      {campaign.schedule_at ? format(new Date(campaign.schedule_at), "dd/MM/yy HH:mm") : "-"}
                    </TableCell>
                    <TableCell>
                      {campaign.is_recurring ? (
                        <div className="flex items-center gap-1 text-xs">
                          <RotateCcw className="h-3 w-3" />
                          {campaign.recurrence_interval === '1 day' ? 'Diário' : 
                           campaign.recurrence_interval === '1 hour' ? 'Horário' : 
                           campaign.recurrence_interval === '7 days' ? 'Semanal' : 'Mensal'}
                        </div>
                      ) : "Não"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {campaign.status === 'paused' && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-green-600"
                            onClick={() => statusMutation.mutate({ id: campaign.id, status: 'sending' })}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {(campaign.status === 'sending' || campaign.status === 'scheduled') && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-yellow-600"
                            onClick={() => statusMutation.mutate({ id: campaign.id, status: 'paused' })}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status !== 'cancelled' && campaign.status !== 'completed' && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => statusMutation.mutate({ id: campaign.id, status: 'cancelled' })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
