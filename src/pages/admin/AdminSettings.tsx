import { useState, useEffect } from "react";
import { Settings, User, Lock, Eye, EyeOff, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { SITE_NAME } from "@/lib/site-config";
import { format } from "date-fns";
import api from "@/lib/api";
import { ElectionConfig } from "@/types";
import { Calendar } from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Site settings
  const [siteName, setSiteName] = useState<string>(SITE_NAME);
  const [isSavingSite, setIsSavingSite] = useState(false);

  // Password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Election Info
  const [electionConfig, setElectionConfig] = useState<ElectionConfig>({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [isSavingElection, setIsSavingElection] = useState(false);

  useEffect(() => {
    fetchElectionConfig();
  }, []);

  const fetchElectionConfig = async () => {
    try {
      const { data } = await api.get('/admin/election');
      if (data) {
        // Format dates for input type="datetime-local" if needed, 
        // or just keep ISO strings if using date picker.
        // The standard datetime-local input needs "YYYY-MM-DDThh:mm" format
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString().slice(0, 16);
        };

        setElectionConfig({
          ...data,
          startDate: formatDateForInput(data.startDate),
          endDate: formatDateForInput(data.endDate)
        });
      }
    } catch (error) {
      console.error("Failed to fetch election config", error);
    }
  };

  const handleSaveElection = async () => {
    if (!electionConfig.title || !electionConfig.startDate || !electionConfig.endDate) {
      toast({
        title: "Validation Error",
        description: "Title and dates are required.",
        variant: "destructive"
      });
      return;
    }

    if (new Date(electionConfig.startDate) >= new Date(electionConfig.endDate)) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingElection(true);
    try {
      await api.put('/admin/election', electionConfig);
      toast({
        title: "Election Updated",
        description: "Election information saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save election info.",
        variant: "destructive"
      });
    } finally {
      setIsSavingElection(false);
    }
  };

  // Validation errors
  const [siteNameError, setSiteNameError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleSaveSiteName = async () => {
    setSiteNameError('');

    if (!siteName.trim()) {
      setSiteNameError('Site name is required');
      return;
    }

    if (siteName.trim().length < 2) {
      setSiteNameError('Site name must be at least 2 characters');
      return;
    }

    setIsSavingSite(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      toast({
        title: "Settings saved",
        description: "Site name has been updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSite(false);
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
        <p className="text-muted-foreground mt-1">Manage site settings and your account</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Election Information */}
        <Card className="lg:col-span-2 border-accent-teal/20 bg-accent-teal/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-teal/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-teal" />
              </div>
              <div>
                <CardTitle>Election Information</CardTitle>
                <CardDescription>Configure election details and voting period</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="electionTitle">Election Title</Label>
                <Input
                  id="electionTitle"
                  value={electionConfig.title}
                  onChange={(e) => setElectionConfig({ ...electionConfig, title: e.target.value })}
                  placeholder="e.g. Student Council 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electionDesc">Description</Label>
                <Input
                  id="electionDesc"
                  value={electionConfig.description}
                  onChange={(e) => setElectionConfig({ ...electionConfig, description: e.target.value })}
                  placeholder="Short description of the election"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={electionConfig.startDate}
                  onChange={(e) => setElectionConfig({ ...electionConfig, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={electionConfig.endDate}
                  onChange={(e) => setElectionConfig({ ...electionConfig, endDate: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveElection}
              disabled={isSavingElection}
              className="mt-2"
            >
              {isSavingElection ? 'Saving...' : 'Update Election Info'}
            </Button>
          </CardContent>
        </Card>
        {/* Site Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Customize the site display name</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Display Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => {
                  setSiteName(e.target.value);
                  setSiteNameError('');
                }}
                placeholder="Enter site name"
              />
              {siteNameError && (
                <p className="text-sm text-destructive">{siteNameError}</p>
              )}
            </div>

            <Button
              onClick={handleSaveSiteName}
              disabled={isSavingSite}
              className="w-full sm:w-auto"
            >
              {isSavingSite ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Admin Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Admin Account</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-foreground">
                {user?.name || 'Admin User'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-foreground">
                {user?.email || 'admin@verification.com'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-foreground capitalize">
                {user?.role || 'Admin'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="lg:col-span-2">
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
              className="mt-6"
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
