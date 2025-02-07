
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface IWorkflowExecution {
  id: string;
  workflow_id: string;
  status: WorkflowStatus;
  current_step?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IStepExecution {
  id: string;
  workflow_execution_id: string;
  workflow_step_id: string;
  step_order: number;
  status: StepStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IWorkflowStep {
  id: string;
  workflow_id: string;
  tool_id?: string;
  step_order: number;
  configuration: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
