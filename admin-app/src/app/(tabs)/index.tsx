import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../api/api';

type Stats = {
  pendingApprovals: number;
  totalCandidates: number;
  totalElections: number;
  totalVoters: number;
  verifiedVoters: number;
  totalVotes: number;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    pendingApprovals: 0,
    totalCandidates: 0,
    totalElections: 0,
    totalVoters: 0,
    verifiedVoters: 0,
    totalVotes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [electionTitle, setElectionTitle] = useState<string>('');
  const [electionStatus, setElectionStatus] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, electionRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/election').catch(() => ({ data: null })),
      ]);

      const data = dashRes.data.stats || dashRes.data;
      setStats({
        pendingApprovals: (data.totalRegistered || 0) - (data.verifiedVoters || 0),
        totalCandidates: data.candidates || 0,
        totalElections: data.totalElections || 1,
        totalVoters: data.totalRegistered || 0,
        verifiedVoters: data.verifiedVoters || 0,
        totalVotes: data.totalVotes || 0,
      });

      if (electionRes.data) {
        setElectionTitle(electionRes.data.title || '');
        setElectionStatus(electionRes.data.status || '');
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true); 
    fetchData(); 
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#0d9488" />
      </SafeAreaView>
    );
  }

  const verificationRate = stats.totalVoters > 0
    ? Math.round((stats.verifiedVoters / stats.totalVoters) * 100)
    : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <LinearGradient
        colors={['rgba(20,184,166,0.1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
        className="absolute w-full h-full"
      />
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0d9488" />}
      >
        {/* Header */}
        <View className="mb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-zinc-400 text-sm font-medium mb-1 uppercase tracking-wider">{today}</Text>
            <Text className="text-3xl font-bold text-white">Overview</Text>
          </View>
          <View className="w-12 h-12 bg-zinc-900 rounded-full items-center justify-center border border-zinc-800">
            <MaterialIcons name="person" size={24} color="#0d9488" />
          </View>
        </View>

        {/* Active Election Banner - Vibrant Gradient */}
        {electionTitle ? (
          <View className="mb-8 overflow-hidden shadow-lg shadow-teal-900/50 relative" style={{ borderRadius: 24 }}>
            <LinearGradient
              colors={['#0f766e', '#064e3b']} // teal-700 to emerald-900
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <View className="p-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="bg-black/20 px-3 py-1 rounded-full self-start">
                  <Text className="text-teal-100 text-xs font-bold uppercase tracking-wider">{electionStatus} Election</Text>
                </View>
                <MaterialIcons name="how-to-vote" size={24} color="rgba(255,255,255,0.7)" />
              </View>
              <Text className="text-white font-black text-2xl mb-1" numberOfLines={2}>{electionTitle}</Text>
              <Text className="text-teal-100/70 text-sm">Decentralized control center active.</Text>
            </View>
          </View>
        ) : null}

        <View className="mb-8">
          <Text className="text-white font-bold text-lg mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            <QuickAction icon="users" label="Voters" onPress={() => router.push('/voters')} />
            <QuickAction icon="user-plus" label="Candidates" onPress={() => router.push('/elections?section=candidates')} />
            <QuickAction icon="bar-chart-2" label="Results" onPress={() => router.push('/elections?section=results')} />
            <QuickAction icon="settings" label="Settings" onPress={() => router.push('/settings')} />
          </View>
        </View>

        {/* Stats Grid */}
        <Text className="text-white font-bold text-lg mb-4">Live Statistics</Text>
        <View className="flex-row flex-wrap justify-between mb-2">
          <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon="clock" color="#ef4444" />
          <StatCard title="Total Voters" value={stats.totalVoters} icon="users" color="#3b82f6" />
          <StatCard title="Candidates" value={stats.totalCandidates} icon="user-check" color="#8b5cf6" />
          <StatCard title="Votes Cast" value={stats.totalVotes} icon="check-circle" color="#10b981" />
        </View>

        {/* Verification Progress - Modern Glass Card */}
        <View className="bg-zinc-900/80 rounded-3xl p-6 mt-4 mb-8 border border-zinc-800/80 backdrop-blur-md">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-teal-900/30 rounded-xl items-center justify-center mr-3">
              <Feather name="shield" size={20} color="#14b8a6" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Voter Verification</Text>
              <Text className="text-zinc-500 text-xs">KYC & Registration</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-2 items-end">
            <Text className="text-zinc-300 font-medium text-sm">
              <Text className="text-white font-bold text-xl">{stats.verifiedVoters}</Text> / {stats.totalVoters} Verified
            </Text>
            <Text className="text-teal-400 font-black text-lg">{verificationRate}%</Text>
          </View>
          
          <View className="h-2 bg-black rounded-full overflow-hidden">
            <LinearGradient
              colors={['#0d9488', '#2dd4bf']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${verificationRate}%`, height: '100%', borderRadius: 9999 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }} 
      className="items-center w-[22%]"
    >
      <View className="w-14 h-14 bg-zinc-900 rounded-2xl items-center justify-center border border-zinc-800 mb-2 shadow-sm shadow-black">
        <Feather name={icon} size={22} color="#9ca3af" />
      </View>
      <Text className="text-zinc-400 text-xs font-medium text-center">{label}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <View className="bg-zinc-900/80 p-5 rounded-3xl w-[48%] mb-4 border border-zinc-800/80 backdrop-blur-md">
      <View className="flex-row justify-between items-start mb-3">
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: color + '15' }}>
          <Feather name={icon} size={20} color={color} />
        </View>
      </View>
      <Text className="text-4xl font-black text-white mb-1 tracking-tight">{value}</Text>
      <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{title}</Text>
    </View>
  );
}
