
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

  const mutation = useMutation({
    mutationFn: async (values: WorkflowFormValues) => {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = id
        ? await supabase
            .from('workflows')
            .update({
              name: values.name,
              description: values.description,
              steps: values.steps || [], // Ensure steps is always an array
            })
            .eq('id', id)
        : await supabase
            .from('workflows')
            .insert([{
              name: values.name,
              description: values.description,
              steps: values.steps || [], // Ensure steps is always an array
              created_by: user.id,
            }]);

      if (error) throw error;
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

  if (workflow) {
    // Ensure steps is an array when setting form data
    const workflowSteps = Array.isArray(workflow.steps) ? workflow.steps : [];
    
    form.reset({
      name: workflow.name,
      description: workflow.description || "",
      steps: workflowSteps,
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
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
