import { Link } from "react-router-dom";
import { Vote, CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ElectionConfig } from "@/types";
import { format } from "date-fns";

const VoterDashboard = () => {
  const { user } = useAuth();
  const [election, setElection] = useState<ElectionConfig | null>(null);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const { data } = await api.get('/election');
        setElection(data);
      } catch (error) {
        console.error("Failed to fetch election info", error);
      }
    };
    fetchElection();
  }, []);

  const isAdminVerified = user?.verificationStatus === 'verified';
  const isFaceVerified = true;
  const isEligibleToVote = isAdminVerified;
  const isPending = user?.verificationStatus === 'pending';
  const hasVoted = user?.hasVoted;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your voting status and next steps.
        </p>
      </div>

      {/* Status Card */}
      <Card className={`border overflow-hidden relative transition-all duration-300 hover:shadow-md ${isEligibleToVote ? 'border-success/30 bg-gradient-to-r from-success/10 via-success/5 to-transparent' :
        (isPending || !isFaceVerified) ? 'border-warning/30 bg-gradient-to-r from-warning/10 via-warning/5 to-transparent' :
          'border-destructive/30 bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent'
        }`}>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shadow-sm ${isEligibleToVote ? 'bg-success/20 text-success' :
              (isPending || !isFaceVerified) ? 'bg-warning/20 text-warning' :
                'bg-destructive/20 text-destructive'
              }`}>
              {isEligibleToVote ? (
                <CheckCircle className="w-6 h-6" />
              ) : (isPending || !isFaceVerified) ? (
                <Clock className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">
                {isEligibleToVote ? 'Your account is ready for voting!' :
                  !isFaceVerified ? 'Face verification needed' :
                    isPending ? 'Waiting for admin approval' :
                      'Verification rejected'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {isEligibleToVote ? 'You are fully verified and eligible to cast your vote.' :
                  !isFaceVerified ? 'Please complete your face verification to proceed.' :
                    isPending ? 'Your face is verified. Now waiting for an administrator to approve your profile.' :
                      'Your registration was rejected. Please contact support.'}
              </p>
              {isEligibleToVote && !hasVoted && (
                <Link to="/vote" className="inline-block mt-4">
                  <Button variant="hero" className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-pulse">
                    <Vote className="w-4 h-4 mr-2" />
                    Cast Your Vote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
              {/* Add Verification Link if NOT face verified */}
              {!isFaceVerified && !hasVoted && (
                <Link to="/verify-face" className="inline-block mt-4">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-transform">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Face Identity
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
              {isFaceVerified && !isAdminVerified && !hasVoted && (
                <div className="mt-4 flex items-center gap-2 text-sm text-warning font-medium">
                  <Clock className="w-4 h-4" />
                  Face verified. Awaiting admin approval...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vote Status */}
      {hasVoted && (
        <Card className="border border-accent-teal/30 bg-gradient-to-r from-accent-teal/10 to-transparent transition-all duration-300 hover:shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-accent-teal/20 text-accent-teal shadow-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">You have already voted!</h2>
                <p className="text-muted-foreground mt-1">
                  Thank you for participating. Your vote is secure on the blockchain.
                </p>
                <Link to="/results/public" className="inline-block mt-4">
                  <Button variant="outline" className="hover:scale-105 transition-transform">
                    View Results
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                {user?.voteTransactionHash && (
                  <div className="mt-6 pt-4 border-t border-accent-teal/20">
                    <p className="text-sm font-medium text-foreground/80 mb-2">Blockchain Proof:</p>
                    <code className="block bg-background/50 p-3 rounded-lg border border-border text-xs font-mono break-all mb-3 text-muted-foreground hover:text-foreground transition-colors cursor-help" title="Transaction Hash">
                      {user.voteTransactionHash}
                    </code>
                    <Link to={`/verify-vote?hash=${user.voteTransactionHash}`} target="_blank">
                      <Button variant="link" className="p-0 h-auto text-accent-teal font-medium hover:text-accent-teal-dark underline-offset-4">
                        Verify on Blockchain &rarr;
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 group">
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Student ID</span>
                <span className="font-medium">{user?.studentId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Face Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isFaceVerified ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                  {isFaceVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Admin Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isAdminVerified ? 'bg-success/15 text-success' : isPending ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'
                  }`}>
                  {user?.verificationStatus}
                </span>
              </div>
            </div>
            <Link to="/voter/profile" className="block mt-6">
              <Button variant="outline" className="w-full group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 group">
          <CardHeader>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">Election Info</CardTitle>
          </CardHeader>
          <CardContent>
            {election ? (
              <div className="space-y-5">
                <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
                  <h3 className="font-bold text-foreground mb-1">{election.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {election.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-background rounded-lg border border-border/50 text-center">
                    <span className="text-muted-foreground block text-xs mb-1">Start Date</span>
                    <p className="font-semibold">
                      {new Date(election.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded-lg border border-border/50 text-center">
                    <span className="text-muted-foreground block text-xs mb-1">End Date</span>
                    <p className="font-semibold">
                      {new Date(election.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="text-center">
                  {new Date() < new Date(election.startDate) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                      <Clock className="w-3 h-3 mr-1" /> Not Started
                    </span>
                  ) : new Date() > new Date(election.endDate) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                      <AlertCircle className="w-3 h-3 mr-1" /> Ended
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                      Voting is Live
                    </span>
                  )}
                </div>

                <Link to="/results/public">
                  <Button variant="outline" className="w-full group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                    View Live Results
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Election details will be announced soon.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoterDashboard;
