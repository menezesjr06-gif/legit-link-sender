import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const whatsappSettingsSchema = z.object({
  waba_id: z.string().min(1, "Business ID is required"),
  access_token: z.string().min(1, "Access Token is required"),
  phone_number_id: z.string().min(1, "Phone Number ID is required"),
});

export const getWhatsAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("whatsapp_settings")
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });

export const saveWhatsAppSettings = createServerFn({ method: "POST" })
  .inputValidator((data) => whatsappSettingsSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: existing } = await supabase
      .from("whatsapp_settings")
      .select("id")
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from("whatsapp_settings")
        .update({
          waba_id: data.waba_id,
          access_token: data.access_token,
          phone_number_id: data.phone_number_id,
          is_active: true
        })
        .eq("id", existing.id);
    } else {
      result = await supabase
        .from("whatsapp_settings")
        .insert([{
          waba_id: data.waba_id,
          access_token: data.access_token,
          phone_number_id: data.phone_number_id,
          is_active: true
        }]);
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true };
  });

export const testWhatsAppConnection = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ phoneNumber: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: settings, error } = await supabase
      .from("whatsapp_settings")
      .select("*")
      .maybeSingle();

    if (error || !settings) {
      throw new Error("Configurações do WhatsApp não encontradas. Por favor, configure e salve primeiro.");
    }

    const { sendWhatsAppMessage } = await import("./whatsapp.server");

    try {
      await sendWhatsAppMessage(
        {
          access_token: settings.access_token,
          phone_number_id: settings.phone_number_id,
          waba_id: settings.waba_id,
        },
        data.phoneNumber,
        "Olá! Este é um teste de conexão do MJApp Link Bot. Se você recebeu esta mensagem, sua integração com a Meta está funcionando corretamente! 🚀"
      );

      return { success: true, message: "Mensagem de teste enviada com sucesso!" };
    } catch (err: any) {
      throw new Error(`Falha na API do WhatsApp: ${err.message}`);
    }
  });
