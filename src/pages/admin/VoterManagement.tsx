import { useState } from "react";
import { Search, Filter, UserCheck, UserX, Eye, Download, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VoterRecord } from "@/types";

// Mock voters data
const initialVoters: VoterRecord[] = [
  { id: "1", name: "Sarah Johnson", studentId: "STU001", email: "sarah@example.com", verificationStatus: "pending", hasVoted: false, registeredAt: "2024-01-15T10:30:00Z" },
  { id: "2", name: "Michael Chen", studentId: "STU002", email: "michael@example.com", verificationStatus: "verified", hasVoted: true, registeredAt: "2024-01-14T09:15:00Z", verifiedAt: "2024-01-14T11:00:00Z" },
  { id: "3", name: "Emily Davis", studentId: "STU003", email: "emily@example.com", verificationStatus: "verified", hasVoted: false, registeredAt: "2024-01-13T14:45:00Z", verifiedAt: "2024-01-13T16:30:00Z" },
  { id: "4", name: "James Wilson", studentId: "STU004", email: "james@example.com", verificationStatus: "pending", hasVoted: false, registeredAt: "2024-01-15T08:20:00Z" },
  { id: "5", name: "Lisa Brown", studentId: "STU005", email: "lisa@example.com", verificationStatus: "rejected", hasVoted: false, registeredAt: "2024-01-12T11:00:00Z" },
];

type FilterStatus = "all" | "pending" | "verified" | "rejected";

const VoterManagement = () => {
  const { toast } = useToast();
  const [voters, setVoters] = useState<VoterRecord[]>(initialVoters);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [viewImageVoter, setViewImageVoter] = useState<VoterRecord | null>(null);

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

  const handleBulkAction = (action: "approve" | "reject") => {
    if (selectedVoters.length === 0) {
      toast({ title: "No voters selected", variant: "destructive" });
      return;
    }

    setVoters(voters.map(v => 
      selectedVoters.includes(v.id)
        ? { ...v, verificationStatus: action === "approve" ? "verified" : "rejected", verifiedAt: new Date().toISOString() }
        : v
    ));

    toast({ 
      title: `${action === "approve" ? "Approved" : "Rejected"} ${selectedVoters.length} voters`,
    });
    setSelectedVoters([]);
  };

  const handleSingleAction = (voterId: string, action: "approve" | "reject") => {
    setVoters(voters.map(v => 
      v.id === voterId
        ? { ...v, verificationStatus: action === "approve" ? "verified" : "rejected", verifiedAt: new Date().toISOString() }
        : v
    ));
    toast({ title: `Voter ${action === "approve" ? "approved" : "rejected"}` });
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
                {filteredVoters.map((voter) => (
                  <tr key={voter.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="py-4 px-4">
                      <Checkbox
                        checked={selectedVoters.includes(voter.id)}
                        onCheckedChange={() => toggleSelectVoter(voter.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-medium">{voter.name.charAt(0)}</span>
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
                      </div>
                    </td>
                  </tr>
                ))}
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
            <div className="aspect-square w-48 mx-auto rounded-xl bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
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
            <Button variant="outline" onClick={() => setViewImageVoter(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoterManagement;
