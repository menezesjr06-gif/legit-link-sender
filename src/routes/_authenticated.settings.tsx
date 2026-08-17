import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getWhatsAppSettings, saveWhatsAppSettings, testWhatsAppConnection } from "@/lib/whatsapp.functions";

const settingsSchema = z.object({
  waba_id: z.string().min(1, "O ID da conta comercial é obrigatório"),
  access_token: z.string().min(1, "O token de acesso é obrigatório"),
  phone_number_id: z.string().min(1, "O ID do número de telefone é obrigatório"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testNumber, setTestNumber] = useState("");

  const getSettings = useServerFn(getWhatsAppSettings);
  const saveSettings = useServerFn(saveWhatsAppSettings);
  const testConnection = useServerFn(testWhatsAppConnection);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      waba_id: "",
      access_token: "",
      phone_number_id: "",
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        if (data) {
          form.reset({
            waba_id: data.waba_id || "",
            access_token: data.access_token || "",
            phone_number_id: data.phone_number_id || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Não foi possível carregar as configurações.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [getSettings, form]);

  async function onSubmit(values: SettingsFormValues) {
    try {
      await saveSettings({ data: values });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar as configurações.");
    }
  }

  async function handleTest() {
    if (!testNumber) {
      toast.error("Por favor, insira um número para o teste.");
      return;
    }
    setTesting(true);
    try {
      const result = await testConnection({ data: { phoneNumber: testNumber } });
      toast.success(result.message);
    } catch (error) {
      toast.error("Falha no teste de conexão.");
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da API</h1>
        <p className="text-muted-foreground">
          Gerencie suas credenciais da Meta e WhatsApp Business Platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credenciais do WhatsApp</CardTitle>
            <CardDescription>
              Insira os dados obtidos no painel do Meta for Developers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="waba_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Business Account ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 10987654321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="access_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token (Permanente)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="EAAB..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Use um Token de Acesso do Sistema Permanente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste de Conexão</CardTitle>
            <CardDescription>
              Envie uma mensagem de teste para verificar se a integração está ativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Número de WhatsApp (com DDI)</FormLabel>
              <Input
                placeholder="Ex: 5511999999999"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar Mensagem de Teste
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <div className="text-sm text-muted-foreground">
              <strong>Como obter essas credenciais?</strong>
              <ol className="list-decimal ml-4 mt-1 space-y-1">
                <li>Acesse o Meta for Developers.</li>
                <li>Crie ou selecione seu App de Negócios.</li>
                <li>Adicione o produto WhatsApp.</li>
                <li>Vá em 'Configuração de API' para ver os IDs.</li>
              </ol>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
