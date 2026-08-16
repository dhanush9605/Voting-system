import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Check, Mail, Bell, Wrench, AlertTriangle, Save, Clock, ShieldCheck, ExternalLink, Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

  // Maintenance Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState("System Under Maintenance");
  const [maintenanceMessage, setMaintenanceMessage] = useState("Vora is currently undergoing scheduled maintenance to improve system security and performance. Please check back soon.");
  const [estimatedEndTime, setEstimatedEndTime] = useState("");
  const [allowAdminBypass, setAllowAdminBypass] = useState(true);
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      if (data.emailNotificationsEnabled !== undefined) setEmailNotificationsEnabled(data.emailNotificationsEnabled);
      if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
      if (data.maintenanceTitle !== undefined) setMaintenanceTitle(data.maintenanceTitle);
      if (data.maintenanceMessage !== undefined) setMaintenanceMessage(data.maintenanceMessage);
      if (data.estimatedEndTime !== undefined) setEstimatedEndTime(data.estimatedEndTime);
      if (data.allowAdminBypass !== undefined) setAllowAdminBypass(data.allowAdminBypass);
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

  const handleToggleMaintenanceMode = async (enabled: boolean) => {
    const previousState = maintenanceMode;
    setMaintenanceMode(enabled);
    setIsUpdatingSettings(true);
    try {
      await api.put('/admin/settings', { 
        maintenanceMode: enabled,
        maintenanceTitle,
        maintenanceMessage,
        estimatedEndTime,
        allowAdminBypass
      });
      toast({
        title: enabled ? "Maintenance Mode Activated 🛠️" : "Maintenance Mode Deactivated ✅",
        description: enabled 
          ? "Vora Client Page is now in maintenance mode. Non-admin users will see the maintenance screen."
          : "Vora Client Page is now live and fully accessible to all users.",
        variant: enabled ? "destructive" : "default"
      });
    } catch (error) {
      setMaintenanceMode(previousState);
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleSaveMaintenanceDetails = async () => {
    setIsSavingMaintenance(true);
    try {
      await api.put('/admin/settings', {
        maintenanceMode,
        maintenanceTitle,
        maintenanceMessage,
        estimatedEndTime,
        allowAdminBypass
      });
      toast({
        title: "Maintenance Details Saved",
        description: "Custom maintenance content updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save maintenance details.",
        variant: "destructive"
      });
    } finally {
      setIsSavingMaintenance(false);
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
        {/* Maintenance Mode Control Card */}
        <Card className={`lg:col-span-2 max-w-4xl transition-all duration-300 ${maintenanceMode ? 'border-amber-500/50 shadow-lg shadow-amber-500/10 bg-amber-500/5' : 'border-border/50'}`}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${maintenanceMode ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-primary/10 text-primary'}`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Vora Client Maintenance Mode</CardTitle>
                    <Badge variant={maintenanceMode ? "destructive" : "outline"} className={maintenanceMode ? "bg-amber-500 text-black hover:bg-amber-600 font-bold" : "text-emerald-500 border-emerald-500/40 bg-emerald-500/10"}>
                      {maintenanceMode ? "ACTIVE" : "OFF (OPERATIONAL)"}
                    </Badge>
                  </div>
                  <CardDescription>Control maintenance state, custom text, and notice for the Vora client page</CardDescription>
                </div>
              </div>

              {/* Instant Toggle Switch */}
              <div className="flex items-center gap-3 bg-background/80 px-4 py-2 rounded-xl border border-border/50">
                <span className="text-sm font-semibold">
                  {maintenanceMode ? 'Maintenance ON' : 'Client Live'}
                </span>
                <Switch 
                  checked={maintenanceMode}
                  onCheckedChange={handleToggleMaintenanceMode}
                  disabled={isUpdatingSettings}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {maintenanceMode && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-bold">Maintenance Mode is currently active!</p>
                  <p>Regular users visiting the Vora Client application will see the maintenance page with your configured details below.</p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mTitle" className="font-semibold">Maintenance Page Title</Label>
                <Input
                  id="mTitle"
                  value={maintenanceTitle}
                  onChange={(e) => setMaintenanceTitle(e.target.value)}
                  placeholder="e.g. Scheduled System Maintenance"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mMessage" className="font-semibold">Maintenance Notice / Message</Label>
                <Textarea
                  id="mMessage"
                  rows={3}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Describe why the app is in maintenance or instructions for voters..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mEndTime" className="font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Estimated Completion Time (Optional)
                </Label>
                <Input
                  id="mEndTime"
                  value={estimatedEndTime}
                  onChange={(e) => setEstimatedEndTime(e.target.value)}
                  placeholder="e.g. 2 (for 2 hours), 30m, 2h, or 5:30 PM"
                />
                <p className="text-[11px] text-muted-foreground">
                  Type hours (e.g. <span className="font-mono text-foreground font-semibold">2</span> or <span className="font-mono text-foreground font-semibold">2h</span>), minutes (<span className="font-mono text-foreground font-semibold">30m</span>), or click a preset:
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 rounded-md"
                    onClick={() => setEstimatedEndTime("30m")}
                  >
                    +30 Mins
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 rounded-md"
                    onClick={() => setEstimatedEndTime("1h")}
                  >
                    +1 Hour
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 rounded-md"
                    onClick={() => setEstimatedEndTime("2h")}
                  >
                    +2 Hours
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 rounded-md"
                    onClick={() => setEstimatedEndTime("4h")}
                  >
                    +4 Hours
                  </Button>
                  {estimatedEndTime && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                      onClick={() => setEstimatedEndTime("")}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Allow Admin Bypass
                    </Label>
                    <p className="text-[11px] text-muted-foreground">Admins can browse client page during maintenance</p>
                  </div>
                  <Switch 
                    checked={allowAdminBypass}
                    onCheckedChange={setAllowAdminBypass}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <a
                href="http://localhost:8080"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Preview Vora Client Page <ExternalLink className="w-3 h-3" />
              </a>
              <Button
                onClick={handleSaveMaintenanceDetails}
                disabled={isSavingMaintenance}
                variant="outline"
                className="gap-2 border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
              >
                <Save className="w-4 h-4" />
                {isSavingMaintenance ? "Saving Details..." : "Save Maintenance Details"}
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* Mobile Application */}
        <Card className="lg:col-span-2 max-w-4xl border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle>VORA Mobile Application</CardTitle>
                <CardDescription>Download the official mobile client for decentralized operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/20 transition-colors gap-4">
              <div className="space-y-0.5">
                <h4 className="font-semibold text-base">Android App (APK)</h4>
                <p className="text-sm text-muted-foreground max-w-[450px]">
                  Download and install the official VORA Admin application directly onto your Android device to manage system settings, voters, and elections on the go.
                </p>
              </div>
              <a
                href="https://expo.dev/artifacts/eas/qvL4Hn4NqpCdOu_4CCKC7vaTxgt4fcdhaVHh9DvxT8k.apk"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto gap-2 font-semibold">
                  <Download className="w-4 h-4" /> Download APK
                </Button>
              </a>
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
