import { useState, useEffect } from "react";
import { 
  CalendarRange, 
  History, 
  PlusCircle, 
  RefreshCcw, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Activity,
  Eye,
  BarChart2,
  Users,
  Trophy,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { ElectionConfig } from "@/types";

export default function ElectionManagement() {
  const { toast } = useToast();

  // Active Election Info
  const [electionConfig, setElectionConfig] = useState<ElectionConfig>({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [isSavingElection, setIsSavingElection] = useState(false);
  const [electionHistory, setElectionHistory] = useState<ElectionConfig[]>([]);

  // History Details
  const [isHistoryDetailsDialogOpen, setIsHistoryDetailsDialogOpen] = useState(false);
  const [selectedHistoryElection, setSelectedHistoryElection] = useState<ElectionConfig | null>(null);
  const [historyResults, setHistoryResults] = useState<{totalVotes: number, results: any[]}>({ totalVotes: 0, results: [] });
  const [isFetchingHistoryDetails, setIsFetchingHistoryDetails] = useState(false);

  const handleOpenHistoryDetails = async (election: ElectionConfig) => {
    setSelectedHistoryElection(election);
    setIsHistoryDetailsDialogOpen(true);
    setIsFetchingHistoryDetails(true);
    try {
      const { data } = await api.get('/admin/results', { params: { electionId: election._id } });
      setHistoryResults(data);
    } catch (error: any) {
      toast({
        title: "Error fetching details",
        description: error.response?.data?.message || "Failed to load election history details",
        variant: "destructive"
      });
      setIsHistoryDetailsDialogOpen(false);
    } finally {
      setIsFetchingHistoryDetails(false);
    }
  };

  useEffect(() => {
    fetchElectionConfig();
    fetchElectionHistory();
  }, []);

  const fetchElectionHistory = async () => {
    try {
      const { data } = await api.get('/admin/elections');
      setElectionHistory(data);
    } catch (error) {
      console.error("Failed to fetch election history", error);
    }
  };

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
        description: "Election info saved successfully."
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

  // Reset Election Data
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
        title: "Session Reset",
        description: "All votes and candidate counts have been cleared."
      });
      setIsResetDialogOpen(false);
      setResetPassword("");
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

  // Start New Election
  const [isNewElectionDialogOpen, setIsNewElectionDialogOpen] = useState(false);
  const [newElectionData, setNewElectionData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    password: '',
    deleteCandidates: false
  });
  const [isStartingNew, setIsStartingNew] = useState(false);

  const handleStartNewElection = async () => {
    if (!newElectionData.title || !newElectionData.startDate || !newElectionData.endDate || !newElectionData.password) {
      toast({ title: "Validation Error", description: "Title, dates, and password are required.", variant: "destructive" });
      return;
    }

    setIsStartingNew(true);
    try {
      await api.post('/admin/election/new', newElectionData);
      toast({
        title: "New Election Started",
        description: "Previous election archived and new session created!"
      });
      setIsNewElectionDialogOpen(false);
      setNewElectionData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        password: '',
        deleteCandidates: false
      });
      fetchElectionConfig();
      fetchElectionHistory();
    } catch (error: any) {
      toast({
        title: "Failed to Start",
        description: error.response?.data?.message || "Invalid password or server error",
        variant: "destructive"
      });
    } finally {
      setIsStartingNew(false);
    }
  };

  // Delete Election
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [electionToDelete, setElectionToDelete] = useState<ElectionConfig | null>(null);
  const [deleteIdPassword, setDeleteIdPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteElection = async () => {
    if (!electionToDelete?._id) return;
    if (!deleteIdPassword) {
      toast({ title: "Password Required", description: "Please enter your admin password.", variant: "destructive" });
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/admin/election/${electionToDelete._id}`, { 
        data: { password: deleteIdPassword } 
      });
      toast({
        title: "Election Deleted",
        description: `"${electionToDelete.title}" has been removed.`
      });
      setIsDeleteDialogOpen(false);
      setElectionToDelete(null);
      setDeleteIdPassword("");
      fetchElectionHistory();
      fetchElectionConfig();
    } catch (error: any) {
      toast({
        title: "Failed to Delete",
        description: error.response?.data?.message || "Server error",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isCompleted = electionConfig.status === 'completed';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CalendarRange className="w-8 h-8 text-primary" />
            Election Management
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-base">
            Control the active election lifecycle, configure dates, and view historical voting events.
          </p>
        </div>
        <Button 
          onClick={() => setIsNewElectionDialogOpen(true)}
          className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Election
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Active Election & Controls */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Active Election Config */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden relative group">
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-500`} />
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Active Election</CardTitle>
                    <CardDescription>Update parameters for the ongoing event</CardDescription>
                  </div>
                </div>
                
                {/* Status Badge */}
                {electionConfig.status && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold tracking-wide shadow-sm
                    ${electionConfig.status === 'active' 
                      ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400' 
                      : electionConfig.status === 'completed' 
                      ? 'border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400' 
                      : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {electionConfig.status === 'active' && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                    {electionConfig.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {electionConfig.status === 'upcoming' && <Clock className="w-3.5 h-3.5" />}
                    {electionConfig.status.toUpperCase()}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="electionTitle" className="font-semibold text-foreground/80">Election Title</Label>
                  <Input
                    id="electionTitle"
                    value={electionConfig.title}
                    onChange={(e) => setElectionConfig({ ...electionConfig, title: e.target.value })}
                    placeholder="e.g. Presidential Election 2026"
                    className="bg-background/50 border-input/50 focus-visible:ring-primary/20 transition-all rounded-lg h-11"
                    disabled={isCompleted}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="electionDesc" className="font-semibold text-foreground/80">Description</Label>
                  <Input
                    id="electionDesc"
                    value={electionConfig.description}
                    onChange={(e) => setElectionConfig({ ...electionConfig, description: e.target.value })}
                    placeholder="Brief objective or context"
                    className="bg-background/50 border-input/50 focus-visible:ring-primary/20 transition-all rounded-lg h-11"
                    disabled={isCompleted}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="font-semibold text-foreground/80">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={electionConfig.startDate}
                    onChange={(e) => setElectionConfig({ ...electionConfig, startDate: e.target.value })}
                    className="bg-background/50 border-input/50 h-11"
                    disabled={isCompleted}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="font-semibold text-foreground/80">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={electionConfig.endDate}
                    onChange={(e) => setElectionConfig({ ...electionConfig, endDate: e.target.value })}
                    className="bg-background/50 border-input/50 h-11"
                    disabled={isCompleted}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6 border-t border-border/40 mt-4 px-6 flex justify-end">
               <Button
                  onClick={handleSaveElection}
                  disabled={isSavingElection || isCompleted}
                  size="lg"
                  className="font-semibold w-full sm:w-auto"
                >
                  {isSavingElection ? 'Applying Updates...' : 'Save Configuration'}
                </Button>
            </CardFooter>
          </Card>

        </div>

        {/* Right Column: Danger Zone */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-destructive/20 bg-gradient-to-b from-card to-destructive/5 overflow-hidden">
            <CardHeader className="pb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Critical actions for the active session</CardDescription>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Emergency Stop */}
              <div className="p-4 rounded-xl border border-destructive/20 bg-background/50 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    Stop Election
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Immediately concludes the active election. No further votes will be accepted.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full font-semibold" 
                  onClick={() => setIsStopDialogOpen(true)}
                  disabled={isCompleted}
                >
                  Force Stop Election
                </Button>
              </div>

              {/* Reset Session */}
              <div className="p-4 rounded-xl border border-destructive/20 bg-background/50 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    Reset Session Data
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wipes all candidate tallies and vote records for the <strong>current</strong> session only.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground font-semibold" 
                  onClick={() => setIsResetDialogOpen(true)}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Erase Current Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Data Section */}
      <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-2">
         <History className="w-6 h-6 text-muted-foreground" />
         Previous Elections
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {electionHistory.length > 0 ? (
          electionHistory.map((election) => (
            <Card key={election._id} className="group hover:-translate-y-1 transition-all duration-300 border-border/60 hover:shadow-xl hover:border-primary/30 flex flex-col h-full bg-card/60 backdrop-blur-sm">
               <CardHeader className="pb-3 border-b border-border/30">
                 <div className="flex justify-between items-start mb-2">
                   <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                      ${election.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                        election.status === 'completed' ? 'bg-slate-500/10 text-slate-500' : 'bg-blue-500/10 text-blue-500'}
                   `}>
                     {election.status || 'COMPLETED'}
                   </div>
                   {election.resultsPublished && (
                     <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                       <CheckCircle2 className="w-3 h-3" /> Published
                     </div>
                   )}
                 </div>
                 <CardTitle className="text-lg line-clamp-1">{election.title}</CardTitle>
                 {election.description && (
                   <CardDescription className="line-clamp-2 mt-1">{election.description}</CardDescription>
                 )}
               </CardHeader>
               <CardContent className="py-4 text-sm space-y-1 mt-auto">
                 <div className="flex justify-between text-muted-foreground">
                   <span>Start:</span>
                   <span className="font-medium text-foreground">{new Date(election.startDate).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between text-muted-foreground">
                   <span>End:</span>
                   <span className="font-medium text-foreground">{new Date(election.endDate).toLocaleDateString()}</span>
                 </div>
               </CardContent>
               <CardFooter className="pt-0 pb-4 px-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-primary/90 hover:bg-primary shadow-sm"
                    onClick={() => handleOpenHistoryDetails(election)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setElectionToDelete(election);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
               </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed rounded-xl border-border/60 bg-muted/20">
             <History className="w-12 h-12 text-muted-foreground/30 mb-3" />
             <h3 className="text-lg font-medium text-foreground">No History Found</h3>
             <p className="text-muted-foreground text-center max-w-sm">
               You don't have any previous elections recorded. Completed sessions will automatically appear here.
             </p>
          </div>
        )}
      </div>

      {/* Reusable Dialogs (Stop, Reset, Delete, New) */}
      
      {/* Stop Dialog */}
      <Dialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Emergency Stop
            </DialogTitle>
            <DialogDescription>
              This will <strong>IMMEDIATELY</strong> end the current election. Voters will no longer be able to cast votes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Admin Password</Label>
            <Input
              type="password"
              placeholder="Confirm your identity"
              value={stopPassword}
              onChange={(e) => setStopPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsStopDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleEmergencyStop} disabled={isStopping}>
              {isStopping ? "Stopping..." : "Confirm Stop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Reset Session Data</DialogTitle>
            <DialogDescription>
              This will <strong>PERMANENTLY DELETE</strong> all voting records and candidate histories for the CURRENT active session. History remains unaffected.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Admin Password</Label>
            <Input
              type="password"
              placeholder="Confirm your identity"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetElection} disabled={isResetting}>
              {isResetting ? "Resetting..." : "Confirm Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Election Dialog */}
      <Dialog open={isNewElectionDialogOpen} onOpenChange={setIsNewElectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-primary" /> Create New Election
            </DialogTitle>
            <DialogDescription>
              Initiate a completely new election instance. The current active parameters will be archived into your history.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Election Title <span className="text-destructive">*</span></Label>
                <Input 
                  placeholder="e.g. Student Council 2026" 
                  value={newElectionData.title}
                  onChange={(e) => setNewElectionData({...newElectionData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input 
                  placeholder="Brief objective" 
                  value={newElectionData.description}
                  onChange={(e) => setNewElectionData({...newElectionData, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date & Time <span className="text-destructive">*</span></Label>
                <Input 
                  type="datetime-local" 
                  value={newElectionData.startDate}
                  onChange={(e) => setNewElectionData({...newElectionData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date & Time <span className="text-destructive">*</span></Label>
                <Input 
                  type="datetime-local" 
                  value={newElectionData.endDate}
                  onChange={(e) => setNewElectionData({...newElectionData, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="bg-muted/40 p-4 rounded-xl border border-border/60">
               <div className="flex items-start space-x-3">
                 <Input 
                   type="checkbox" 
                   id="freshCandidates" 
                   className="mt-1 w-4 h-4 cursor-pointer accent-primary"
                   checked={newElectionData.deleteCandidates}
                   onChange={(e) => setNewElectionData({...newElectionData, deleteCandidates: e.target.checked})}
                 />
                 <div className="flex flex-col">
                   <Label htmlFor="freshCandidates" className="cursor-pointer font-medium text-foreground">
                     Wipe Current Candidates
                   </Label>
                   <span className="text-sm text-muted-foreground mt-0.5">
                     Check this to start with zero candidates, recommended for fresh cycles. Leaving unchecked brings candidates over.
                   </span>
                 </div>
               </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <Label className="text-destructive font-semibold">Admin Password <span className="text-destructive">*</span></Label>
              <Input 
                type="password" 
                placeholder="Required to create a new session" 
                value={newElectionData.password}
                onChange={(e) => setNewElectionData({...newElectionData, password: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNewElectionDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleStartNewElection} 
              disabled={isStartingNew}
              className="bg-primary hover:bg-primary/90 min-w-[140px]"
            >
              {isStartingNew ? "Creating..." : "Start Election"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Details Dialog */}
      <Dialog open={isHistoryDetailsDialogOpen} onOpenChange={setIsHistoryDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b border-border/30 pb-4">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-primary" /> 
              {selectedHistoryElection?.title} - Final Results
            </DialogTitle>
            <DialogDescription>
              {selectedHistoryElection?.description || "Historical data for this election session."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto pr-2 space-y-6">
            {isFetchingHistoryDetails ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading election records...</p>
              </div>
            ) : (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Votes Cast</p>
                      <h4 className="text-2xl font-bold">{historyResults.totalVotes.toLocaleString()}</h4>
                    </div>
                  </div>
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Winner</p>
                      <h4 className="text-lg font-bold line-clamp-1">
                        {historyResults.results.length > 0 ? historyResults.results[0].name : 'N/A'}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Candidate Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-muted-foreground" /> Candidate Tally
                  </h3>
                  {historyResults.results.length > 0 ? (
                    <div className="space-y-5 bg-card/50 border border-border/40 rounded-xl p-5">
                      {historyResults.results.map((candidate, idx) => {
                        const percentage = historyResults.totalVotes > 0 
                          ? ((candidate.votes / historyResults.totalVotes) * 100).toFixed(1) 
                          : "0.0";
                        return (
                          <div key={idx} className="space-y-2 relative">
                            <div className="flex justify-between items-end">
                              <div className="flex items-center gap-2">
                                {idx === 0 ? (
                                  <Trophy className="w-4 h-4 text-amber-500 mb-0.5" />
                                ) : (
                                  <span className="w-4 text-center text-xs font-bold text-muted-foreground">{idx + 1}.</span>
                                )}
                                <span className="font-semibold text-base">{candidate.name}</span>
                                {candidate.party && (
                                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full font-medium text-muted-foreground">{candidate.party}</span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-lg">{candidate.votes.toLocaleString()}</span>
                                <span className="text-muted-foreground text-sm ml-1">votes ({percentage}%)</span>
                              </div>
                            </div>
                            <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-primary' : 'bg-primary/50'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl border-border/60">
                      No candidate data available for this session.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter className="border-t border-border/30 pt-4">
            <Button onClick={() => setIsHistoryDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Permanently Delete
            </DialogTitle>
            <DialogDescription>
              This will destroy <strong>"{electionToDelete?.title}"</strong> along with all candidates and votes tied to it. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Admin Password</Label>
            <Input
              type="password"
              placeholder="Confirm your identity"
              value={deleteIdPassword}
              onChange={(e) => setDeleteIdPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteElection} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
