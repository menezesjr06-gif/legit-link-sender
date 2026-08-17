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
    // Attempt to perform the operation as the authenticated user
    // The RLS policies should either allow this or return an error/empty set
    
    try {
      let query;
      
      switch (data.operation) {
        case 'select':
          query = supabase.from(data.table).select("*").limit(1);
          break;
        case 'insert':
          // Attempting an empty or dummy insert to check permission
          // Note: This might fail due to schema constraints before RLS
          query = supabase.from(data.table).insert({}).select();
          break;
        case 'update':
          query = supabase.from(data.table).update({}).eq('id', '00000000-0000-0000-0000-000000000000');
          break;
        case 'delete':
          query = supabase.from(data.table).delete().eq('id', '00000000-0000-0000-0000-000000000000');
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
