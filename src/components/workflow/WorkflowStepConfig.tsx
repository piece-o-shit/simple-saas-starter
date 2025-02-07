
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

// Define base types for mapping objects
type BasicMapping = {
  [key: string]: unknown;
};

// Define schema with explicit types
const stepConfigSchema = z.object({
  tool_id: z.string().optional(),
  input_mapping: z.record(z.unknown()).default({}),
  output_mapping: z.record(z.unknown()).default({}),
  validation_rules: z.record(z.unknown()).default({}),
  dependencies: z.array(z.string()).default([]),
  conditional_expression: z.string().optional(),
});

type StepConfigFormValues = z.infer<typeof stepConfigSchema>;

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
  const form = useForm<StepConfigFormValues>({
    resolver: zodResolver(stepConfigSchema),
    defaultValues: {
      input_mapping: {},
      output_mapping: {},
      validation_rules: {},
      dependencies: [],
    },
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

      form.reset({
        tool_id: data.tool_id || undefined,
        input_mapping: (data.input_mapping as BasicMapping) || {},
        output_mapping: (data.output_mapping as BasicMapping) || {},
        validation_rules: (data.validation_rules as BasicMapping) || {},
        dependencies: Array.isArray(data.dependencies) 
          ? (data.dependencies as string[]) 
          : [],
        conditional_expression: data.conditional_expression || undefined,
      });

      return data;
    },
  });

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
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary">Step {stepOrder + 1}</Badge>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveStep(stepId, 'up')}
              disabled={stepOrder === 0}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteStep(stepId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tool_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tool" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tools?.map((tool) => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditional_expression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditional Expression</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter condition" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Save Configuration</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
