import { useState } from "react";
import { Link } from "react-router-dom";
import { Vote, BarChart3, Trophy, Users, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const resultsData = [
  { name: "Maya Rodriguez", votes: 312, party: "Green Campus Initiative", color: "hsl(var(--accent-coral))" },
  { name: "Alex Thompson", votes: 245, party: "Student Progress Alliance", color: "hsl(var(--accent-teal))" },
  { name: "Jordan Lee", votes: 189, party: "Innovation Forward", color: "hsl(var(--accent-purple))" },
  { name: "Abstain", votes: 56, party: "No Vote", color: "hsl(var(--muted-foreground))" },
];

const totalVotes = resultsData.reduce((sum, r) => sum + r.votes, 0);
const winner = resultsData[0];

// Mock published state - in real app this would come from API
const isPublished = true;
const publishedAt = "2024-01-20T18:30:00Z";

const PublicResults = () => {
  if (!isPublished) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Vote className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">CampusVote</span>
            </Link>
            <Link to="/login">
              <Button variant="hero" size="sm">Sign In</Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Results Not Yet Published</h1>
            <p className="text-muted-foreground mb-8">
              The election results have not been published yet. Please check back later or contact the election administrator.
            </p>
            <Link to="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Vote className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">CampusVote</span>
          </Link>
          <Link to="/login">
            <Button variant="hero" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              Official Results Published
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Student Council Election 2024
            </h1>
            <p className="text-muted-foreground">
              Results published on {new Date(publishedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Winner Card */}
          <Card className="border-2 border-accent-coral/30 bg-gradient-to-br from-accent-coral-light to-card">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-accent-coral flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-accent-coral mb-2">Winner</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{winner.name}</h2>
                  <p className="text-primary font-medium">{winner.party}</p>
                  <p className="text-muted-foreground mt-2">
                    {winner.votes} votes ({((winner.votes / totalVotes) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-6 text-center">
                <Users className="w-8 h-8 text-accent-teal mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalVotes}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6 text-center">
                <TrendingUp className="w-8 h-8 text-accent-coral mx-auto mb-2" />
                <p className="text-2xl font-bold">{((winner.votes / totalVotes) * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Winner Share</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6 text-center">
                <Vote className="w-8 h-8 text-accent-purple mx-auto mb-2" />
                <p className="text-2xl font-bold">{resultsData.length - 1}</p>
                <p className="text-sm text-muted-foreground">Candidates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6 text-center">
                <BarChart3 className="w-8 h-8 text-accent-pink mx-auto mb-2" />
                <p className="text-2xl font-bold">{resultsData.find(r => r.name === 'Abstain')?.votes || 0}</p>
                <p className="text-sm text-muted-foreground">Abstentions</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vote Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resultsData} layout="vertical">
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value} votes`, 'Votes']}
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

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vote Share</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resultsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="votes"
                      >
                        {resultsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value} votes (${((value / totalVotes) * 100).toFixed(1)}%)`, 'Votes']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {resultsData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Results</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table fallback for accessibility */}
              <div className="overflow-x-auto">
                <table className="w-full" role="table" aria-label="Election results">
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                      <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Candidate</th>
                      <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Party</th>
                      <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Votes</th>
                      <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.map((result, index) => (
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
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 CampusVote. Secure elections for modern campuses.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicResults;
