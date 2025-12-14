import { useState, useEffect } from "react";
import { Search, Filter, UserCheck, UserX, Eye, Download, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VoterRecord } from "@/types";
import api from "@/lib/api";

type FilterStatus = "all" | "pending" | "verified" | "rejected";

const VoterManagement = () => {
  const { toast } = useToast();
  const [voters, setVoters] = useState<VoterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [viewImageVoter, setViewImageVoter] = useState<VoterRecord | null>(null);

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      // Fetch all voters
      const { data } = await api.get('/admin/voters');

      // Map backend data to frontend model
      const mappedVoters: VoterRecord[] = data.map((user: any) => ({
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        verificationStatus: user.verificationStatus,
        hasVoted: user.hasVoted,
        registeredAt: user.createdAt,
        imageUrl: user.imageUrl,
        imageHash: user.imageHash
      }));

      setVoters(mappedVoters);
    } catch (error) {
      console.error("Failed to fetch voters", error);
      toast({
        title: "Error fetching voters",
        description: `Could not load voter list. ${(error as any).response?.status} ${(error as any).response?.data?.message || (error as any).message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVoters = voters.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || v.verificationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedVoters.length === 0) {
      toast({ title: "No voters selected", variant: "destructive" });
      return;
    }

    // Process sequentially for now as backend doesn't support bulk yet
    let successCount = 0;
    const status = action === "approve" ? "verified" : "rejected";

    for (const voterId of selectedVoters) {
      try {
        await api.put(`/admin/verify-voter/${voterId}`, { status });
        successCount++;

        // Update local state
        setVoters(prev => prev.map(v =>
          v.id === voterId
            ? { ...v, verificationStatus: status, verifiedAt: new Date().toISOString() }
            : v
        ));
      } catch (error) {
        console.error(`Failed to ${action} voter ${voterId}`);
      }
    }

    toast({
      title: `${action === "approve" ? "Approved" : "Rejected"} ${successCount} voters`,
      variant: successCount > 0 ? "default" : "destructive"
    });
    setSelectedVoters([]);
  };

  const handleSingleAction = async (voterId: string, action: "approve" | "reject") => {
    const status = action === "approve" ? "verified" : "rejected";

    try {
      await api.put(`/admin/verify-voter/${voterId}`, { status });

      setVoters(voters.map(v =>
        v.id === voterId
          ? { ...v, verificationStatus: status, verifiedAt: new Date().toISOString() }
          : v
      ));

      toast({
        title: `Voter ${action === "approve" ? "approved" : "rejected"} successfully`,
        variant: "default"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Action failed",
        description: "Could not update voter status.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (voterId: string) => {
    if (!window.confirm("Are you sure you want to delete this voter? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/admin/voters/${voterId}`);

      setVoters(voters.filter(v => v.id !== voterId));

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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Voter Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage registered voters</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
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
            <div className="flex gap-2">
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
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("reject")}>
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
                                onClick={() => handleSingleAction(voter.id, "reject")}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voter Details: {viewImageVoter?.name}</DialogTitle>
            <DialogDescription>Review voter registration information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="aspect-square w-64 mx-auto rounded-xl bg-muted flex items-center justify-center overflow-hidden">
              {viewImageVoter?.imageUrl ? (
                <img src={viewImageVoter.imageUrl} alt={viewImageVoter.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground">No image available</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
                    if (viewImageVoter) handleSingleAction(viewImageVoter.id, "reject");
                    setViewImageVoter(null);
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
    </div>
  );
};

export default VoterManagement;
