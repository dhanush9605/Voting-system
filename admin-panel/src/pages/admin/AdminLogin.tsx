import { LoginForm } from "@/components/auth/LoginForm";

const AdminLogin = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <LoginForm defaultRole="admin" allowRoleSelection={false} />
        </div>
    );
};

export default AdminLogin;
