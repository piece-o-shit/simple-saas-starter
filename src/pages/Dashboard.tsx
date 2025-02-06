
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || "");
      }
    };

    getProfile();
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Welcome back!
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>You are logged in as: {userEmail}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
