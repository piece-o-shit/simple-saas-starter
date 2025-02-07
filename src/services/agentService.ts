
import { supabase } from "@/integrations/supabase/client";
import type { IAgent, IAgentExecution, AgentStatus } from "@/types/agent";

export interface AgentResponse {
  content: string;
  error?: string;
}

export const invokeAgent = async (query: string): Promise<AgentResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('agent-service', {
      body: { query },
    });

    if (error) throw error;

    return data as AgentResponse;
  } catch (error: any) {
    console.error('Error invoking agent:', error);
    return {
      content: '',
      error: error.message || 'Failed to get response from agent'
    };
  }
};

export const createAgentExecution = async (
  agent_id: string,
  input?: Record<string, any>
): Promise<IAgentExecution> => {
  const { data, error } = await supabase
    .from('agent_executions')
    .insert([{
      agent_id,
      status: 'pending' as AgentStatus,
      input,
      started_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAgentExecution = async (
  execution_id: string,
  updates: Partial<IAgentExecution>
): Promise<void> => {
  const { error } = await supabase
    .from('agent_executions')
    .update(updates)
    .eq('id', execution_id);

  if (error) throw error;
};

export const getAgentExecutions = async (agent_id: string): Promise<IAgentExecution[]> => {
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('agent_id', agent_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAgentExecutionById = async (execution_id: string): Promise<IAgentExecution> => {
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('id', execution_id)
    .single();

  if (error) throw error;
  return data;
};
