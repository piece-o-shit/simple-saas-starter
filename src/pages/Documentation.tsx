
import DashboardLayout from "@/components/layout/DashboardLayout";

const Documentation = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold">Documentation</h1>
        
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
          <h2 className="text-2xl font-semibold">User Profile Management</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>View and edit profile information</li>
            <li>Update full name</li>
            <li>Update avatar URL</li>
            <li>View account creation date</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Responsive dashboard layout</li>
            <li>Navigation header with user menu</li>
            <li>Main dashboard overview</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Database & Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Supabase integration for data storage</li>
            <li>Row Level Security (RLS) policies for data protection</li>
            <li>Secure user profile management</li>
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
      </div>
    </DashboardLayout>
  );
};

export default Documentation;
