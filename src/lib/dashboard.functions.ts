import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getDashboardStats = createServerFn({ method: "GET" })
  .handler(async () => {
    // Note: In a real app, we'd use the service role client for aggregate stats if RLS restricts them
    // For now, we'll fetch basic counts based on current user permissions
    
    const [campaignsCount, groupsCount, historyCount] = await Promise.all([
      supabase.from("campaigns").select("*", { count: "exact", head: true }),
      supabase.from("groups").select("*", { count: "exact", head: true }),
      supabase.from("campaign_history").select("*", { count: "exact", head: true }),
    ]);

    const [pendingCount, sentCount, errorCount] = await Promise.all([
      supabase.from("campaign_history").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("campaign_history").select("*", { count: "exact", head: true }).eq("status", "sent"),
      supabase.from("campaign_history").select("*", { count: "exact", head: true }).eq("status", "failed"),
    ]);

    return {
      totalCampaigns: campaignsCount.count || 0,
      totalGroups: groupsCount.count || 0,
      totalMessages: historyCount.count || 0,
      pendingMessages: pendingCount.count || 0,
      sentMessages: sentCount.count || 0,
      failedMessages: errorCount.count || 0,
    };
  });
