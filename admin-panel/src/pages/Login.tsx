import { LoginForm } from "@/components/auth/LoginForm";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <LoginForm defaultRole="voter" allowRoleSelection={false} />
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Administrator?{" "}
          <Link to="/admin/login" className="font-medium text-primary hover:underline">
            Access Portal
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
