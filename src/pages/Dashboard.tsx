
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [recentTools, setRecentTools] = useState<any[]>([]);
  const [recentAgents, setRecentAgents] = useState<any[]>([]);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || "");
        
        // Fetch recent tools
        const { data: tools } = await supabase
          .from('tools')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (tools) setRecentTools(tools);

        // Fetch recent agents
        const { data: agents } = await supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (agents) setRecentAgents(agents);
      }
    };

    getProfile();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/tools/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Tool
            </Button>
            <Button onClick={() => navigate('/agents/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Agent
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Recent Tools
              </CardTitle>
              <CardDescription>Your recently created tools</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTools.length > 0 ? (
                <div className="space-y-4">
                  {recentTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => navigate(`/tools/${tool.id}`)}
                    >
                      <div>
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-sm text-gray-500">{tool.description || 'No description'}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(tool.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No tools created yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Recent Agents
              </CardTitle>
              <CardDescription>Your recently created agents</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAgents.length > 0 ? (
                <div className="space-y-4">
                  {recentAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => navigate(`/agents/${agent.id}`)}
                    >
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-gray-500">{agent.description || 'No description'}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(agent.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No agents created yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
