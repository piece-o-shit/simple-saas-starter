
import DashboardLayout from "@/components/layout/DashboardLayout";

const Documentation = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Documentation</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Installation & Setup</h2>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Prerequisites</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Node.js & npm installed (via <a href="https://github.com/nvm-sh/nvm#installing-and-updating" className="text-blue-600 hover:underline">nvm</a>)</li>
              <li>Git for version control</li>
              <li>Basic knowledge of React and TypeScript</li>
            </ul>
            
            <h3 className="text-xl font-medium mt-4">Quick Start</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev`}</code>
            </pre>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Database Schema</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Core Tables</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">User Management</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>profiles (user information)</li>
                  <li>user_roles (role-based access)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Automation System</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>agents (automation actors)</li>
                  <li>tools (integration points)</li>
                  <li>agent_tools (agent-tool associations)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Workflow System</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>workflows (process definitions)</li>
                  <li>workflow_steps (atomic actions)</li>
                  <li>workflow_executions (runtime tracking)</li>
                  <li>step_executions (detailed logs)</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium">Row Level Security (RLS)</h3>
              <p className="text-gray-600 mb-2">All tables are protected with Row Level Security policies ensuring that users can only:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>View and manage their own tools and workflows</li>
                <li>Execute workflows and agents they own</li>
                <li>Access execution history for their own workflows and agents</li>
                <li>Create and update steps for their own workflows</li>
              </ul>
              <p className="text-gray-600 mt-2">This security model ensures complete data isolation between users while allowing full functionality within their own workspace.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Deployment Options</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium">Vercel Deployment</h3>
              <p className="text-gray-600">One-click deployment available on the home page. Automatically sets up:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Build configuration</li>
                <li>Environment variables</li>
                <li>SSL certificates</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium">Docker Deployment</h3>
              <p className="text-gray-600">Full Docker support for containerized deployments:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Dockerfile included</li>
                <li>docker-compose.yml for local development</li>
                <li>Multi-stage builds for optimization</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Features & Tiers</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-xl font-medium mb-2">Lite Version (Current)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>User authentication</li>
                <li>Basic workflow automation</li>
                <li>Database integration</li>
                <li>Docker & Vercel support</li>
                <li>Core UI components</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-xl font-medium mb-2">Premium Features</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Advanced workflow templates</li>
                <li>Custom integrations</li>
                <li>Team collaboration</li>
                <li>Analytics dashboard</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Authentication</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>User registration with email and password</li>
            <li>User login with email and password</li>
            <li>Password reset functionality</li>
            <li>Protected routes for authenticated users</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">UI Components</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Responsive navigation header</li>
            <li>Toast notifications for user feedback</li>
            <li>Loading states and error handling</li>
            <li>Form components with validation</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Database & Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Supabase integration for data storage</li>
            <li>Row Level Security (RLS) policies for data isolation</li>
            <li>Secure user profile management</li>
            <li>Role-based access control</li>
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;
