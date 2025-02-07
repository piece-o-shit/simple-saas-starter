
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toolSchema, type ToolFormValues } from "@/schemas/tool-schema";
import { ToolFormFields } from "@/components/tool/ToolFormFields";
import { useTool } from "@/hooks/use-tool";

const ToolForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tool, isLoading, mutation } = useTool(id);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "api",
      configuration: {},
    },
  });

  if (tool) {
    const formData: ToolFormValues = {
      name: tool.name,
      description: tool.description || "",
      type: tool.type,
      configuration: tool.configuration || {},
    };
    form.reset(formData);
  }

  const onSubmit = async (values: ToolFormValues) => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    mutation.mutate({
      name: values.name,
      description: values.description,
      type: values.type,
      configuration: values.configuration,
      created_by: user.id,
    }, {
      onSuccess: () => navigate('/tools'),
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {id ? 'Edit Tool' : 'Create Tool'}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <ToolFormFields />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tools')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || mutation.isPending}>
                {id ? 'Update' : 'Create'} Tool
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default ToolForm;
