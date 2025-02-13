
import { z } from "zod";

export const stepConfigSchema = z.object({
  tool_id: z.string().optional(),
  input_mapping: z.record(z.unknown()).default({}),
  output_mapping: z.record(z.unknown()).default({}),
  validation_rules: z.record(z.unknown()).default({}),
  dependencies: z.array(z.string()).default([]),
  conditional_expression: z.string().optional(),
});

export type StepConfigFormValues = {
  tool_id?: string;
  input_mapping: Record<string, unknown>;
  output_mapping: Record<string, unknown>;
  validation_rules: Record<string, unknown>;
  dependencies: string[];
  conditional_expression?: string;
};
