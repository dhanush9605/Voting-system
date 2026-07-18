import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <LoginForm defaultRole="voter" allowRoleSelection={false} />
    </div>
  );
};

export default Login;
