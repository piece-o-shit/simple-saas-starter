
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
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && mounted) {
          console.log("No session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        if (session && mounted) {
          const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin'
          });
          
          if (roleError) {
            console.error("Error checking admin role:", roleError);
            return;
          }
          
          setIsAdmin(hasAdminRole);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          navigate("/auth");
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
