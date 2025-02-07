
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import type { IWorkflowExecution } from "@/types/workflow";

const WorkflowExecutions = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: executions, isLoading } = useQuery({
    queryKey: ['workflow-executions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching workflow executions",
          description: error.message,
        });
        throw error;
      }

      return data as IWorkflowExecution[];
    },
    enabled: !!id,
  });

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Workflow Executions</h1>

        {isLoading ? (
          <div className="text-center">Loading executions...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions?.map((execution) => {
                const duration = execution.completed_at && execution.started_at
                  ? new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()
                  : null;

                return (
                  <TableRow key={execution.id}>
                    <TableCell>
                      <Badge
                        variant={
                          execution.status === 'completed'
                            ? 'success'
                            : execution.status === 'failed'
                            ? 'destructive'
                            : execution.status === 'running'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {execution.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {execution.started_at
                        ? new Date(execution.started_at).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {execution.completed_at
                        ? new Date(execution.completed_at).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {duration ? `${(duration / 1000).toFixed(2)}s` : '-'}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {execution.error || '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkflowExecutions;
