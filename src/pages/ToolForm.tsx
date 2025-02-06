
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["api", "database", "file_system", "custom"]),
  configuration: z.record(z.any()).optional().default({}),
});

type ToolFormValues = z.infer<typeof toolSchema>;

const ToolForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "api",
      configuration: {},
    },
  });

  const { isLoading } = useQuery({
    queryKey: ['tool', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching tool",
          description: error.message,
        });
        throw error;
      }

      if (data) {
        // Extract only the fields we need for the form
        const formData: ToolFormValues = {
          name: data.name,
          description: data.description || "",
          type: data.type,
          configuration: data.configuration || {},
        };
        form.reset(formData);
      }

      return data;
    },
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (values: ToolFormValues) => {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const toolData = {
        ...values,
        created_by: user.id,
      };

      const { error } = id
        ? await supabase
            .from('tools')
            .update(toolData)
            .eq('id', id)
        : await supabase
            .from('tools')
            .insert([toolData]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast({
        title: `Tool ${id ? 'updated' : 'created'} successfully`,
      });
      navigate('/tools');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: `Error ${id ? 'updating' : 'creating'} tool`,
        description: error.message,
      });
    },
  });

  const onSubmit = (values: ToolFormValues) => {
    mutation.mutate(values);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {id ? 'Edit Tool' : 'Create Tool'}
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
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tool type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="file_system">File System</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
