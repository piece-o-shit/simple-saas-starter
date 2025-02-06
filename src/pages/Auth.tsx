
import { useState } from "react";
import Login from "@/components/auth/Login";
import Signup from "@/components/auth/Signup";
import AuthLayout from "@/layouts/AuthLayout";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => setIsLogin(!isLogin);

  return (
    <AuthLayout>
      {isLogin ? (
        <Login onToggleAuth={toggleAuth} />
      ) : (
        <Signup onToggleAuth={toggleAuth} />
      )}
    </AuthLayout>
  );
};

export default Auth;
