
import { z } from "zod";

// Define schema without using recursive references
export const stepConfigSchema = z.object({
  tool_id: z.string().optional(),
  input_mapping: z.record(z.any()).default({}),
  output_mapping: z.record(z.any()).default({}),
  validation_rules: z.record(z.any()).default({}),
  dependencies: z.array(z.string()).default([]),
  conditional_expression: z.string().optional(),
});

export type StepConfigFormValues = z.infer<typeof stepConfigSchema>;
