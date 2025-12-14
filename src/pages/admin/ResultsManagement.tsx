import { useState, useEffect } from "react";
import { BarChart3, Send, Eye, EyeOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "@/lib/api";

const ResultsManagement = () => {
  const { toast } = useToast();
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    fetchResults();
    fetchPublishStatus();
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/admin/results');
      setTotalVotes(data.totalVotes);
      // Add colors to results
      const coloredResults = data.results.map((r: any, index: number) => ({
        ...r,
        color: ['hsl(var(--accent-teal))', 'hsl(var(--accent-coral))', 'hsl(var(--accent-purple))', 'hsl(var(--accent-pink))'][index % 4]
      }));
      setResultsData(coloredResults);
    } catch (error) {
      console.error("Failed to fetch results", error);
    }
  };

  const fetchPublishStatus = async () => {
    try {
      const { data } = await api.get('/admin/election');
      if (data) {
        setIsPublished(data.resultsPublished);
        setPublishedAt(data.publishedAt);
      }
    } catch (error) {
      console.error("Failed to fetch election status", error);
    }
  };

  const handlePublish = async () => {
    if (confirmText !== "PUBLISH") {
      toast({ title: "Please type PUBLISH to confirm", variant: "destructive" });
      return;
    }

    try {
      const { data } = await api.put('/admin/election/publish', { publish: true });
      setIsPublished(data.resultsPublished);
      setPublishedAt(data.publishedAt);
      setIsPublishDialogOpen(false);
      setConfirmText("");
      toast({ title: "Results published successfully" });
    } catch (error) {
      toast({ title: "Failed to publish results", variant: "destructive" });
    }
  };

  const handleUnpublish = async () => {
    try {
      const { data } = await api.put('/admin/election/publish', { publish: false });
      setIsPublished(false);
      setPublishedAt(null);
      toast({ title: "Results unpublished" });
    } catch (error) {
      toast({ title: "Failed to unpublish results", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Results Management</h1>
          <p className="text-muted-foreground mt-1">View and publish election results</p>
        </div>

        <div className="flex items-center gap-3">
          {isPublished ? (
            <>
              <span className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium">
                <Eye className="w-4 h-4" />
                Published
              </span>
              <Button variant="outline" onClick={handleUnpublish}>
                <EyeOff className="w-4 h-4 mr-2" />
                Unpublish
              </Button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                <EyeOff className="w-4 h-4" />
                Not Published
              </span>
              <Button variant="hero" onClick={() => setIsPublishDialogOpen(true)}>
                <Send className="w-4 h-4 mr-2" />
                Publish Results
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Published timestamp */}
      {isPublished && publishedAt && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-success" />
              <span className="text-sm">
                Results published on {new Date(publishedAt).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Votes</p>
              <p className="text-4xl font-bold text-foreground">{totalVotes}</p>
            </div>
          </CardContent>
        </Card>

        {resultsData.slice(0, 3).map((result, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{result.name}</p>
                <p className="text-3xl font-bold text-foreground">{result.votes}</p>
                <p className="text-sm text-muted-foreground">
                  {((result.votes / totalVotes) * 100).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Vote Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resultsData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 14 }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value} votes (${((value / totalVotes) * 100).toFixed(1)}%)`, 'Votes']}
                />
                <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
                  {resultsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Candidate</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Party</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Votes</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {resultsData
                  .sort((a, b) => b.votes - a.votes)
                  .map((result, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0 ? 'bg-accent-coral text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-foreground">{result.name}</td>
                      <td className="py-4 px-4 text-muted-foreground">{result.party}</td>
                      <td className="py-4 px-4 text-right font-semibold">{result.votes}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(result.votes / totalVotes) * 100}%`,
                                backgroundColor: result.color
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">
                            {((result.votes / totalVotes) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Publish Confirmation Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Election Results</DialogTitle>
            <DialogDescription>
              Publishing results will make current tallies visible publicly. This action can be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-foreground">
                Once published, anyone will be able to view the election results without logging in.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Type <span className="font-mono font-bold">PUBLISH</span> to confirm</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type PUBLISH to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>Cancel</Button>
            <Button
              variant="hero"
              onClick={handlePublish}
              disabled={confirmText !== "PUBLISH"}
            >
              Publish Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResultsManagement;
