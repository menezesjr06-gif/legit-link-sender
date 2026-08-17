import { z } from "zod";

const API_VERSION = "v20.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

interface WhatsAppSettings {
  access_token: string;
  phone_number_id: string;
  waba_id: string | null;
}

export async function sendWhatsAppMessage(
  settings: WhatsAppSettings,
  to: string,
  message: string,
  link?: string
) {
  const url = `${BASE_URL}/${settings.phone_number_id}/messages`;

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: {
      preview_url: !!link,
      body: link ? `${message}\n\n${link}` : message,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${settings.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Erro ao enviar mensagem via WhatsApp API");
  }

  return data;
}
