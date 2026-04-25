import { Users, UserCheck, Vote, BarChart3, TrendingUp, Calendar, RefreshCcw } from "lucide-react";
import { StatCard, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading: loading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const [activeElection, setActiveElection] = useState<any>(null);

  useEffect(() => {
    const fetchActiveElection = async () => {
      try {
        const { data } = await api.get('/admin/election');
        setActiveElection(data);
      } catch (err) {
        console.error("Failed to fetch active election");
      }
    };
    fetchActiveElection();
  }, []);

  const stats = dashboardData?.stats || {
    totalRegistered: 0,
    verifiedVoters: 0,
    votesCast: 0,
    candidates: 0
  };
  const pieData = dashboardData?.charts?.pieData || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const blockchain = dashboardData?.blockchain || { connected: false, network: 'Unknown', address: '', balance: '0.00' };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Current Session: <span className="text-foreground font-semibold uppercase tracking-wider">{activeElection?.title || 'Loading...'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold animate-pulse border border-primary/20">
            <RefreshCcw className="w-3 h-3" />
            LIVE
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-soft">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">This Month</span>
          </div>
        </div>
      </div>

      {/* Live Turnout Meter */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex justify-between items-center">
            <span>Live Election Turnout</span>
            <span className="text-2xl font-bold text-primary">
              {stats.verifiedVoters > 0 ? ((stats.votesCast / stats.verifiedVoters) * 100).toFixed(1) : 0}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={stats.verifiedVoters > 0 ? (stats.votesCast / stats.verifiedVoters) * 100 : 0} className="h-4" />
          <p className="text-sm text-muted-foreground mt-2 text-right">
            {stats.votesCast} of {stats.verifiedVoters} verified voters have cast their ballots
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          variant="coral"
          icon={<Users className="w-5 h-5" />}
          title="Total Registered"
          value={stats.totalRegistered.toLocaleString()}
          change="Total users"
        />
        <StatCard
          variant="teal"
          icon={<UserCheck className="w-5 h-5" />}
          title="Verified Voters"
          value={stats.verifiedVoters.toLocaleString()}
          change={`${stats.totalRegistered > 0 ? ((stats.verifiedVoters / stats.totalRegistered) * 100).toFixed(1) : 0}% Verified`}
        />
        <StatCard
          variant="pink"
          icon={<Vote className="w-5 h-5" />}
          title="Votes Cast"
          value={stats.votesCast.toLocaleString()}
          change={`${stats.verifiedVoters > 0 ? ((stats.votesCast / stats.verifiedVoters) * 100).toFixed(1) : 0}% Turnout`}
        />
        <StatCard
          variant="purple"
          icon={<BarChart3 className="w-5 h-5" />}
          title="Candidates"
          value={stats.candidates.toLocaleString()}
          change="Active Election"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Blockchain Status Card */}
        <Card className="md:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${blockchain.connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              Blockchain Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="font-medium">{blockchain.network}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Admin Wallet</span>
                  <span className="text-xs font-mono text-muted-foreground truncate w-24">
                    {blockchain.address ? `${blockchain.address.slice(0, 6)}...${blockchain.address.slice(-4)}` : 'N/A'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <p className="font-bold text-primary">{blockchain.balance} ETH</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="md:col-span-2">
          {/* Pie Chart - Votes by Party */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Votes by Party</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="40%" // Move chart left to make room for legend
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ paddingLeft: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <button className="text-sm text-primary hover:underline">View all</button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b border-border last:border-0">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-medium">{activity.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-foreground">{activity.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{activity.action}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.status === 'verified'
                        ? 'bg-success/10 text-success'
                        : activity.status === 'voted'
                          ? 'bg-accent-teal/10 text-accent-teal'
                          : 'bg-warning/10 text-warning'
                        }`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div >
  );
};

export default AdminDashboard;
