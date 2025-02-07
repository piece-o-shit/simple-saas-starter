
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface IAgent {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IAgentExecution {
  id: string;
  agent_id: string;
  status: AgentStatus;
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
  step_order: number;
  tool_id?: string;
  configuration: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
