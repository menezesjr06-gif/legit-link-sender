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
    // In a real scenario, this would call the Meta API
    console.log("Testing WhatsApp connection for:", data.phoneNumber);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return { success: true, message: "Conexão testada com sucesso!" };
  });
