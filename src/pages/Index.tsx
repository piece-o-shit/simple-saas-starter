
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-8">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold mb-4">Welcome to AgentPlate</h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            A powerful SaaS boilerplate with authentication, user management, and more.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-x-4">
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/documentation">View Documentation</Link>
            </Button>
          </div>
          
          <div className="pt-4">
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/yourusername/agentplate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://vercel.com/button"
                alt="Deploy with Vercel"
                className="inline-block"
              />
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">Try the Lite Version</h2>
          <p className="text-gray-600 text-sm">
            Get started with core features. Upgrade to Premium for advanced workflows, 
            team collaboration, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
