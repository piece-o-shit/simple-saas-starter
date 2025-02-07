
import { z } from "zod";

export const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["api", "database", "file_system", "custom"]),
  configuration: z.any().optional().default({}),
});

export type ToolFormValues = z.infer<typeof toolSchema>;
