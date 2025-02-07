
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createAgentExecution,
  updateAgentExecution,
  getAgentExecutions,
  getAgentExecutionById
} from "@/services/agentService";
import type { IAgentExecution } from "@/types/agent";

export function useAgentExecution(agentId?: string, executionId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const executionsQuery = useQuery({
    queryKey: ['agent-executions', agentId],
    queryFn: () => getAgentExecutions(agentId!),
    enabled: !!agentId,
  });

  const executionQuery = useQuery({
    queryKey: ['agent-execution', executionId],
    queryFn: () => getAgentExecutionById(executionId!),
    enabled: !!executionId,
  });

  const createMutation = useMutation({
    mutationFn: (input?: Record<string, any>) => 
      createAgentExecution(agentId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-executions', agentId] });
      toast({
        title: "Agent execution started",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error starting agent execution",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<IAgentExecution>) =>
      updateAgentExecution(executionId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-executions', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agent-execution', executionId] });
      toast({
        title: "Agent execution updated",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error updating agent execution",
        description: error.message,
      });
    },
  });

  return {
    executions: executionsQuery.data,
    execution: executionQuery.data,
    isLoadingExecutions: executionsQuery.isLoading,
    isLoadingExecution: executionQuery.isLoading,
    createExecution: createMutation.mutate,
    updateExecution: updateMutation.mutate,
  };
}
