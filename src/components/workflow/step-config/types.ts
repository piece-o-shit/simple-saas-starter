
import { z } from "zod";

export type BasicMapping = {
  [key: string]: unknown;
};

export const stepConfigSchema = z.object({
  tool_id: z.string().optional(),
  input_mapping: z.record(z.unknown()).default({}),
  output_mapping: z.record(z.unknown()).default({}),
  validation_rules: z.record(z.unknown()).default({}),
  dependencies: z.array(z.string()).default([]),
  conditional_expression: z.string().optional(),
});

export type StepConfigFormValues = z.infer<typeof stepConfigSchema>;
