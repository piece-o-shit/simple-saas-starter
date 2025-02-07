
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Tool = Database['public']['Tables']['tools']['Row'];
type InsertTool = Database['public']['Tables']['tools']['Insert'];

export function useTool(id?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toolQuery = useQuery({
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

      return data;
    },
    enabled: !!id,
  });

  const toolMutation = useMutation({
    mutationFn: async (values: InsertTool) => {
      const { error } = id
        ? await supabase
            .from('tools')
            .update(values)
            .eq('id', id)
        : await supabase
            .from('tools')
            .insert([values]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast({
        title: `Tool ${id ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: `Error ${id ? 'updating' : 'creating'} tool`,
        description: error.message,
      });
    },
  });

  return {
    tool: toolQuery.data,
    isLoading: toolQuery.isLoading,
    mutation: toolMutation,
  };
}
