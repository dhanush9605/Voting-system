import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in p-4">
            <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-primary/10" />
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="text-center py-6 space-y-4 animate-scale-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold">Check your email</h3>
                            <p className="text-muted-foreground text-sm">
                                We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">
                                Didn't receive it? Check your spam folder or try again in a few minutes.
                            </p>
                            <Button variant="outline" className="w-full mt-4" onClick={() => setIsSubmitted(false)}>
                                Try another email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending Link...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
