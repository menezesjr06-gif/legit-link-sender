import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

/**
 * RLS Validation Functions
 * These functions are used for automated RLS policy testing.
 */

export const validateRLSAccess = createServerFn({ method: "POST" })
  .validator((data: { table: string; operation: 'select' | 'insert' | 'update' | 'delete' }) => 
    z.object({
      table: z.string(),
      operation: z.enum(['select', 'insert', 'update', 'delete'])
    }).parse(data)
  )
  .handler(async ({ data }) => {
    try {
      let query: any;
      const typedTable = data.table as any;
      
      switch (data.operation) {
        case 'select':
          query = supabase.from(typedTable).select("*").limit(1);
          break;
        case 'insert':
          query = supabase.from(typedTable).insert({}).select();
          break;
        case 'update':
          query = supabase.from(typedTable).update({}).eq('id' as any, '00000000-0000-0000-0000-000000000000' as any);
          break;
        case 'delete':
          query = supabase.from(typedTable).delete().eq('id' as any, '00000000-0000-0000-0000-000000000000' as any);
          break;
      }

      const result = await query;
      
      return {
        success: !result.error || result.error.code !== '42501',
        error: result.error ? {
          code: result.error.code,
          message: result.error.message
        } : null,
        data: result.data
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED',
          message: err.message
        }
      };
    }
  });
