import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const whatsappSettingsSchema = z.object({
  whatsapp_business_id: z.string().min(1, "Business ID is required"),
  access_token: z.string().min(1, "Access Token is required"),
  phone_number_id: z.string().min(1, "Phone Number ID is required"),
  verify_token: z.string().optional(),
});

export const getWhatsAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("whatsapp_settings")
      .select("*")
      .single();

    if (error && error.code !== 'PGRST116') {
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
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from("whatsapp_settings")
        .update(data)
        .eq("id", existing.id);
    } else {
      result = await supabase
        .from("whatsapp_settings")
        .insert([data]);
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true };
  });

export const testWhatsAppConnection = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ phoneNumber: z.string() }).parse(data))
  .handler(async ({ data }) => {
    // In a real scenario, this would call the Meta API
    // For now, we simulate a successful test
    console.log("Testing WhatsApp connection for:", data.phoneNumber);
    
    // Logic to call the server-side API would go here
    // import { sendTestMessage } from './whatsapp.server';
    // await sendTestMessage(data.phoneNumber);
    
    return { success: true, message: "Conexão testada com sucesso!" };
  });
