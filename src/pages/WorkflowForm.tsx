
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkflowStepConfig } from "@/components/workflow/WorkflowStepConfig";
import { Plus } from "lucide-react";

const workflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  steps: z.array(z.any()).default([]),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

const WorkflowForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
      steps: [],
    },
  });

  const { data: workflow, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: steps } = useQuery({
    queryKey: ['workflow-steps', id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', id)
        .order('step_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (values: WorkflowFormValues) => {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (id) {
        const { error } = await supabase
          .from('workflows')
          .update({
            name: values.name,
            description: values.description,
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data: workflow, error: workflowError } = await supabase
          .from('workflows')
          .insert([{
            name: values.name,
            description: values.description,
            created_by: user.id,
          }])
          .select()
          .single();

        if (workflowError) throw workflowError;

        // Create initial step
        const { error: stepError } = await supabase
          .from('workflow_steps')
          .insert([{
            workflow_id: workflow.id,
            step_order: 0,
          }]);

        if (stepError) throw stepError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({
        title: `Workflow ${id ? 'updated' : 'created'} successfully`,
      });
      navigate('/workflows');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: `Error ${id ? 'updating' : 'creating'} workflow`,
        description: error.message,
      });
    },
  });

  const handleAddStep = async () => {
    if (!id) return;

    try {
      const newStepOrder = steps?.length || 0;
      const { error } = await supabase
        .from('workflow_steps')
        .insert([{
          workflow_id: id,
          step_order: newStepOrder,
        }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['workflow-steps', id] });
      toast({
        title: "Step added successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding step",
        description: error.message,
      });
    }
  };

  const handleMoveStep = async (stepId: string, direction: 'up' | 'down') => {
    if (!steps) return;

    const currentStep = steps.find(s => s.id === stepId);
    if (!currentStep) return;

    const newOrder = direction === 'up' 
      ? currentStep.step_order - 1 
      : currentStep.step_order + 1;

    const otherStep = steps.find(s => s.step_order === newOrder);
    if (!otherStep) return;

    try {
      const { error: error1 } = await supabase
        .from('workflow_steps')
        .update({ step_order: newOrder })
        .eq('id', stepId);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('workflow_steps')
        .update({ step_order: currentStep.step_order })
        .eq('id', otherStep.id);

      if (error2) throw error2;

      queryClient.invalidateQueries({ queryKey: ['workflow-steps', id] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error reordering steps",
        description: error.message,
      });
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['workflow-steps', id] });
      toast({
        title: "Step deleted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting step",
        description: error.message,
      });
    }
  };

  if (workflow) {
    form.reset({
      name: workflow.name,
      description: workflow.description || "",
    });
  }

  const onSubmit = (values: WorkflowFormValues) => {
    mutation.mutate(values);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {id ? 'Edit Workflow' : 'Create Workflow'}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="max-w-2xl">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter workflow name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter workflow description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {id && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Steps</h2>
                  <Button onClick={handleAddStep} type="button">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-4">
                  {steps?.map((step, index) => (
                    <WorkflowStepConfig
                      key={step.id}
                      stepId={step.id}
                      stepOrder={index}
                      workflowId={id}
                      onMoveStep={handleMoveStep}
                      onDeleteStep={handleDeleteStep}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/workflows')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || mutation.isPending}>
                {id ? 'Update' : 'Create'} Workflow
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default WorkflowForm;
