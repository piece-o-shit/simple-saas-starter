
import type { WorkflowStatus, StepStatus } from "@/types/workflow";

export type WorkflowExecutionInput = Record<string, any>;
export type WorkflowExecutionOutput = Record<string, any>;

export type ToolType = 'api' | 'database' | 'file_system' | 'custom';
export type ToolConfiguration = Record<string, any>;

export interface Tool {
  id: string;
  type: ToolType;
  configuration: ToolConfiguration;
}
