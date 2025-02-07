
export type ToolType = 'api' | 'database' | 'file_system' | 'custom';
export type ToolConfiguration = Record<string, any>;

export interface Tool {
  id: string;
  type: ToolType;
  configuration: ToolConfiguration;
}

export interface WorkflowExecutionInput {
  [key: string]: any;
}

export interface WorkflowExecutionOutput {
  [key: string]: any;
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  previousStepResults: Record<string, any>;
  globalVariables: Record<string, any>;
  currentStepNumber: number;
}

export interface ExecutionOptions {
  timeout?: number;
  retryAttempts?: number;
  allowPartialSuccess?: boolean;
}

export class WorkflowError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

export class ToolExecutionError extends WorkflowError {
  constructor(
    message: string,
    public readonly toolId: string,
    context?: Record<string, any>
  ) {
    super(message, 'TOOL_EXECUTION_ERROR', context);
    this.name = 'ToolExecutionError';
  }
}
