
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { IWorkflowExecution, WorkflowStatus } from "@/types/workflow";
import type { WorkflowExecutionInput, ExecutionContext } from "./types";
import { executeStep } from "./stepExecution";

export const startWorkflowExecution = async (
  workflowId: string,
  input?: WorkflowExecutionInput
): Promise<IWorkflowExecution> => {
  try {
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .insert([{
        workflow_id: workflowId,
        status: 'pending' as WorkflowStatus,
        input: input || {},
        current_step: 0,
        started_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (executionError) throw executionError;

    const { data: workflowSteps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });

    if (stepsError) throw stepsError;

    const stepExecutions = workflowSteps.map((step) => ({
      workflow_execution_id: execution.id,
      workflow_step_id: step.id,
      step_order: step.step_order,
      status: 'pending' as WorkflowStatus,
    }));

    const { error: stepExecutionError } = await supabase
      .from('step_executions')
      .insert(stepExecutions);

    if (stepExecutionError) throw stepExecutionError;

    return continueWorkflowExecution(execution.id);
  } catch (error: any) {
    console.error('Error starting workflow execution:', error);
    toast({
      variant: "destructive",
      title: "Error starting workflow",
      description: error.message,
    });
    throw error;
  }
};

export const continueWorkflowExecution = async (
  executionId: string
): Promise<IWorkflowExecution> => {
  try {
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (executionError) throw executionError;

    const { data: steps, error: stepsError } = await supabase
      .from('step_executions')
      .select('*, workflow_steps(*)')
      .eq('workflow_execution_id', executionId)
      .order('step_order', { ascending: true });

    if (stepsError) throw stepsError;

    const nextStep = steps.find(step => step.status === 'pending');

    if (!nextStep) {
      const { data: completedExecution, error: updateError } = await supabase
        .from('workflow_executions')
        .update({
          status: 'completed' as WorkflowStatus,
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        ...completedExecution,
        status: completedExecution.status as WorkflowStatus,
        input: (completedExecution.input || {}) as Record<string, any>,
        output: (completedExecution.output || {}) as Record<string, any>
      };
    }

    const { error: updateError } = await supabase
      .from('workflow_executions')
      .update({
        status: 'running' as WorkflowStatus,
        current_step: nextStep.step_order,
      })
      .eq('id', executionId);

    if (updateError) throw updateError;

    // Create execution context
    const context: ExecutionContext = {
      workflowId: execution.workflow_id,
      executionId: execution.id,
      previousStepResults: steps
        .filter(step => step.status === 'completed')
        .reduce((acc, step) => ({
          ...acc,
          [step.workflow_steps.id]: step.output
        }), {}),
      globalVariables: execution.input || {},
      currentStepNumber: nextStep.step_order
    };

    await executeStep(executionId, nextStep.workflow_step_id, context);

    return continueWorkflowExecution(executionId);
  } catch (error: any) {
    console.error('Error continuing workflow execution:', error);
    const { error: updateError } = await supabase
      .from('workflow_executions')
      .update({
        status: 'failed' as WorkflowStatus,
        error: error.message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    if (updateError) {
      console.error('Error updating workflow execution status:', updateError);
    }

    toast({
      variant: "destructive",
      title: "Error in workflow execution",
      description: error.message,
    });
    throw error;
  }
};

export const getWorkflowExecution = async (executionId: string): Promise<IWorkflowExecution> => {
  const { data, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('id', executionId)
    .single();

  if (error) throw error;

  return {
    ...data,
    status: data.status as WorkflowStatus,
    input: (data.input || {}) as Record<string, any>,
    output: (data.output || {}) as Record<string, any>
  };
};
