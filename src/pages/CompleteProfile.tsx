import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function CompleteProfile() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFaceCapture = async (imageSrc: string, descriptor: Float32Array) => {
        setIsLoading(true);
        try {
            const imageHash = JSON.stringify(Array.from(descriptor));

            await api.put('/auth/update-face', {
                imageHash
            });

            // Update local context
            updateUser({ imageHash: imageHash, isFaceVerified: false });

            toast({
                title: "Profile Completed!",
                description: "Your face data has been registered securely.",
            });

            navigate('/voter/dashboard');

        } catch (error: any) {
            console.error("Face Update Error:", error);
            toast({
                title: "Update Failed",
                description: "Failed to save face data. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
                <CardHeader>
                    <CardTitle>One Last Step!</CardTitle>
                    <CardDescription>
                        We need to register your face for secure biometric voting.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-lg border border-border flex gap-3">
                        <Shield className="w-5 h-5 text-primary mt-0.5" />
                        <p className="text-sm text-foreground">
                            Your face data is encrypted and used only to verify your identity when you cast a vote.
                        </p>
                    </div>

                    <FaceCapture onCapture={handleFaceCapture} />

                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => navigate('/voter/dashboard')}
                    >
                        Skip for now (You won't be able to vote)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
