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
      const { table, operation } = data;
      
      // Use a dynamic approach to avoid complex type checking issues
      const supabaseClient = supabase as any;
      const queryBuilder = supabaseClient.from(table);
      
      let result;
      
      if (operation === 'select') {
        result = await queryBuilder.select("*").limit(1);
      } else if (operation === 'insert') {
        result = await queryBuilder.insert({}).select();
      } else if (operation === 'update') {
        result = await queryBuilder.update({}).eq('id', '00000000-0000-0000-0000-000000000000');
      } else if (operation === 'delete') {
        result = await queryBuilder.delete().eq('id', '00000000-0000-0000-0000-000000000000');
      } else {
        throw new Error("Invalid operation");
      }
      
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
