import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, User, Save, Loader2, CheckCircle, Smartphone, AlertCircle, FileUp, RefreshCw, IdCard, GraduationCap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { ImageUpload } from "@/components/ui/ImageUpload";

const VoterProfile = () => {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [isUpdatingDocs, setIsUpdatingDocs] = useState(false);
    const [newIdCardUrl, setNewIdCardUrl] = useState<string | null>(null);
    const [newImageHash, setNewImageHash] = useState<string | null>(null);
    const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
    const [newName, setNewName] = useState(user?.name || "");
    const [newStudentId, setNewStudentId] = useState(user?.studentId || "");

    useEffect(() => {
        if (user) {
            setNewName(user.name || "");
            setNewStudentId(user.studentId || "");
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please ensure your new passwords match.",
                variant: "destructive",
            });
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast({
                title: "Password too weak",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await api.put('/auth/update-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully.",
                className: "bg-success text-white border-none"
            });
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Could not update password.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateDocuments = async () => {
        const hasTextChanges = newName !== user?.name || newStudentId !== user?.studentId;
        const hasFileChanges = newIdCardUrl || (newImageHash && newImageUrl);

        if (!hasTextChanges && !hasFileChanges) {
            toast({
                title: "No changes made",
                description: "Please update your details or upload new documents.",
                variant: "warning",
            });
            return;
        }

        setIsUpdatingDocs(true);
        try {
            const payload: any = {};
            if (newIdCardUrl) payload.idCardUrl = newIdCardUrl;
            if (newImageHash) payload.imageHash = newImageHash;
            if (newImageUrl) payload.imageUrl = newImageUrl;
            if (newName !== user?.name) payload.name = newName;
            if (newStudentId !== user?.studentId) payload.studentId = newStudentId;

            const res = await api.put('/auth/update-face', payload);

            // Update local user state
            updateUser({
                ...(newIdCardUrl && { idCardUrl: newIdCardUrl }),
                ...(newImageHash && { imageHash: newImageHash }),
                ...(newImageUrl && { imageUrl: newImageUrl }),
                name: res.data.name || user?.name,
                studentId: res.data.studentId || user?.studentId,
                verificationStatus: res.data.verificationStatus || 'pending'
            });

            toast({
                title: "Profile Updated",
                description: "Your profile has been submitted for review.",
                className: "bg-success text-white border-none"
            });

            setNewIdCardUrl(null);
            setNewImageHash(null);
            setNewImageUrl(null);

        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Could not update profile details.",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingDocs(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Left Column: Digital ID Card */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="relative group perspective-1000">
                        <div className="relative w-full aspect-[3/4.5] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 transform group-hover:rotate-y-12 bg-gradient-to-br from-primary/90 to-primary-dark text-white p-6 flex flex-col justify-between border-4 border-white/20">
                            {/* Holographic Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ backgroundSize: '200% 200%' }} />

                            {/* Header */}
                            <div className="flex justify-between items-start z-10">
                                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <span className="font-bold text-xl">VØ</span>
                                </div>
                                <Badge variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 uppercase tracking-widest text-[10px]">
                                    Official ID
                                </Badge>
                            </div>

                            {/* Photo & Name */}
                            <div className="text-center z-10 my-4">
                                <div className="w-32 h-32 mx-auto rounded-full border-4 border-white/30 shadow-inner bg-white/10 mb-4 overflow-hidden relative">
                                    {user?.imageUrl ? (
                                        <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-full h-full p-6 text-white/80" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight mb-1">{user?.name}</h2>
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">{user?.role}</p>
                            </div>

                            {/* ID Details */}
                            <div className="space-y-3 z-10 bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">ID Number</span>
                                    <span className="font-mono font-medium tracking-wide">{user?.studentId}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Status</span>
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <span className={`w-2 h-2 rounded-full ${user?.verificationStatus === 'verified' ? 'bg-green-400' : user?.verificationStatus === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
                                        <span className="capitalize">{user?.verificationStatus}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reflection/Shadow beneath card */}
                        <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/20 blur-xl rounded-full" />
                    </div>

                    <div className="p-4 bg-muted/30 rounded-xl border border-border text-center">
                        <p className="text-xs text-muted-foreground">
                            This digital ID serves as proof of your registration in the VØRA secure voting system.
                        </p>
                    </div>
                </div>

                {/* Right Column: Security & Settings */}
                <div className="flex-1 space-y-6">

                    {/* Resubmit Documents Section for Rejected Users */}
                    {user?.verificationStatus === 'rejected' && (
                        <Card className="border-destructive/30 shadow-sm bg-destructive/5 relative overflow-hidden animate-pulse-slow">
                            <div className="absolute top-0 left-0 w-1 h-full bg-destructive"></div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                                    <AlertCircle className="w-5 h-5" />
                                    Action Required: Verification Rejected
                                </CardTitle>
                                <CardDescription>
                                    Your profile verification was rejected. Please correct your details and re-upload clear documents to re-apply.
                                    {user?.rejectionReason && (
                                        <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive font-medium text-sm">
                                            <strong>Reason:</strong> {user.rejectionReason}
                                        </div>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-6">
                                    {/* Edit Text Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="editName" className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" /> Full Name
                                            </Label>
                                            <Input
                                                id="editName"
                                                placeholder="Enter your full name"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="border-border/50 focus:border-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="editStudentId" className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-primary" /> Student ID
                                            </Label>
                                            <Input
                                                id="editStudentId"
                                                placeholder="Enter your Student ID"
                                                value={newStudentId}
                                                onChange={(e) => setNewStudentId(e.target.value)}
                                                className="border-border/50 focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    {/* Upload Documents */}
                                    <div className="p-4 bg-background rounded-lg border border-border">
                                        <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                                            <IdCard className="w-4 h-4 text-primary" />
                                            Update Student ID Card
                                        </h4>
                                        <ImageUpload
                                            label="Upload New ID Card"
                                            onUploadComplete={(url) => setNewIdCardUrl(url)}
                                        />
                                        {newIdCardUrl && <p className="text-xs text-success mt-2">New ID Card uploaded successfully.</p>}
                                    </div>

                                    <div className="p-4 bg-background rounded-lg border border-border">
                                        <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                                            <User className="w-4 h-4 text-primary" />
                                            Re-capture Face Photo
                                        </h4>
                                        {newImageUrl ? (
                                            <div className="space-y-3">
                                                <div className="rounded-xl overflow-hidden bg-muted relative">
                                                    <img src={newImageUrl} alt="Captured" className="w-full aspect-[4/3] object-cover" />
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm" 
                                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-none"
                                                        onClick={() => { setNewImageUrl(null); setNewImageHash(null); }}
                                                    >
                                                        <RefreshCw className="w-4 h-4 mr-2" /> Retake
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-success flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Face photo ready to submit
                                                </p>
                                            </div>
                                        ) : (
                                            <FaceCapture
                                                onCapture={(imageSrc, descriptor) => {
                                                    setNewImageUrl(imageSrc);
                                                    setNewImageHash(JSON.stringify(Array.from(descriptor)));
                                                }}
                                            />
                                        )}
                                    </div>

                                    <Button 
                                        onClick={handleUpdateDocuments} 
                                        disabled={isUpdatingDocs || (newName === user?.name && newStudentId === user?.studentId && !newIdCardUrl && !newImageUrl)} 
                                        className="w-full"
                                        variant="hero"
                                    >
                                        {isUpdatingDocs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <FileUp className="mr-2 h-4 w-4" />
                                        Submit Profile for Review
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-none shadow-sm bg-card/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="w-5 h-5 text-primary" />
                                Security Center
                            </CardTitle>
                            <CardDescription>Manage your account security and authentication methods.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* 2FA / Biometric Status (Static for visual) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-border bg-background flex items-start gap-3 transition-colors hover:border-primary/30">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">Two-Factor Auth</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Enabled via Email</p>
                                    </div>
                                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-background flex items-start gap-3 transition-colors hover:border-primary/30">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">Biometric Data</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Face ID Registered</p>
                                    </div>
                                    {user?.imageHash ? <CheckCircle className="w-4 h-4 text-green-500 ml-auto" /> : <AlertCircle className="w-4 h-4 text-yellow-500 ml-auto" />}
                                </div>
                            </div>

                            {/* Change Password Form */}
                            <div className="pt-6 border-t border-border">
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <Key className="w-4 h-4 text-muted-foreground" />
                                    Change Password
                                </h3>
                                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type="password"
                                            placeholder="Enter your current password"
                                            value={passwords.currentPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            placeholder="Enter new password (min. 6 chars)"
                                            value={passwords.newPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your new password"
                                            value={passwords.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="mt-2">
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Password
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VoterProfile;
