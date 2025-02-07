
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
      const inputData = stepExecution.input ? 
        (typeof stepExecution.input === 'string' ? 
          JSON.parse(stepExecution.input) : 
          stepExecution.input) as Record<string, any>;

      const result = await executeToolAction(
        stepExecution.workflow_steps.tool_id,
        inputData
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
        input: (typeof completedStep.input === 'string' ? 
          JSON.parse(completedStep.input) : 
          completedStep.input || {}) as Record<string, any>,
        output: (typeof completedStep.output === 'string' ? 
          JSON.parse(completedStep.output) : 
          completedStep.output || {}) as Record<string, any>
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
        input: (typeof failedStep.input === 'string' ? 
          JSON.parse(failedStep.input) : 
          failedStep.input || {}) as Record<string, any>,
        output: (typeof failedStep.output === 'string' ? 
          JSON.parse(failedStep.output) : 
          failedStep.output || {}) as Record<string, any>
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
    input: (typeof step.input === 'string' ? 
      JSON.parse(step.input) : 
      step.input || {}) as Record<string, any>,
    output: (typeof step.output === 'string' ? 
      JSON.parse(step.output) : 
      step.output || {}) as Record<string, any>
  }));
};

