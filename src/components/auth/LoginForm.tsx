import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, KeyRound, GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";

type LoginMethod = 'email' | 'studentId';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, loginWithStudentId } = useAuth();
  const { toast } = useToast();

  const [role, setRole] = useState<UserRole>('voter');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginMethod === 'email') {
        await login(email, password, role);
      } else {
        await loginWithStudentId(studentId, otp);
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // Redirect based on role
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/voter/dashboard');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only Voter and Admin roles available
  const roleOptions = [
    { value: 'voter', label: 'Voter', icon: User },
    { value: 'admin', label: 'Admin', icon: KeyRound },
  ];

  return (
    <Card className="border-0 shadow-elevated w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role selector - Only Voter and Admin */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">I am a</Label>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
              className="grid grid-cols-2 gap-3"
            >
              {roleOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${role === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                    }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <option.icon className={`w-5 h-5 ${role === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === option.value ? 'text-primary' : 'text-muted-foreground'}`}>
                    {option.label}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Login method toggle for voters */}
          {role === 'voter' && (
            <div className="flex gap-2 p-1 bg-secondary rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${loginMethod === 'email'
                  ? 'bg-card shadow-soft text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('studentId')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${loginMethod === 'studentId'
                  ? 'bg-card shadow-soft text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Student ID
              </button>
            </div>
          )}

          {/* Email login fields */}
          {(loginMethod === 'email' || role !== 'voter') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Student ID login fields */}
          {loginMethod === 'studentId' && role === 'voter' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Enter your student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the OTP sent to your registered email/phone
                </p>
              </div>
            </>
          )}

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>

          {/* Register link for voters */}
          {role === 'voter' && (
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register to vote
              </Link>
            </p>
          )}


        </form>
      </CardContent>
    </Card>
  );
}
