
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const Workflows = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching workflows",
          description: error.message,
        });
        throw error;
      }

      return data as Workflow[];
    },
  });

  const handleCreateWorkflow = () => {
    navigate("/workflows/new");
  };

  const handleEditWorkflow = (id: string) => {
    navigate(`/workflows/${id}`);
  };

  const handleViewExecutions = (id: string) => {
    navigate(`/workflows/${id}/executions`);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Workflows</h1>
          <Button onClick={handleCreateWorkflow}>
            <Plus className="mr-2" />
            Create Workflow
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center">Loading workflows...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows?.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>{workflow.name}</TableCell>
                  <TableCell>{workflow.description}</TableCell>
                  <TableCell>
                    {new Date(workflow.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(workflow.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditWorkflow(workflow.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewExecutions(workflow.id)}
                      >
                        Executions
                      </Button>
                    </div>
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

export default Workflows;
