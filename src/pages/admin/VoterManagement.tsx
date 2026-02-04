import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Search, Filter, UserCheck, UserX, Eye, Download, CheckCircle, XCircle, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VoterRecord } from "@/types";
import api from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type FilterStatus = "all" | "pending" | "verified" | "rejected";

const VoterManagement = () => {
  const location = useLocation();
  const isVerificationPage = location.pathname === "/admin/verify";

  const { toast } = useToast();
  const { data: votersData, isLoading: loading } = useQuery({
    queryKey: ['admin-voters'],
    queryFn: async () => {
      const { data } = await api.get('/admin/voters');
      return data.map((user: any) => ({
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        verificationStatus: user.verificationStatus,
        hasVoted: user.hasVoted,
        registeredAt: user.createdAt,
        imageUrl: user.imageUrl,
        imageHash: user.imageHash,
        idCardUrl: user.idCardUrl
      }));
    },
    refetchInterval: 15000, // Poll every 15 seconds
  });

  const voters = votersData || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(isVerificationPage ? "pending" : "all");
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [viewImageVoter, setViewImageVoter] = useState<VoterRecord | null>(null);
  const [rejectDialogVoter, setRejectDialogVoter] = useState<VoterRecord | null>(null);
  const [isBulkReject, setIsBulkReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const PREDEFINED_REASONS = [
    "Blurry ID Card Image",
    "Face Does Not Match ID",
    "ID Card Expired",
    "Details Do Not Match",
    "Invalid Document Type"
  ];

  // Update filter based on route change
  useEffect(() => {
    setFilterStatus(isVerificationPage ? "pending" : "all");
  }, [isVerificationPage]);

  const queryClient = useQueryClient();

  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || v.verificationStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [voters, searchQuery, filterStatus]);

  const toggleSelectVoter = (voterId: string) => {
    setSelectedVoters(prev =>
      prev.includes(voterId)
        ? prev.filter(id => id !== voterId)
        : [...prev, voterId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVoters.length === filteredVoters.length) {
      setSelectedVoters([]);
    } else {
      setSelectedVoters(filteredVoters.map(v => v.id));
    }
  };

  const handleBulkAction = async (action: "approve" | "reject", reason?: string) => {
    if (selectedVoters.length === 0) {
      toast({ title: "No voters selected", variant: "destructive" });
      return;
    }

    // Process sequentially for now as backend doesn't support bulk yet
    let successCount = 0;
    const status = action === "approve" ? "verified" : "rejected";

    for (const voterId of selectedVoters) {
      try {
        await api.put(`/admin/verify-voter/${voterId}`, {
          status,
          rejectionReason: reason
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to ${action} voter ${voterId}`);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['admin-voters'] });

    toast({
      title: `${action === "approve" ? "Approved" : "Rejected"} ${successCount} voters`,
      variant: successCount > 0 ? "default" : "destructive"
    });
    setSelectedVoters([]);
    setIsBulkReject(false);
    setRejectionReason("");
    setSelectedReason("");
  };

  const handleSingleAction = async (voterId: string, action: "approve" | "reject", reason?: string) => {
    const status = action === "approve" ? "verified" : "rejected";

    try {
      await api.put(`/admin/verify-voter/${voterId}`, {
        status,
        rejectionReason: reason
      });

      queryClient.invalidateQueries({ queryKey: ['admin-voters'] });

      toast({
        title: `Voter ${action === "approve" ? "approved" : "rejected"} successfully`,
        variant: "default"
      });

      // Close dialogs
      setRejectDialogVoter(null);
      setRejectionReason("");
      setSelectedReason("");

    } catch (error) {
      console.error(error);
      toast({
        title: "Action failed",
        description: "Could not update voter status.",
        variant: "destructive"
      });
    }
  };

  const openRejectDialog = (voter: VoterRecord) => {
    setRejectDialogVoter(voter);
    setSelectedReason(PREDEFINED_REASONS[0]);
    setRejectionReason("");
  };

  const openBulkRejectDialog = () => {
    setIsBulkReject(true);
    setSelectedReason(PREDEFINED_REASONS[0]);
    setRejectionReason("");
  };

  const handleDelete = async (voterId: string) => {
    if (!window.confirm("Are you sure you want to delete this voter? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/admin/voters/${voterId}`);

      queryClient.invalidateQueries({ queryKey: ['admin-voters'] });

      toast({
        title: "Voter deleted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Delete failed",
        description: "Could not delete voter.",
        variant: "destructive"
      });
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Name", "Student ID", "Email", "Status", "Voted", "Registered At"].join(","),
      ...filteredVoters.map(v => [
        v.name,
        v.studentId,
        v.email || "",
        v.verificationStatus,
        v.hasVoted ? "Yes" : "No",
        new Date(v.registeredAt).toLocaleDateString(),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voters.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported successfully" });
  };

  const statusColors = {
    pending: "bg-warning/10 text-warning",
    verified: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {isVerificationPage ? "Voter Verification" : "Voter Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isVerificationPage ? "Review and approve pending voter applications" : "Review and manage registered voters"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold animate-pulse border border-primary/20">
            <RefreshCw className="w-3 h-3" />
            LIVE
          </div>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, student ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "verified", "rejected"] as FilterStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedVoters.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedVoters.length} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="success" onClick={() => handleBulkAction("approve")}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve Selected
            </Button>
            <Button size="sm" variant="destructive" onClick={openBulkRejectDialog}>
              <XCircle className="w-4 h-4 mr-1" />
              Reject Selected
            </Button>
          </div>
        </div>
      )}

      {/* Voters Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-4">
                    <Checkbox
                      checked={selectedVoters.length === filteredVoters.length && filteredVoters.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Student ID</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Voted</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Registered</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading voters...
                    </td>
                  </tr>
                ) : filteredVoters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No voters found match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredVoters.map((voter) => (
                    <tr key={voter.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="py-4 px-4">
                        <Checkbox
                          checked={selectedVoters.includes(voter.id)}
                          onCheckedChange={() => toggleSelectVoter(voter.id)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            {voter.imageUrl ? (
                              <img src={voter.imageUrl} alt={voter.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-medium">{voter.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="font-medium text-foreground">{voter.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{voter.studentId}</td>
                      <td className="py-4 px-4 text-muted-foreground">{voter.email || "-"}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[voter.verificationStatus]}`}>
                          {voter.verificationStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {voter.hasVoted ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {new Date(voter.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewImageVoter(voter)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {voter.idCardUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(voter.idCardUrl, '_blank')}
                              title="View ID Card"
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          {voter.verificationStatus === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSingleAction(voter.id, "approve")}
                              >
                                <UserCheck className="w-4 h-4 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openRejectDialog(voter)}
                              >
                                <UserX className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(voter.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete Voter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Image Dialog */}
      <Dialog open={!!viewImageVoter} onOpenChange={() => setViewImageVoter(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Voter Details: {viewImageVoter?.name}</DialogTitle>
            <DialogDescription>Review voter registration information</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Face Image */}
              <div className="space-y-2">
                <h4 className="font-medium text-center text-sm text-muted-foreground">Face Capture</h4>
                <div className="aspect-square w-full rounded-xl bg-muted flex items-center justify-center overflow-hidden border">
                  {viewImageVoter?.imageUrl ? (
                    <img src={viewImageVoter.imageUrl} alt="Face" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground">No face image</span>
                  )}
                </div>
              </div>

              {/* ID Card Image */}
              <div className="space-y-2">
                <h4 className="font-medium text-center text-sm text-muted-foreground">ID Card Document</h4>
                <div className="aspect-video w-full rounded-xl bg-muted flex items-center justify-center overflow-hidden border relative group">
                  {viewImageVoter?.idCardUrl ? (
                    <>
                      <img src={viewImageVoter.idCardUrl} alt="ID Card" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" onClick={() => window.open(viewImageVoter.idCardUrl, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Full
                        </Button>
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No ID card uploaded</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
              <div>
                <span className="text-muted-foreground">Student ID:</span>
                <p className="font-medium">{viewImageVoter?.studentId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{viewImageVoter?.email || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium capitalize">{viewImageVoter?.verificationStatus}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Registered:</span>
                <p className="font-medium">{viewImageVoter && new Date(viewImageVoter.registeredAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            {viewImageVoter?.verificationStatus === "pending" && (
              <div className="flex gap-2 w-full">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (viewImageVoter) {
                      setViewImageVoter(null);
                      openRejectDialog(viewImageVoter);
                    }
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={() => {
                    if (viewImageVoter) handleSingleAction(viewImageVoter.id, "approve");
                    setViewImageVoter(null);
                  }}
                >
                  Approve
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setViewImageVoter(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectDialogVoter || isBulkReject} onOpenChange={() => { setRejectDialogVoter(null); setIsBulkReject(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {isBulkReject ? `${selectedVoters.length} Voters` : 'Voter Registration'}</DialogTitle>
            <DialogDescription>
              Please specify the reason for rejecting {isBulkReject ? 'these applications' : `${rejectDialogVoter?.name}'s application`}. This will be sent to them via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Common Reasons</label>
              <div className="grid grid-cols-1 gap-2">
                {PREDEFINED_REASONS.map((reason) => (
                  <div
                    key={reason}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedReason === reason ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    <span className="text-sm">{reason}</span>
                  </div>
                ))}
                <div
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedReason === 'Other' ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                  onClick={() => setSelectedReason('Other')}
                >
                  <span className="text-sm">Other (Custom Reason)</span>
                </div>
              </div>
            </div>

            {(selectedReason === 'Other' || true) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {selectedReason === 'Other' ? 'Custom Reason' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={selectedReason === 'Other' ? "Enter detailed rejection reason..." : "Add specific details if needed..."}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialogVoter(null); setIsBulkReject(false); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                const finalReason = selectedReason === 'Other'
                  ? rejectionReason
                  : rejectionReason ? `${selectedReason}. ${rejectionReason}` : selectedReason;

                if (!finalReason) {
                  toast({ title: "Please provide a reason", variant: "destructive" });
                  return;
                }

                if (isBulkReject) {
                  handleBulkAction("reject", finalReason);
                } else if (rejectDialogVoter) {
                  handleSingleAction(rejectDialogVoter.id, "reject", finalReason);
                }
              }}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoterManagement;
