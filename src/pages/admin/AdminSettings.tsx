import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Check, Mail, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const AdminSettings = () => {
  const { toast } = useToast();

  // Password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // System Settings
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      setEmailNotificationsEnabled(data.emailNotificationsEnabled);
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setEmailNotificationsEnabled(enabled);
    setIsUpdatingSettings(true);
    try {
      await api.put('/admin/settings', { emailNotificationsEnabled: enabled });
      toast({
        title: "Settings Updated",
        description: `Email notifications have been ${enabled ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      setEmailNotificationsEnabled(!enabled); // Revert UI on failure
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const validatePassword = () => {
    const errors: typeof passwordErrors = {};

    if (!oldPassword) {
      errors.oldPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsChangingPassword(true);

    try {
      await api.put('/auth/update-password', {
        currentPassword: oldPassword,
        newPassword
      });

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });

      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    } catch {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Settings & Notifications */}
        <Card className="lg:col-span-2 max-w-4xl border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Configure global application behavior</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emailNotificationsEnabled ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-base">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground max-w-[400px]">
                    Globally enable or disable automated emails sent to users (e.g., verification approvals, election results).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                  {emailNotificationsEnabled ? 'Active' : 'Muted'}
                </span>
                <Switch 
                  checked={emailNotificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                  disabled={isUpdatingSettings}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="lg:col-span-2 max-w-4xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-coral/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent-coral" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      setPasswordErrors(prev => ({ ...prev, oldPassword: undefined }));
                    }}
                    placeholder="Enter current password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.oldPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
                    }}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                )}
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-sm text-success flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="mt-6 font-semibold"
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
