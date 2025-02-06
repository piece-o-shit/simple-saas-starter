
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to AgentPlate</h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          A powerful SaaS boilerplate with authentication, user management, and more.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
