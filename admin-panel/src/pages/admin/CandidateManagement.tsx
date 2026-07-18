import { useState, useEffect, useRef } from "react";
import { Plus, Search, Trash2, Edit, Save, X, Upload, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Candidate } from "@/types";
import { compressImage } from "@/lib/image-utils";

const CandidateManagement = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/candidates');
      setCandidates(data);
    } catch (error) {
      console.error("Failed to fetch candidates", error);
      toast({
        title: "Error fetching candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (candidate?: Candidate) => {
    if (candidate) {
      setEditingCandidate(candidate);
      setName(candidate.name);
      setParty(candidate.party || "");
      setManifesto(candidate.manifesto || "");
      setImageUrl(candidate.imageUrl || ""); // Changed from avatarUrl to match backend
    } else {
      setEditingCandidate(null);
      setName("");
      setParty("");
      setManifesto("");
      setImageUrl("");
    }
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const compressed = await compressImage(dataUrl);
        setImageUrl(compressed); // Store base64 directly
      } catch (err) {
        console.error(err);
        toast({ title: "Image processing failed", variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name || !party || !manifesto) {
      toast({ title: "Missing fields", description: "Name, Party, and Manifesto are required.", variant: "destructive" });
      return;
    }

    try {
      if (editingCandidate) {
        // Update
        const { data } = await api.put(`/candidates/${editingCandidate._id || editingCandidate.id}`, { // Handle both _id and id
          name,
          party,
          manifesto,
          imageUrl
        });

        setCandidates(prev => prev.map(c => (c.id === editingCandidate.id || c._id === editingCandidate._id) ? data : c));
        toast({ title: "Candidate updated successfully" });
      } else {
        // Create
        const { data } = await api.post('/candidates', {
          name,
          party,
          manifesto,
          imageUrl
        });
        setCandidates([...candidates, data]);
        toast({ title: "Candidate created successfully" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Operation failed", description: error.response?.data?.message || "Something went wrong", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await api.delete(`/candidates/${id}`);
      setCandidates(prev => prev.filter(c => c._id !== id && c.id !== id));
      toast({ title: "Candidate deleted" });
    } catch (error) {
      console.error(error);
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Name", "Party", "Manifesto", "Vote Count"].join(","),
      ...candidates.map(c => [
        `"${c.name}"`,
        `"${c.party || ""}"`,
        `"${(c.manifesto || "").replace(/"/g, '""')}"`, // Escape quotes
        c.voteCount || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidates.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Candidates exported successfully" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Candidate Management</h1>
          <p className="text-muted-foreground mt-1">Manage election candidates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleOpenDialog()} variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {!loading && candidates.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border rounded-3xl bg-muted/10 relative overflow-hidden">
          {/* Watermark Icon */}
          <Users className="absolute -bottom-10 -right-10 w-64 h-64 text-foreground/[0.03] -rotate-12 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">No Candidates Registered</h2>
            <p className="text-muted-foreground max-w-xs mt-2 mb-8">
              Start building your election by adding the first candidate to the platform.
            </p>
            <Button onClick={() => handleOpenDialog()} variant="hero" size="lg" className="rounded-full px-8 shadow-xl">
              <Plus className="w-5 h-5 mr-2" />
              Register First Candidate
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(candidate => (
            <Card key={candidate._id || candidate.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="aspect-video bg-muted relative">
                {candidate.imageUrl ? (
                  <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider">
                    Candidate
                  </span>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{candidate.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {candidate.party}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                  {candidate.manifesto}
                </p>
                <div className="flex gap-2 justify-end pt-4 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(candidate)} className="h-9">
                    <Edit className="w-4 h-4 mr-1.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(candidate._id || candidate.id)} className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCandidate ? "Edit Candidate" : "Add New Candidate"}</DialogTitle>
            <DialogDescription>
              Enter the details of the candidate for the upcoming election.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Party / Affiliation</label>
              <Input value={party} onChange={(e) => setParty(e.target.value)} placeholder="e.g. Independent, Science Club" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Manifesto / Bio</label>
              <Textarea value={manifesto} onChange={(e) => setManifesto(e.target.value)} placeholder="Short description of goals..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo</label>
              <div className="flex gap-4 items-center">
                {imageUrl && (
                  <div className="w-16 h-16 rounded bg-muted overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  {imageUrl ? "Change Photo" : "Upload Photo"}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleSubmit}>
              {editingCandidate ? "Update Candidate" : "Create Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateManagement;
