
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

export const stepConfigSchema = z.object({
  tool_id: z.string().optional(),
  input_mapping: z.record(z.any()).default({}),
  output_mapping: z.record(z.any()).default({}),
  validation_rules: z.record(z.any()).default({}),
  dependencies: z.array(z.string()).default([]),
  conditional_expression: z.string().optional(),
});

export type StepConfigFormValues = {
  tool_id?: string;
  input_mapping: Record<string, any>;
  output_mapping: Record<string, any>;
  validation_rules: Record<string, any>;
  dependencies: string[];
  conditional_expression?: string;
};
