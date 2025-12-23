import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FaceVerification() {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);

    const handleFaceCapture = async (imageSrc: string, descriptor: Float32Array) => {
        setIsVerifying(true);
        try {
            // Send descriptor to backend for verification
            const response = await api.post('/auth/verify-face', {
                faceDescriptor: Array.from(descriptor)
            });

            if (response.data.verified) {
                setVerificationResult('success');
                toast({
                    title: "Verification Successful",
                    description: "Your identity has been verified. You can now vote.",
                });
                // Refresh user profile to update status
                await refreshProfile();
            } else {
                setVerificationResult('failed');
                toast({
                    title: "Verification Failed",
                    description: "Face did not match our records. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            setVerificationResult('failed');

            let errorMessage = "Verification failed due to an error.";

            if (error.response) {
                // Server responded
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);

                if (error.response.data && typeof error.response.data === 'object' && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else {
                    errorMessage = `Server Error: ${error.response.status} ${error.response.statusText || ''}`;
                }
            } else if (error.request) {
                // No response
                errorMessage = "No response from server. Check backend connection.";
            } else {
                // Error setting up
                errorMessage = error.message;
            }

            toast({
                title: "Verification Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    if (verificationResult === 'success') {
        return (
            <div className="container max-w-md mx-auto py-10">
                <Card className="border-0 shadow-elevated">
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">You are Verified!</h2>
                        <p className="text-muted-foreground mb-6">
                            Thank you for verifying your identity. You are now eligible to cast your vote.
                        </p>
                        <Button onClick={() => navigate('/dashboard')} variant="hero" size="lg">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-md mx-auto py-10">
            <Card className="border-0 shadow-elevated">
                <CardHeader className="text-center pb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Identity Verification</CardTitle>
                    <CardDescription>
                        Please verify your face to unlock voting access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isVerifying ? (
                        <div className="text-center py-8">
                            <div className="loader mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Verifying your identity...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {verificationResult === 'failed' && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Verification failed. Please try again with better lighting.
                                </div>
                            )}

                            <FaceCapture onCapture={handleFaceCapture} />

                            <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
