
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Tool {
  id: string;
  name: string;
  description: string | null;
  type: 'api' | 'database' | 'file_system' | 'custom';
  created_at: string;
}

const Tools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: tools, isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching tools",
          description: error.message,
        });
        throw error;
      }

      return data as Tool[];
    },
  });

  const handleCreateTool = () => {
    navigate("/tools/new");
  };

  const handleEditTool = (id: string) => {
    navigate(`/tools/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tools</h1>
          <Button onClick={handleCreateTool}>
            <Plus className="mr-2" />
            Create Tool
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center">Loading tools...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools?.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>{tool.name}</TableCell>
                  <TableCell>{tool.description}</TableCell>
                  <TableCell>
                    <span className="capitalize">{tool.type}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(tool.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTool(tool.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tools;
