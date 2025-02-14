
import React, { useEffect, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import { StepHeader } from './step-config/StepHeader';
import { ToolSelector } from './step-config/ToolSelector';
import { ConditionalExpression } from './step-config/ConditionalExpression';
import { stepConfigSchema, type StepConfigFormValues } from './step-config/types';

interface WorkflowStepConfigProps {
  stepId: string;
  stepOrder: number;
  workflowId: string;
  onMoveStep: (stepId: string, direction: 'up' | 'down') => void;
  onDeleteStep: (stepId: string) => void;
}

export function WorkflowStepConfig({
  stepId,
  stepOrder,
  workflowId,
  onMoveStep,
  onDeleteStep,
}: WorkflowStepConfigProps) {
  const defaultValues: StepConfigFormValues = {
    input_mapping: {},
    output_mapping: {},
    validation_rules: {},
    dependencies: [],
  };

  const form = useForm<StepConfigFormValues>({
    resolver: zodResolver(stepConfigSchema),
    defaultValues,
  });

  const { data: tools } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching tools",
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });

  const { data: step } = useQuery({
    queryKey: ['workflow-step', stepId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('id', stepId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching step configuration",
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    if (step) {
      const formValues: StepConfigFormValues = {
        tool_id: step.tool_id || undefined,
        input_mapping: (step.input_mapping as Record<string, any>) || {},
        output_mapping: (step.output_mapping as Record<string, any>) || {},
        validation_rules: (step.validation_rules as Record<string, any>) || {},
        dependencies: (Array.isArray(step.dependencies) 
          ? step.dependencies.map(d => String(d))
          : []
        ),
        conditional_expression: step.conditional_expression || undefined,
      };

      form.reset(formValues);
    }
  }, [step]);

  const onSubmit = async (values: StepConfigFormValues) => {
    try {
      const updateData = {
        tool_id: values.tool_id,
        input_mapping: values.input_mapping as Json,
        output_mapping: values.output_mapping as Json,
        validation_rules: values.validation_rules as Json,
        dependencies: values.dependencies as Json,
        conditional_expression: values.conditional_expression,
      };

      const { error } = await supabase
        .from('workflow_steps')
        .update(updateData)
        .eq('id', stepId);

      if (error) throw error;

      toast({
        title: "Step configuration updated",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating step configuration",
        description: error.message,
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <StepHeader
          stepOrder={stepOrder}
          onMoveStep={(direction) => onMoveStep(stepId, direction)}
          onDeleteStep={() => onDeleteStep(stepId)}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ToolSelector form={form} tools={tools || []} />
            <ConditionalExpression form={form} />
            <Button type="submit">Save Configuration</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
