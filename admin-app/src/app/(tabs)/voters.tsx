import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/api';

type Voter = {
  _id: string;
  name: string;
  email: string;
  nationalId: string;
  imageUrl?: string;
  idCardUrl?: string;
  hasVoted?: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
};

export default function VotersScreen() {
  const [allVoters, setAllVoters] = useState<Voter[]>([]);
  const [filtered, setFiltered] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchVoters = useCallback(async () => {
    try {
      const res = await api.get('/admin/voters');
      setAllVoters(res.data || []);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to fetch voters');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  useEffect(() => {
    let list = [...allVoters];
    if (activeFilter !== 'all') {
      list = list.filter(v => v.verificationStatus === activeFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(v => 
        v.name.toLowerCase().includes(s) || 
        v.email.toLowerCase().includes(s) || 
        (v.nationalId && v.nationalId.toLowerCase().includes(s))
      );
    }
    setFiltered(list);
  }, [allVoters, activeFilter, search]);

  const onRefresh = () => { 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true); 
    fetchVoters(); 
  };

  const handleVerify = async (id: string, action: 'approve' | 'reject') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const label = action === 'approve' ? 'Approve' : 'Reject';
    Alert.alert(`${label} Voter`, `Are you sure you want to ${label.toLowerCase()} this voter?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: label, 
        style: action === 'approve' ? 'default' : 'destructive',
        onPress: async () => {
          setActionLoading(id);
          try {
            await api.put(`/admin/voters/${id}/verify`, { action });
            setAllVoters(prev => prev.map(v =>
              v._id === id ? { ...v, verificationStatus: action === 'approve' ? 'verified' : 'rejected' } : v
            ));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', err.response?.data?.message || `Failed to ${action} voter.`);
          } finally {
            setActionLoading(null);
          }
        }
      }
    ]);
  };

  const handleDelete = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Voter', `Permanently delete ${name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(id);
          try {
            await api.delete(`/admin/voters/${id}`);
            setAllVoters(prev => prev.filter(v => v._id !== id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete voter.');
          } finally {
            setActionLoading(null);
          }
        }
      }
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#0d9488" />
      </SafeAreaView>
    );
  }

  const renderFilterButton = (id: typeof activeFilter, label: string) => {
    const isActive = activeFilter === id;
    if (isActive) {
      return (
        <TouchableOpacity
          key={id}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveFilter(id);
          }}
          className="mr-3 shadow-lg shadow-teal-900/50"
        >
          <LinearGradient
            colors={['#0f766e', '#115e59']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-4 py-2 rounded-full border border-teal-600"
          >
            <Text className="text-white font-bold">{label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={id}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActiveFilter(id);
        }}
        className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900 mr-3"
      >
        <Text className="text-zinc-400 font-medium">{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <View className="px-4 py-6 border-b border-zinc-900">
        <Text className="text-3xl font-bold text-white mb-4">Voter Management</Text>
        
        {/* Search */}
        <View className="flex-row items-center bg-zinc-900/80 backdrop-blur-md rounded-2xl px-4 py-3 mb-4 border border-zinc-800">
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, email, or ID..."
            placeholderTextColor="#6b7280"
            className="flex-1 ml-3 text-white text-base"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {renderFilterButton('all', 'All Voters')}
          {renderFilterButton('pending', 'Pending')}
          {renderFilterButton('verified', 'Verified')}
          {renderFilterButton('rejected', 'Rejected')}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0d9488" />}
      >
        {filtered.length === 0 ? (
          <View className="items-center justify-center py-10 mt-10">
            <Feather name="users" size={48} color="#27272a" />
            <Text className="text-zinc-500 font-medium mt-4 text-lg">No voters found.</Text>
          </View>
        ) : (
          filtered.map(voter => (
            <View key={voter._id} className="bg-zinc-900/80 backdrop-blur-md rounded-3xl p-5 mb-4 border border-zinc-800/80 shadow-sm shadow-black">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center flex-1">
                  
                  {/* Smaller Avatar Image or Initial */}
                  <View className="w-14 h-14 bg-black rounded-full items-center justify-center border border-zinc-800 mr-3 overflow-hidden">
                    {voter.imageUrl || voter.idCardUrl ? (
                      <Image 
                        source={{ uri: voter.imageUrl || voter.idCardUrl }} 
                        style={{ width: '100%', height: '100%' }} 
                        contentFit="cover" 
                      />
                    ) : (
                      <Text className="text-xl font-black text-zinc-300">{voter.name.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>

                  <View className="flex-1 pr-2">
                    <Text className="text-white font-bold text-lg mb-1">{voter.name}</Text>
                    <Text className="text-zinc-500 text-xs font-medium">{voter.email}</Text>
                    
                    {/* Voted Indication */}
                    <View className="mt-2 flex-row items-center">
                      <Feather name={voter.hasVoted ? "check-circle" : "circle"} size={12} color={voter.hasVoted ? "#10b981" : "#6b7280"} />
                      <Text className={`ml-1 text-xs font-bold ${voter.hasVoted ? "text-emerald-500" : "text-zinc-500"}`}>
                        {voter.hasVoted ? "HAS VOTED" : "NOT VOTED"}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Verification Status */}
                <View className={`px-3 py-1 rounded-full border ${
                  voter.verificationStatus === 'verified' ? 'bg-emerald-900/20 border-emerald-900/50' : 
                  voter.verificationStatus === 'rejected' ? 'bg-red-900/20 border-red-900/50' : 
                  'bg-amber-900/20 border-amber-900/50'
                }`}>
                  <Text className={`text-xs font-bold uppercase ${
                    voter.verificationStatus === 'verified' ? 'text-emerald-500' : 
                    voter.verificationStatus === 'rejected' ? 'text-red-500' : 
                    'text-amber-500'
                  }`}>
                    {voter.verificationStatus}
                  </Text>
                </View>
              </View>

              <View className="flex-row space-x-3 mt-2 border-t border-zinc-800 pt-4">
                {voter.verificationStatus === 'pending' && (
                  <>
                    <TouchableOpacity
                      onPress={() => handleVerify(voter._id, 'approve')}
                      disabled={actionLoading === voter._id}
                      className="flex-1 mr-2"
                    >
                      <LinearGradient
                        colors={['#059669', '#047857']}
                        className="py-3 rounded-xl items-center flex-row justify-center"
                      >
                        <Feather name="check-circle" size={16} color="white" />
                        <Text className="text-white font-bold ml-2">Approve</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleVerify(voter._id, 'reject')}
                      disabled={actionLoading === voter._id}
                      className="flex-1 bg-red-900/40 border border-red-900/50 py-3 rounded-xl items-center flex-row justify-center"
                    >
                      <Feather name="x-circle" size={16} color="#fca5a5" />
                      <Text className="text-red-400 font-bold ml-2">Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  onPress={() => handleDelete(voter._id, voter.name)}
                  disabled={actionLoading === voter._id}
                  className="bg-zinc-800 w-12 items-center justify-center rounded-xl"
                >
                  {actionLoading === voter._id ? (
                    <ActivityIndicator size="small" color="#9ca3af" />
                  ) : (
                    <Feather name="trash-2" size={18} color="#ef4444" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
