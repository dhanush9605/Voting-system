import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { ElectionConfig } from "@/types";

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

  const [passwordErrors, setPasswordErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

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

  // Emergency Stop
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
  const [stopPassword, setStopPassword] = useState("");
  const [isStopping, setIsStopping] = useState(false);

  const handleEmergencyStop = async () => {
    if (!stopPassword) {
      toast({ title: "Password Required", description: "Please enter your admin password.", variant: "destructive" });
      return;
    }

    setIsStopping(true);
    try {
      await api.post('/admin/election/stop', { password: stopPassword });
      toast({
        title: "Election Stopped",
        description: "The election has been immediately stopped."
      });
      setIsStopDialogOpen(false);
      setStopPassword("");
      // Refresh config
      fetchElectionConfig();
    } catch (error: any) {
      toast({
        title: "Failed to Stop",
        description: error.response?.data?.message || "Invalid password or server error",
        variant: "destructive"
      });
    } finally {
      setIsStopping(false);
    }
  };

  // Reset Election
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleResetElection = async () => {
    if (!resetPassword) {
      toast({ title: "Password Required", description: "Please enter your admin password.", variant: "destructive" });
      return;
    }

    setIsResetting(true);
    try {
      await api.post('/admin/election/reset', { password: resetPassword });
      toast({
        title: "Election Data Reset",
        description: "All votes and candidate counts have been cleared."
      });
      setIsResetDialogOpen(false);
      setResetPassword("");
      // Refresh config
      fetchElectionConfig();
    } catch (error: any) {
      toast({
        title: "Failed to Reset",
        description: error.response?.data?.message || "Invalid password or server error",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
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

        {/* Danger Zone */}
        <Card className="lg:col-span-2 border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions requiring password confirmation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-background/50">
              <div>
                <h4 className="font-semibold text-foreground">Emergency Stop Election</h4>
                <p className="text-sm text-muted-foreground">Immediately ends the election. Voters will no longer be able to cast votes.</p>
              </div>
              <Button variant="destructive" onClick={() => setIsStopDialogOpen(true)}>
                Stop Election
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-background/50">
              <div>
                <h4 className="font-semibold text-foreground">Reset Election Data</h4>
                <p className="text-sm text-muted-foreground">Clears ALL votes, candidates' counts, and resets voter status to 'not voted'.</p>
              </div>
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setIsResetDialogOpen(true)}>
                Reset Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stop Confirmation Dialog */}
        <Dialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Emergency Stop Election</DialogTitle>
              <DialogDescription>
                This action will <strong>IMMEDIATELY</strong> end the current election.
                Please enter your admin password to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Admin Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={stopPassword}
                  onChange={(e) => setStopPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStopDialogOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleEmergencyStop}
                disabled={isStopping}
              >
                {isStopping ? "Stopping..." : "CONFIRM STOP"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Reset Election Data</DialogTitle>
              <DialogDescription>
                This action will <strong>PERMANENTLY DELETE</strong> all voting records. Candidates' vote counts will be zeroed out.
                Use this only when starting a fresh election.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Admin Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleResetElection}
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "CONFIRM RESET"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminSettings;
