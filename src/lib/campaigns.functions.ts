import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getGroups = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  });

export const createGroup = createServerFn({ method: "POST" })
  .input(z.object({
    name: z.string().min(1),
    whatsapp_group_id: z.string().min(1),
    category: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("groups")
      .insert([data]);
    
    if (error) throw error;
    return { success: true };
  });

export const getCampaigns = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*, campaign_recipients(group_id)")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  });

export const createCampaign = createServerFn({ method: "POST" })
  .input(z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    link: z.string().url().optional().or(z.literal("")),
    group_ids: z.array(z.string().uuid()),
    schedule_at: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert([{
        title: data.title,
        message: data.message,
        link: data.link || null,
        schedule_at: data.schedule_at || null,
        status: data.schedule_at ? 'scheduled' : 'draft',
        created_by: user.id
      }])
      .select()
      .single();
    
    if (campaignError) throw campaignError;

    const recipientData = data.group_ids.map(groupId => ({
      campaign_id: campaign.id,
      group_id: groupId
    }));

    const { error: recipientError } = await supabase
      .from("campaign_recipients")
      .insert(recipientData);
    
    if (recipientError) throw recipientError;

    return { success: true, campaignId: campaign.id };
  });
