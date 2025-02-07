
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { IStepExecution, StepStatus } from "@/types/workflow";
import { executeToolAction } from "./toolExecutor";

export const executeStep = async (
  executionId: string,
  stepId: string
): Promise<IStepExecution> => {
  try {
    const { data: stepExecution, error: getError } = await supabase
      .from('step_executions')
      .select('*, workflow_steps(*)')
      .eq('workflow_execution_id', executionId)
      .eq('workflow_step_id', stepId)
      .single();

    if (getError) throw getError;

    const { data: updatedStep, error: updateError } = await supabase
      .from('step_executions')
      .update({
        status: 'running' as StepStatus,
        started_at: new Date().toISOString(),
      })
      .eq('id', stepExecution.id)
      .select()
      .single();

    if (updateError) throw updateError;

    try {
      const result = await executeToolAction(
        stepExecution.workflow_steps.tool_id,
        (stepExecution.input || {}) as Record<string, any>
      );

      const { data: completedStep, error: completeError } = await supabase
        .from('step_executions')
        .update({
          status: 'completed' as StepStatus,
          output: result,
          completed_at: new Date().toISOString(),
        })
        .eq('id', stepExecution.id)
        .select()
        .single();

      if (completeError) throw completeError;

      return {
        ...completedStep,
        status: completedStep.status as StepStatus,
        input: (completedStep.input || {}) as Record<string, any>,
        output: (completedStep.output || {}) as Record<string, any>
      };
    } catch (error: any) {
      const { data: failedStep, error: failError } = await supabase
        .from('step_executions')
        .update({
          status: 'failed' as StepStatus,
          error: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', stepExecution.id)
        .select()
        .single();

      if (failError) throw failError;

      return {
        ...failedStep,
        status: failedStep.status as StepStatus,
        input: (failedStep.input || {}) as Record<string, any>,
        output: (failedStep.output || {}) as Record<string, any>
      };
    }
  } catch (error: any) {
    console.error('Error executing workflow step:', error);
    toast({
      variant: "destructive",
      title: "Error executing step",
      description: error.message,
    });
    throw error;
  }
};

export const getStepExecutions = async (executionId: string): Promise<IStepExecution[]> => {
  const { data, error } = await supabase
    .from('step_executions')
    .select('*')
    .eq('workflow_execution_id', executionId)
    .order('step_order', { ascending: true });

  if (error) throw error;

  return data.map(step => ({
    ...step,
    status: step.status as StepStatus,
    input: (step.input || {}) as Record<string, any>,
    output: (step.output || {}) as Record<string, any>
  }));
};
