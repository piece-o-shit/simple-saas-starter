
import { supabase } from "@/integrations/supabase/client";
import type { IWorkflowExecution, IStepExecution, WorkflowStatus, StepStatus } from "@/types/workflow";
import { toast } from "@/hooks/use-toast";

export type WorkflowExecutionInput = Record<string, any>;
export type WorkflowExecutionOutput = Record<string, any>;

export const startWorkflowExecution = async (
  workflowId: string,
  input?: WorkflowExecutionInput
): Promise<IWorkflowExecution> => {
  try {
    // Create the workflow execution record
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

    // Get workflow steps
    const { data: workflowSteps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });

    if (stepsError) throw stepsError;

    // Create step execution records
    const stepExecutions = workflowSteps.map((step) => ({
      workflow_execution_id: execution.id,
      workflow_step_id: step.id,
      step_order: step.step_order,
      status: 'pending' as StepStatus,
    }));

    const { error: stepExecutionError } = await supabase
      .from('step_executions')
      .insert(stepExecutions);

    if (stepExecutionError) throw stepExecutionError;

    // Start the execution
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

export const executeStep = async (
  executionId: string,
  stepId: string
): Promise<IStepExecution> => {
  try {
    // Get step execution
    const { data: stepExecution, error: getError } = await supabase
      .from('step_executions')
      .select('*, workflow_steps(*)')
      .eq('workflow_execution_id', executionId)
      .eq('workflow_step_id', stepId)
      .single();

    if (getError) throw getError;

    // Update step status to running
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
      // Execute the step based on the tool configuration
      const result = await executeToolAction(
        stepExecution.workflow_steps.tool_id, 
        stepExecution.input as Record<string, any> || {}
      );

      // Update step execution with success
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
        input: completedStep.input as Record<string, any>,
        output: completedStep.output as Record<string, any>
      };
    } catch (error: any) {
      // Update step execution with failure
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
        input: failedStep.input as Record<string, any>,
        output: failedStep.output as Record<string, any>
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

export const continueWorkflowExecution = async (
  executionId: string
): Promise<IWorkflowExecution> => {
  try {
    // Get current execution state
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (executionError) throw executionError;

    // Get all steps for this execution
    const { data: steps, error: stepsError } = await supabase
      .from('step_executions')
      .select('*')
      .eq('workflow_execution_id', executionId)
      .order('step_order', { ascending: true });

    if (stepsError) throw stepsError;

    // Find the next pending step
    const nextStep = steps.find(step => step.status === 'pending');

    if (!nextStep) {
      // All steps are completed
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
        input: completedExecution.input as Record<string, any>,
        output: completedExecution.output as Record<string, any>
      };
    }

    // Update workflow execution status
    const { error: updateError } = await supabase
      .from('workflow_executions')
      .update({
        status: 'running' as WorkflowStatus,
        current_step: nextStep.step_order,
      })
      .eq('id', executionId);

    if (updateError) throw updateError;

    // Execute the next step
    await executeStep(executionId, nextStep.workflow_step_id);

    // Continue with remaining steps
    return continueWorkflowExecution(executionId);
  } catch (error: any) {
    console.error('Error continuing workflow execution:', error);
    // Update workflow execution with failure
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

const executeToolAction = async (
  toolId: string,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  // Get tool configuration
  const { data: tool, error: toolError } = await supabase
    .from('tools')
    .select('*')
    .eq('id', toolId)
    .single();

  if (toolError) throw toolError;

  // Execute tool based on type
  switch (tool.type) {
    case 'api':
      return executeApiTool(tool.configuration, input);
    case 'database':
      return executeDatabaseTool(tool.configuration, input);
    case 'custom':
      return executeCustomTool(tool.configuration, input);
    default:
      throw new Error(`Unsupported tool type: ${tool.type}`);
  }
};

const executeApiTool = async (
  configuration: Record<string, any>,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  // Implementation for API tool execution
  // This is a placeholder - implement actual API call logic
  return { success: true };
};

const executeDatabaseTool = async (
  configuration: Record<string, any>,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  // Implementation for database tool execution
  // This is a placeholder - implement actual database operation logic
  return { success: true };
};

const executeCustomTool = async (
  configuration: Record<string, any>,
  input: Record<string, any>
): Promise<Record<string, any>> => {
  // Implementation for custom tool execution
  // This is a placeholder - implement actual custom tool logic
  return { success: true };
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
    input: data.input as Record<string, any>,
    output: data.output as Record<string, any>
  };
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
    input: step.input as Record<string, any>,
    output: step.output as Record<string, any>
  }));
};
