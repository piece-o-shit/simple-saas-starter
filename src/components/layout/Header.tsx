
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Settings, CreditCard, BookOpen, Users, Wrench, GitBranch } from "lucide-react";

interface HeaderProps {
  isAdmin: boolean;
}

const Header = ({ isAdmin }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found, redirecting to auth");
        navigate("/auth");
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: error.message,
        });
      } else {
        console.log("Sign out successful");
        navigate("/auth");
      }
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
      navigate("/auth");
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold">AgentPlate</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/agents"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <Users className="mr-2 h-4 w-4" />
                Agents
              </Link>
              <Link
                to="/workflows"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Workflows
              </Link>
              <Link
                to="/tools"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <Wrench className="mr-2 h-4 w-4" />
                Tools
              </Link>
              <Link
                to="/billing"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
              <Link
                to="/settings"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
              <Link
                to="/documentation"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Documentation
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
