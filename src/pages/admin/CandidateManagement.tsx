import { useState } from "react";
import { Plus, Edit2, Trash2, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Candidate } from "@/types";

// Mock candidates data
const initialCandidates: Candidate[] = [
  {
    id: "1",
    name: "Alex Thompson",
    party: "Student Progress Alliance",
    manifesto: "Committed to improving campus facilities, extending library hours, and creating more student job opportunities. I believe in transparent governance and open communication with all students.",
    avatarUrl: undefined,
    voteCount: 245,
  },
  {
    id: "2",
    name: "Maya Rodriguez",
    party: "Green Campus Initiative",
    manifesto: "Focused on environmental sustainability, reducing campus carbon footprint, and promoting eco-friendly practices. Together we can build a greener future for our college.",
    avatarUrl: undefined,
    voteCount: 312,
  },
  {
    id: "3",
    name: "Jordan Lee",
    party: "Innovation Forward",
    manifesto: "Advocate for digital transformation, improved online resources, and modern learning tools. Let's bring our campus into the future with technology that works for everyone.",
    avatarUrl: undefined,
    voteCount: 189,
  },
];

const CandidateManagement = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formParty, setFormParty] = useState("");
  const [formManifesto, setFormManifesto] = useState("");

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.party?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormName("");
    setFormParty("");
    setFormManifesto("");
  };

  const handleAddCandidate = () => {
    if (!formName) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: formName,
      party: formParty || undefined,
      manifesto: formManifesto || undefined,
      voteCount: 0,
    };

    setCandidates([...candidates, newCandidate]);
    toast({ title: "Candidate added successfully" });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditCandidate = () => {
    if (!selectedCandidate || !formName) return;

    setCandidates(candidates.map(c => 
      c.id === selectedCandidate.id 
        ? { ...c, name: formName, party: formParty || undefined, manifesto: formManifesto || undefined }
        : c
    ));
    toast({ title: "Candidate updated successfully" });
    setIsEditDialogOpen(false);
    setSelectedCandidate(null);
    resetForm();
  };

  const handleDeleteCandidate = () => {
    if (!selectedCandidate) return;

    setCandidates(candidates.filter(c => c.id !== selectedCandidate.id));
    toast({ title: "Candidate deleted successfully" });
    setIsDeleteDialogOpen(false);
    setSelectedCandidate(null);
  };

  const openEditDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormName(candidate.name);
    setFormParty(candidate.party || "");
    setFormManifesto(candidate.manifesto || "");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Candidate Management</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove election candidates</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>Fill in the details to add a new candidate to the election.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter candidate name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="party">Party (optional)</Label>
                <Input
                  id="party"
                  placeholder="Enter party name"
                  value={formParty}
                  onChange={(e) => setFormParty(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manifesto">Manifesto (optional)</Label>
                <Textarea
                  id="manifesto"
                  placeholder="Enter candidate manifesto"
                  value={formManifesto}
                  onChange={(e) => setFormManifesto(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button variant="hero" onClick={handleAddCandidate}>Add Candidate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Candidates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-elevated transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                    {candidate.avatarUrl ? (
                      <img src={candidate.avatarUrl} alt={candidate.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{candidate.name}</CardTitle>
                    {candidate.party && (
                      <p className="text-sm text-muted-foreground">{candidate.party}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {candidate.manifesto && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {candidate.manifesto}
                </p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm">
                  <span className="text-muted-foreground">Votes: </span>
                  <span className="font-semibold text-foreground">{candidate.voteCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditDialog(candidate)}
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openDeleteDialog(candidate)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No candidates found</h3>
          <p className="text-muted-foreground">Add your first candidate to get started.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>Update the candidate's information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-party">Party</Label>
              <Input
                id="edit-party"
                value={formParty}
                onChange={(e) => setFormParty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manifesto">Manifesto</Label>
              <Textarea
                id="edit-manifesto"
                value={formManifesto}
                onChange={(e) => setFormManifesto(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleEditCandidate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Candidate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCandidate?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCandidate}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateManagement;
