
import { supabase } from "@/integrations/supabase/client";

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
