
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

export const stepConfigSchema = z.object({
  tool_id: z.string().optional(),
  input_mapping: z.record(z.unknown()).default({}),
  output_mapping: z.record(z.unknown()).default({}),
  validation_rules: z.record(z.unknown()).default({}),
  dependencies: z.array(z.string()).default([]),
  conditional_expression: z.string().optional(),
});

export interface StepConfigFormValues {
  tool_id?: string;
  input_mapping: Record<string, unknown>;
  output_mapping: Record<string, unknown>;
  validation_rules: Record<string, unknown>;
  dependencies: string[];
  conditional_expression?: string;
}
