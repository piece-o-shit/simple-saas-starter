
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AgentFormData {
  name: string;
  description: string;
  is_active: boolean;
}

const AgentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AgentFormData>({
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    const loadAgent = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            name: data.name,
            description: data.description || "",
            is_active: data.is_active || false,
          });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading agent",
          description: error.message,
        });
        navigate("/agents");
      }
    };

    loadAgent();
  }, [id]);

  const onSubmit = async (data: AgentFormData) => {
    setIsLoading(true);
    try {
      if (id) {
        const { error } = await supabase
          .from("agents")
          .update(data)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Agent updated successfully",
        });
      } else {
        const { error } = await supabase.from("agents").insert([data]);

        if (error) throw error;

        toast({
          title: "Agent created successfully",
        });
      }

      navigate("/agents");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving agent",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {id ? "Edit Agent" : "Create Agent"}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter agent name" {...field} />
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
                    <Textarea
                      placeholder="Enter agent description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable or disable this agent
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/agents")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default AgentForm;
