import { Link } from "react-router-dom";
import { Vote, CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

const VoterDashboard = () => {
  const { user } = useAuth();

  const isVerified = user?.verificationStatus === 'verified';
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
      <Card className={`border-2 ${
        isVerified ? 'border-success/30 bg-success/5' : 
        isPending ? 'border-warning/30 bg-warning/5' : 
        'border-destructive/30 bg-destructive/5'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              isVerified ? 'bg-success/10' : 
              isPending ? 'bg-warning/10' : 
              'bg-destructive/10'
            }`}>
              {isVerified ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : isPending ? (
                <Clock className="w-6 h-6 text-warning" />
              ) : (
                <AlertCircle className="w-6 h-6 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                {isVerified ? 'Your account is verified!' : 
                 isPending ? 'Verification pending' : 
                 'Verification rejected'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {isVerified ? 'You are eligible to vote in the current election.' : 
                 isPending ? 'Your registration is being reviewed by an administrator.' : 
                 'Please contact support for more information.'}
              </p>
              {isVerified && !hasVoted && (
                <Link to="/vote" className="inline-block mt-4">
                  <Button variant="hero">
                    <Vote className="w-4 h-4 mr-2" />
                    Cast Your Vote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vote Status */}
      {hasVoted && (
        <Card className="border-2 border-accent-teal/30 bg-accent-teal-light">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-accent-teal/10">
                <CheckCircle className="w-6 h-6 text-accent-teal" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">You have already voted!</h2>
                <p className="text-muted-foreground mt-1">
                  Thank you for participating in the election. Your vote has been recorded securely.
                </p>
                <Link to="/results/public" className="inline-block mt-4">
                  <Button variant="outline">
                    View Results
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Student ID</span>
                <span className="font-medium">{user?.studentId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium capitalize ${
                  isVerified ? 'text-success' : isPending ? 'text-warning' : 'text-destructive'
                }`}>
                  {user?.verificationStatus}
                </span>
              </div>
            </div>
            <Link to="/voter/profile" className="block mt-4">
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Election Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Student Council Election 2024</h3>
                <p className="text-sm text-muted-foreground">
                  Vote for your next student council president. Your voice matters!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Start Date</span>
                  <p className="font-medium">Jan 15, 2024</p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date</span>
                  <p className="font-medium">Jan 20, 2024</p>
                </div>
              </div>
              <Link to="/results/public">
                <Button variant="outline" className="w-full">
                  View Live Results
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoterDashboard;
