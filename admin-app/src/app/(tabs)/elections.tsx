import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, RefreshControl, Image, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import api from '../../api/api';
import Animated, { FadeInDown } from 'react-native-reanimated';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Election = {
  _id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
  totalVotes?: number;
};

type Candidate = {
  _id: string;
  name: string;
  party?: string;
  manifesto?: string;
  imageUrl?: string;
  voteCount?: number;
};

type Section = 'election' | 'candidates' | 'results';

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function ElectionsScreen() {
  const params = useLocalSearchParams();
  const [section, setSection] = useState<Section>((params.section as Section) || 'election');

  useEffect(() => {
    if (params.section) {
      setSection(params.section as Section);
    }
  }, [params.section]);

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <LinearGradient
        colors={['rgba(20,184,166,0.1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
        className="absolute w-full h-full"
      />
      
      {/* Header + Section Tabs */}
      <View className="px-5 pt-8 pb-4">
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <Text className="text-4xl font-extrabold tracking-tight text-white mb-6">Elections</Text>
        </Animated.View>
        <View className="flex-row bg-white/5 rounded-2xl p-1.5 shadow-sm border border-white/10 backdrop-blur-md">
          {([
            { key: 'election',   label: 'Election'   },
            { key: 'candidates', label: 'Candidates' },
            { key: 'results',    label: 'Results'    },
          ] as { key: Section; label: string }[]).map(s => (
            <Pressable
              key={s.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSection(s.key);
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: section === s.key ? '#0d9488' : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                letterSpacing: 0.5,
                color: section === s.key ? '#ffffff' : '#9ca3af'
              }}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {section === 'election'   && <ElectionSection />}
      {section === 'candidates' && <CandidatesSection />}
      {section === 'results'    && <ResultsSection />}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Shared Input component
// ─────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, multiline }: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider ml-1">{label}</Text>
      <TextInput
        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium focus:border-teal-500"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#52525b"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'auto'}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// 1. Election Config Section
// ─────────────────────────────────────────────
function ElectionSection() {
  const [config, setConfig] = useState<Election>({ title: '', description: '', startDate: '', endDate: '' });
  const [history, setHistory] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [configRes, historyRes] = await Promise.all([
        api.get('/admin/election').catch(() => ({ data: null })),
        api.get('/admin/elections').catch(() => ({ data: [] })),
      ]);
      if (configRes.data) setConfig(configRes.data);
      setHistory(historyRes.data || []);
    } catch {}
    finally { setIsLoading(false); setIsRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => { 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true); 
    fetchAll(); 
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!config.title || !config.startDate || !config.endDate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Validation', 'Title, start date and end date are required.\nDate format: YYYY-MM-DD');
      return;
    }
    setIsSaving(true);
    try {
      await api.put('/admin/election', config);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Election configuration updated.');
      fetchAll();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err.response?.data?.message || 'Failed to save.');
    } finally { setIsSaving(false); }
  };

  const danger = (title: string, msg: string, endpoint: string, method: 'post' | 'delete' = 'post', body?: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(title, msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: title, style: 'destructive', onPress: async () => {
        try {
          if (method === 'post') await api.post(endpoint, body);
          fetchAll();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Done', `${title} completed.`);
        } catch (err: any) { 
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', err.response?.data?.message || 'Failed.'); 
        }
      }},
    ]);
  };

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set';
  const status = config.status?.toLowerCase() || 'upcoming';

  if (isLoading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0d9488" /></View>;

  return (
    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>

      {/* Status Banner */}
      <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} className="bg-white/5 rounded-3xl p-5 mb-5 border border-white/10 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-extrabold text-xl">Current Election</Text>
          <View className={`px-4 py-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500/20' : status === 'completed' ? 'bg-zinc-800' : 'bg-teal-500/20'}`}>
            <Text className={`text-xs font-bold tracking-wider uppercase ${status === 'active' ? 'text-emerald-400' : status === 'completed' ? 'text-zinc-400' : 'text-teal-400'}`}>{status}</Text>
          </View>
        </View>
        <View className="flex-row justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
          <View>
            <Text className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Start Date</Text>
            <Text className="text-zinc-200 text-sm font-bold">{fmt(config.startDate)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">End Date</Text>
            <Text className="text-zinc-200 text-sm font-bold">{fmt(config.endDate)}</Text>
          </View>
        </View>
        {config.totalVotes != null && (
          <View className="mt-4 flex-row items-center">
            <MaterialIcons name="how-to-vote" size={16} color="#9ca3af" />
            <Text className="text-zinc-400 text-sm font-medium ml-2">{config.totalVotes} total votes cast</Text>
          </View>
        )}
      </Animated.View>

      {/* Edit Form */}
      <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} className="bg-white/5 rounded-3xl p-5 mb-5 border border-white/10 shadow-sm">
        <Text className="text-white font-extrabold text-lg mb-5">Edit Configuration</Text>
        <Field label="Title *" value={config.title} onChangeText={t => setConfig(p => ({ ...p, title: t }))} placeholder="Election title" />
        <Field label="Description" value={config.description} onChangeText={t => setConfig(p => ({ ...p, description: t }))} placeholder="Brief description" multiline />
        <Field label="Start Date * (YYYY-MM-DD)" value={config.startDate ? config.startDate.slice(0, 10) : ''} onChangeText={t => setConfig(p => ({ ...p, startDate: t }))} placeholder="2025-01-01" />
        <Field label="End Date * (YYYY-MM-DD)" value={config.endDate ? config.endDate.slice(0, 10) : ''} onChangeText={t => setConfig(p => ({ ...p, endDate: t }))} placeholder="2025-12-31" />
        <TouchableOpacity onPress={handleSave} disabled={isSaving} className={`py-4 rounded-xl items-center mt-4 shadow-lg ${isSaving ? 'bg-teal-500/50' : 'bg-teal-600 shadow-teal-600/30'}`}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base tracking-wide">Save Configuration</Text>}
        </TouchableOpacity>
      </Animated.View>

      {/* Danger Zone */}
      <Animated.View entering={FadeInDown.delay(300).duration(400).springify()} className="bg-white/5 rounded-3xl p-5 mb-5 border border-red-500/20 shadow-sm">
        <Text className="text-red-400 font-extrabold text-lg mb-4 flex-row items-center">
          <MaterialIcons name="warning-amber" size={20} /> Danger Zone
        </Text>
        <TouchableOpacity onPress={() => danger('Emergency Stop', 'Stop the election immediately?', '/admin/election/stop')} className="bg-red-500/10 border border-red-500/30 py-4 rounded-xl items-center mb-3 flex-row justify-center">
          <MaterialIcons name="stop-circle" size={20} color="#ef4444" /><Text className="text-red-400 font-bold ml-2">Emergency Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => danger('Start New Election', 'This will archive the current election. Continue?', '/admin/election/new', 'post', config)} className="bg-amber-500/10 border border-amber-500/30 py-4 rounded-xl items-center mb-3 flex-row justify-center">
          <MaterialIcons name="add-circle-outline" size={20} color="#f59e0b" /><Text className="text-amber-500 font-bold ml-2">Start New Election</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => danger('Reset All Data', 'Reset ALL votes? This CANNOT be undone!', '/admin/election/reset')} className="bg-red-600/80 border border-red-500 py-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-red-600/20">
          <MaterialIcons name="refresh" size={20} color="#fff" /><Text className="text-white font-bold ml-2">Reset All Data</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* History */}
      {history.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400).duration(400).springify()} className="bg-white/5 rounded-3xl p-5 mb-8 border border-white/10 shadow-sm">
          <Text className="text-white font-extrabold text-lg mb-4">Election History</Text>
          {history.map((e, i) => (
            <View key={e._id || i} className={`py-4 ${i < history.length - 1 ? 'border-b border-white/5' : ''}`}>
              <Text className="text-zinc-200 font-bold text-base" numberOfLines={1}>{e.title}</Text>
              <Text className="text-zinc-500 text-sm mt-1 font-medium">{fmt(e.startDate)} → {fmt(e.endDate)}</Text>
              {e.totalVotes != null && (
                <View className="flex-row items-center mt-2">
                  <MaterialIcons name="check-circle" size={14} color="#10b981" />
                  <Text className="text-zinc-400 text-xs ml-1 font-medium">{e.totalVotes} votes cast</Text>
                </View>
              )}
            </View>
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// 2. Candidates Section
// ─────────────────────────────────────────────
function CandidatesSection() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [manifesto, setManifesto] = useState('');

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await api.get('/candidates');
      setCandidates(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const onRefresh = () => { setIsRefreshing(true); fetchCandidates(); };

  const handleAdd = async () => {
    if (!name) return Alert.alert('Error', 'Name is required');
    try {
      await api.post('/candidates', { name, party, manifesto });
      setName(''); setParty(''); setManifesto('');
      setIsAdding(false);
      fetchCandidates();
      Alert.alert('Success', 'Candidate added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this candidate?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/candidates/${id}`);
          fetchCandidates();
        } catch (err: any) {
          Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
        }
      }}
    ]);
  };

  if (isLoading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0d9488" /></View>;

  return (
    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>
      {isAdding ? (
        <Animated.View entering={FadeInDown.duration(400).springify()} className="bg-white/5 rounded-3xl p-5 mb-5 border border-white/10 shadow-sm backdrop-blur-md">
          <Text className="text-white font-extrabold text-lg mb-5">Add Candidate</Text>
          <Field label="Name *" value={name} onChangeText={setName} placeholder="Candidate name" />
          <Field label="Party" value={party} onChangeText={setParty} placeholder="Party name" />
          <Field label="Manifesto" value={manifesto} onChangeText={setManifesto} placeholder="Brief manifesto" multiline />
          <View className="flex-row mt-4">
            <TouchableOpacity onPress={() => setIsAdding(false)} className="flex-1 bg-white/10 py-4 rounded-xl items-center mr-2">
              <Text className="text-white font-bold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd} className="flex-1 bg-teal-600 py-4 rounded-xl items-center ml-2 shadow-lg shadow-teal-600/30">
              <Text className="text-white font-bold text-base">Add Candidate</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <TouchableOpacity onPress={() => setIsAdding(true)} className="bg-teal-500/10 border border-teal-500/30 py-4 rounded-xl items-center mb-6 flex-row justify-center shadow-sm">
            <MaterialIcons name="person-add" size={20} color="#2dd4bf" />
            <Text className="text-teal-400 font-bold ml-2 text-base">Add New Candidate</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {candidates.length === 0 && !isAdding && (
        <View className="items-center justify-center py-10">
          <Text className="text-zinc-500 font-medium">No candidates found.</Text>
        </View>
      )}

      {candidates.map((c, i) => (
        <Animated.View entering={FadeInDown.delay(100 + (i * 100)).duration(400).springify()} key={c._id} className="bg-white/5 rounded-3xl p-5 mb-4 border border-white/10 flex-row items-center shadow-sm">
          <View className="w-12 h-12 rounded-full bg-black/40 border border-white/5 items-center justify-center mr-4">
            <MaterialIcons name="person" size={24} color="#9ca3af" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">{c.name}</Text>
            {c.party ? <Text className="text-teal-400 font-semibold text-xs mt-0.5">{c.party}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => handleDelete(c._id)} className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center border border-red-500/20 ml-2">
            <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </Animated.View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// 3. Results Section
// ─────────────────────────────────────────────
function ResultsSection() {
  const [results, setResults]   = useState<{ candidate: Candidate; votes: number }[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [published, setPublished]   = useState(false);
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      const [resultsRes, electionRes] = await Promise.all([
        api.get('/admin/results'),
        api.get('/admin/election').catch(() => ({ data: {} })),
      ]);
      setResults(resultsRes.data?.results || []);
      setTotalVotes(resultsRes.data?.totalVotes || 0);
      setPublished(!!electionRes.data?.resultsPublished);
    } catch {}
    finally { setIsLoading(false); setIsRefreshing(false); }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const onRefresh = () => { setIsRefreshing(true); fetchResults(); };

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    try {
      await api.put('/admin/election/publish');
      setPublished(p => !p);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to toggle publish.');
    } finally { setIsTogglingPublish(false); }
  };

  const sorted = [...results].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const colors = ['#0d9488', '#2dd4bf', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']; // updated colors

  if (isLoading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0d9488" /></View>;

  return (
    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0d9488" />}>
      {/* Publish Toggle */}
      <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} className="bg-white/5 rounded-3xl p-5 mb-5 flex-row items-center justify-between border border-white/10 shadow-sm">
        <View className="flex-1 mr-4">
          <Text className="text-white font-extrabold text-lg">Public Results</Text>
          <Text className="text-zinc-400 text-sm font-medium mt-0.5">{published ? 'Currently visible to all voters' : 'Hidden from public view'}</Text>
        </View>
        <TouchableOpacity
          onPress={handleTogglePublish}
          disabled={isTogglingPublish}
          className={`px-5 py-3 rounded-xl shadow-sm ${published ? 'bg-white/10 border border-white/20' : 'bg-teal-600 shadow-teal-600/30'}`}
        >
          {isTogglingPublish ? <ActivityIndicator size="small" color={published ? '#9ca3af' : '#fff'} /> : (
            <Text className={`font-bold text-sm tracking-wide ${published ? 'text-zinc-300' : 'text-white'}`}>
              {published ? 'Unpublish' : 'Publish'}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Total */}
      <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}>
        <LinearGradient
          colors={['#0f766e', '#064e3b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-3xl p-6 mb-6 flex-row items-center justify-between shadow-lg shadow-teal-900/50"
        >
          <View>
            <Text className="text-teal-200/80 font-semibold text-sm uppercase tracking-wider mb-1">Total Votes Cast</Text>
            <Text className="text-white font-extrabold text-4xl">{totalVotes}</Text>
          </View>
          <View className="w-14 h-14 bg-black/20 rounded-full items-center justify-center">
            <MaterialIcons name="ballot" size={28} color="#fff" />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Results */}
      <Text className="text-white font-extrabold text-xl mb-4 ml-1">Standings</Text>
      
      {sorted.length === 0 ? (
        <View className="items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <View className="w-20 h-20 bg-black/40 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="insert-chart-outlined" size={36} color="#52525b" />
          </View>
          <Text className="text-zinc-500 font-medium text-center">No results yet.{'\n'}Votes will appear here once cast.</Text>
        </View>
      ) : sorted.map((r, i) => {
        const pct   = totalVotes > 0 ? Math.round(((r.votes || 0) / totalVotes) * 100) : 0;
        const c     = r;
        const color = colors[i % colors.length];
        return (
          <Animated.View entering={FadeInDown.delay(300 + (i * 100)).duration(400).springify()} key={c._id || i} className="bg-white/5 rounded-3xl p-5 mb-4 border border-white/10 shadow-sm relative overflow-hidden">
            {i === 0 && totalVotes > 0 && (
              <View className="absolute top-0 right-0 bg-amber-500/20 px-3 py-1 rounded-bl-xl z-10 border-l border-b border-amber-500/30">
                <Text className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">👑 Leading</Text>
              </View>
            )}
            
            <View className="flex-row items-center mb-4 mt-1">
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 border" style={{ backgroundColor: color + '15', borderColor: color + '30' }}>
                <Text className="font-extrabold text-base" style={{ color }}>#{i + 1}</Text>
              </View>
              {c.imageUrl ? (
                <Image source={{ uri: c.imageUrl }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }} />
              ) : (
                <View className="w-11 h-11 rounded-full bg-black/40 items-center justify-center mr-3 border border-white/5">
                  <MaterialIcons name="person" size={22} color="#9ca3af" />
                </View>
              )}
              <View className="flex-1">
                <Text className="font-extrabold text-white text-base">{c.name || 'Unknown'}</Text>
                {c.party ? <Text className="text-zinc-400 text-xs font-medium mt-0.5">{c.party}</Text> : null}
              </View>
              <View className="items-end pl-2">
                <Text className="font-extrabold text-white text-xl">{r.votes || 0}</Text>
                <Text className="text-zinc-500 text-xs font-medium">{pct}%</Text>
              </View>
            </View>
            <View className="h-2.5 bg-black/60 rounded-full overflow-hidden">
              <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </View>
          </Animated.View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
