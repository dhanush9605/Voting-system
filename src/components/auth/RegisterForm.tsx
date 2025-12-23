import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { User, GraduationCap, Mail, Phone, Shield, Lock, Eye, EyeOff, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { compressImage, isCameraSupported } from "@/lib/image-utils";
import { FaceCapture } from "./FaceCapture";

type RegistrationStep = 'form' | 'camera' | 'preview' | 'submitting' | 'success';

// Password strength indicator
function PasswordStrengthIndicator({ password }: { password: string }) {
    const getStrength = () => {
        if (!password) return { level: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 1) return { level: 1, label: 'Weak', color: 'bg-destructive' };
        if (strength <= 2) return { level: 2, label: 'Fair', color: 'bg-warning' };
        if (strength <= 3) return { level: 3, label: 'Good', color: 'bg-accent-teal' };
        return { level: 4, label: 'Strong', color: 'bg-success' };
    };

    const { level, label, color } = getStrength();

    if (!password) return null;

    return (
        <div className="space-y-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i <= level ? color : 'bg-muted'}`}
                    />
                ))}
            </div>
            <p className={`text-xs ${level <= 1 ? 'text-destructive' : level <= 2 ? 'text-warning' : 'text-muted-foreground'}`}>
                Password strength: {label}
            </p>
        </div>
    );
}

const VIDEO_CONSTRAINTS = {
    width: 640,
    height: 480,
    facingMode: "user",
};

export function RegisterForm() {
    const navigate = useNavigate();
    const { toast } = useToast();


    // Form state
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState<{
        fullName?: string;
        studentId?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    // Camera/image state
    const [consentGiven, setConsentGiven] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [imageHash, setImageHash] = useState<string | null>(null);
    const [step, setStep] = useState<RegistrationStep>('form');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cameraSupported = isCameraSupported();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!studentId.trim()) {
            newErrors.studentId = 'Student ID is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors below.",
                variant: "destructive",
            });
            return;
        }

        setStep('camera');
    };



    const handleRetake = () => {
        setCapturedImage(null);
        setImageHash(null);
        setStep('camera');
    };

    const handleSubmitRegistration = async () => {
        if (!capturedImage || !imageHash) {
            toast({
                title: "Missing photo",
                description: "Please capture or upload a photo.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Use the captured base64 image directly
            // In a real production app, we would upload to S3 here.
            // For this local version, we store the base64 string directly in the DB.
            const publicUrl = capturedImage;

            // 2. Register User
            await api.post('/auth/register', {
                name: fullName,
                studentId,
                email,
                password,
                imageHash,
                imageUrl: publicUrl
            });

            // Mock successful registration
            setStep('success');
            toast({
                title: "Registration submitted!",
                description: "Your registration is pending verification.",
            });
        } catch (error: any) {
            console.error(error);
            let msg = "Something went wrong. Please try again.";

            if (error.code === 'ERR_NETWORK' || !error.response) {
                msg = "Unable to connect to the server. Please check if the backend is running.";
            } else if (error.response?.data?.message) {
                msg = error.response.data.message;
            }

            toast({
                title: "Registration failed",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success state
    if (step === 'success') {
        return (
            <Card className="border-0 shadow-elevated">
                <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-success" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
                    <p className="text-muted-foreground mb-6">
                        Your registration is pending verification. You will be notified once your account is approved.
                    </p>

                    <Button onClick={() => navigate('/login')} variant="hero" size="lg">
                        Go to Login
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-elevated">
            <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold">
                    {step === 'form' ? 'Register to Vote' : step === 'camera' ? 'Capture Your Photo' : 'Confirm Your Photo'}
                </CardTitle>
                <CardDescription>
                    {step === 'form'
                        ? 'Create your voter account to participate in elections'
                        : step === 'camera'
                            ? 'We need your photo for identity verification'
                            : 'Review your photo before submitting'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 'form' && (
                    <form onSubmit={handleFormSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => {
                                        setFullName(e.target.value);
                                        setErrors(prev => ({ ...prev, fullName: undefined }));
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID *</Label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="studentId"
                                    placeholder="Enter your student ID"
                                    value={studentId}
                                    onChange={(e) => {
                                        setStudentId(e.target.value);
                                        setErrors(prev => ({ ...prev, studentId: undefined }));
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            {errors.studentId && <p className="text-sm text-destructive">{errors.studentId}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (optional)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password (min 8 characters)"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            <PasswordStrengthIndicator password={password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                    }}
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                            {confirmPassword && password === confirmPassword && (
                                <p className="text-sm text-success flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Passwords match
                                </p>
                            )}
                        </div>

                        <Button type="submit" variant="hero" size="lg" className="w-full">
                            Continue to Photo Capture
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already registered?{' '}
                            <Link to="/login" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                )}

                {step === 'camera' && (
                    <div className="space-y-6">
                        {/* Consent block */}
                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-primary mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-foreground mb-3">
                                        I consent to allow this site to use my camera for biometric identity verification.
                                        My face biometric data will be hashed and stored securely for login verification.
                                    </p>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                            checked={consentGiven}
                                            onCheckedChange={(checked) => setConsentGiven(checked === true)}
                                        />
                                        <span className="text-sm font-medium">I consent to Face Verification</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Smart Camera */}
                        {consentGiven ? (
                            <div className="space-y-4">
                                <FaceCapture
                                    onCapture={(imageSrc, descriptor) => {
                                        setCapturedImage(imageSrc);
                                        // Store the face descriptor as the hash for biometric matching
                                        setImageHash(JSON.stringify(Array.from(descriptor)));
                                        setStep('preview');
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-center p-8 border-2 border-dashed border-border rounded-xl">
                                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Please accept the consent to start the secure blinking verification.</p>
                            </div>
                        )}

                        <Button variant="ghost" onClick={() => setStep('form')} className="w-full mt-4">
                            Back to details
                        </Button>
                    </div>
                )}

                {step === 'preview' && capturedImage && (
                    <div className="space-y-6">
                        <div className="rounded-xl overflow-hidden bg-muted">
                            <img src={capturedImage} alt="Captured" className="w-full aspect-[4/3] object-cover" />
                        </div>



                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleRetake} className="flex-1">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retake
                            </Button>
                            <Button
                                variant="hero"
                                onClick={handleSubmitRegistration}
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Use this photo'}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
