import { LoginForm } from "@/components/auth/LoginForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AdminLogin = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md mb-8">
                <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </div>
            <LoginForm defaultRole="admin" allowRoleSelection={false} />
        </div>
    );
};

export default AdminLogin;
