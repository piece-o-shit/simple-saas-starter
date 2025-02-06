
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "./Header";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });
      
      setIsAdmin(hasAdminRole);
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isAdmin={isAdmin} />
      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
