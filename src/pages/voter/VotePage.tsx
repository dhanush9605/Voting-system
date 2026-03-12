import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { User, Check, X, AlertTriangle, Clock, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Candidate, ElectionConfig } from "@/types";
import { useQuery } from "@tanstack/react-query";
import VoteReceipt from "@/components/voter/VoteReceipt";

// Mock candidates


const VotePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isAbstaining, setIsAbstaining] = useState(false);
  const [abstainReason, setAbstainReason] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<{ voteId: string; timestamp: string; transactionHash?: string } | null>(null);

  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data } = await api.get('/candidates');
      return data as Candidate[];
    },
    refetchInterval: 30000, // Candidates don't change often, 30s is fine
  });

  const { data: election } = useQuery({
    queryKey: ['election-config'],
    queryFn: async () => {
      const { data } = await api.get('/election');
      return data as ElectionConfig;
    },
    refetchInterval: 10000, // Poll election state every 10 seconds
  });

  const [electionError, setElectionError] = useState('');
  const [isElectionActive, setIsElectionActive] = useState(true);

  useEffect(() => {
    if (election) {
      const now = new Date();
      const start = new Date(election.startDate);
      const end = new Date(election.endDate);

      if (now < start) {
        setIsElectionActive(false);
        setElectionError(`Voting starts on ${start.toLocaleDateString()} at ${start.toLocaleTimeString()}`);
      } else if (now > end) {
        setIsElectionActive(false);
        setElectionError(`Voting ended on ${end.toLocaleDateString()} at ${end.toLocaleTimeString()}`);
      } else {
        setIsElectionActive(true);
        setElectionError('');
      }
    }
  }, [election]);

  // Check if user has already voted
  if (user?.hasVoted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-accent-teal/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-accent-teal" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">You've Already Voted</h1>
        <p className="text-muted-foreground mb-8">
          Your vote has been recorded securely. You can view or download your receipt below.
        </p>

        <div className="mb-10">
          <VoteReceipt
            voterName={user.name}
            timestamp={user.votedAt || user.createdAt}
            transactionHash={user.voteTransactionHash}
            voterImage={user.imageUrl}
            electionName={election?.title}
          />
        </div>

        <Button onClick={() => navigate('/results/public')} variant="hero" className="w-full max-w-md">
          View Live Results
        </Button>
      </div>
    );
  }

  // Check if user is verified
  if (user?.verificationStatus !== 'verified') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-warning" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Verification Required</h1>
        <p className="text-muted-foreground mb-6">
          Your account must be verified before you can vote. Please wait for an administrator to verify your registration.
        </p>
        <Button onClick={() => navigate('/voter/dashboard')} variant="outline">
          Return to Dashboard
        </Button>
      </div>
    );
  }


  // Check if election is active
  if (!isElectionActive) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Election Not Active</h1>
        <p className="text-muted-foreground mb-6">
          {electionError || "Voting is currently closed."}
        </p>
        <Button onClick={() => navigate('/voter/dashboard')} variant="outline">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsAbstaining(false);
    setIsConfirmDialogOpen(true);
  };

  const handleAbstain = () => {
    setSelectedCandidate(null);
    setIsAbstaining(true);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmVote = async () => {
    setIsSubmitting(true);

    try {
      if (isAbstaining) {
        // Backend supports "abstain" as a special candidate
        // Proceed to submit
      }

      // Real API Call
      // If abstaining, send 'abstain' as candidateId
      const payload = isAbstaining ? { candidateId: 'abstain' } : { candidateId: selectedCandidate?._id || selectedCandidate?.id };
      const { data } = await api.post('/vote', payload);

      const receipt = {
        voteId: `VOTE-${Date.now()}`,
        timestamp: new Date().toISOString(),
        transactionHash: data.transactionHash
      };

      setVoteReceipt(receipt);
      updateUser({ hasVoted: true, votedAt: receipt.timestamp });

      toast({
        title: "Vote submitted successfully!",
        description: isAbstaining ? "Your abstention has been recorded." : `You voted for ${selectedCandidate?.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to submit vote",
        description: error.response?.data?.error || error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsConfirmDialogOpen(false);
    }
  };

  // Show receipt after voting
  if (voteReceipt) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Vote Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          {isAbstaining
            ? "Your abstention has been recorded successfully."
            : `Thank you for participating! Your vote is securely stored on the blockchain.`}
        </p>

        <div className="mb-10">
          <VoteReceipt
            voterName={user?.name || "Voter"}
            timestamp={voteReceipt.timestamp}
            transactionHash={voteReceipt.transactionHash}
            voterImage={user?.imageUrl}
            electionName={election?.title}
          />
        </div>

        <Button onClick={() => navigate('/results/public')} variant="hero" className="w-full max-w-md">
          View Live Results
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto relative">
        <div className="absolute right-0 top-0 hidden md:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold animate-pulse border border-primary/20">
          <RefreshCw className="w-3 h-3" />
          ACTIVE
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Cast Your Vote
        </h1>
        <p className="text-muted-foreground">
          Select your preferred candidate or choose to abstain. Your vote is anonymous and secure.
        </p>
      </div>

      {/* Candidates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <Card
            key={candidate._id || candidate.id}
            className="cursor-pointer hover:shadow-elevated transition-all hover:border-primary/30"
            onClick={() => handleSelectCandidate(candidate)}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4 overflow-hidden">
                  {candidate.imageUrl ? (
                    <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{candidate.name}</h3>
                {candidate.party && (
                  <p className="text-sm text-primary font-medium mb-3">{candidate.party}</p>
                )}
                {candidate.manifesto && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {candidate.manifesto}
                  </p>
                )}
                <Button variant="hero" className="mt-6 w-full">
                  Vote for {candidate.name.split(' ')[0]}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Abstain Card */}
        <Card
          className="cursor-pointer hover:shadow-elevated transition-all border-2 border-dashed hover:border-muted-foreground/50"
          onClick={handleAbstain}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center h-full justify-center py-8">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <X className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Abstain / No Vote</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Choose this option if you wish to participate in the election without voting for any candidate.
              </p>
              <Button variant="outline" className="w-full">
                Choose to Abstain
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAbstaining ? 'Confirm Abstention' : `Vote for ${selectedCandidate?.name}?`}
            </DialogTitle>
            <DialogDescription>
              {isAbstaining
                ? 'You are choosing to abstain from voting for any candidate.'
                : `You are about to cast your vote for ${selectedCandidate?.name} (${selectedCandidate?.party}).`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isAbstaining ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Your abstention will be recorded. You can optionally provide a reason below.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Reason for abstaining (optional)</Label>
                  <Textarea
                    placeholder="Enter your reason..."
                    value={abstainReason}
                    onChange={(e) => setAbstainReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{selectedCandidate?.name}</h4>
                  <p className="text-sm text-primary">{selectedCandidate?.party}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleConfirmVote} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Confirm Vote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VotePage;
