import { Users, UserCheck, Vote, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { StatCard, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const pieData = [
  { name: 'Engineering', value: 42, color: 'hsl(var(--accent-teal))' },
  { name: 'Arts', value: 28, color: 'hsl(var(--accent-coral))' },
  { name: 'Science', value: 18, color: 'hsl(var(--accent-purple))' },
  { name: 'Business', value: 12, color: 'hsl(var(--accent-pink))' },
];

const barData = [
  { day: 'Mon', votes: 45 },
  { day: 'Tue', votes: 78 },
  { day: 'Wed', votes: 112 },
  { day: 'Thu', votes: 156 },
  { day: 'Fri', votes: 189 },
  { day: 'Sat', votes: 134 },
];

const recentActivity = [
  { id: 1, name: 'Sarah Johnson', action: 'Registered', time: '2 mins ago', status: 'pending' },
  { id: 2, name: 'Michael Chen', action: 'Verified', time: '5 mins ago', status: 'verified' },
  { id: 3, name: 'Emily Davis', action: 'Voted', time: '8 mins ago', status: 'voted' },
  { id: 4, name: 'James Wilson', action: 'Registered', time: '12 mins ago', status: 'pending' },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with the election today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-soft">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">This Month</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          variant="coral"
          icon={<Users className="w-5 h-5" />}
          title="Total Registered"
          value="1,247"
          change="+12.5% This Month"
        />
        <StatCard
          variant="teal"
          icon={<UserCheck className="w-5 h-5" />}
          title="Verified Voters"
          value="1,089"
          change="+8.2% This Month"
        />
        <StatCard
          variant="pink"
          icon={<Vote className="w-5 h-5" />}
          title="Votes Cast"
          value="856"
          change="+15.3% This Month"
        />
        <StatCard
          variant="purple"
          icon={<BarChart3 className="w-5 h-5" />}
          title="Candidates"
          value="5"
          change="Active Election"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart - Votes by Department */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Votes by Department</CardTitle>
            <button className="p-1 hover:bg-muted rounded-full transition-colors">
              <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
                    856
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Daily Votes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Daily Voting Activity</CardTitle>
            <div className="flex items-center gap-2 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+24%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar 
                    dataKey="votes" 
                    fill="hsl(var(--accent-teal))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
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
                    <td className="py-4 px-4 text-muted-foreground">{activity.time}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'verified' 
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
    </div>
  );
};

export default AdminDashboard;
