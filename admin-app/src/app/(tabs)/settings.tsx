import { View, Text, TouchableOpacity, Switch, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../_layout';
import api from '../../api/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Maintenance Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [estimatedEndTime, setEstimatedEndTime] = useState('');
  const [allowAdminBypass, setAllowAdminBypass] = useState(true);
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  // Password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Biometrics
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (hasHardware && isEnrolled) {
      setBiometricSupported(true);
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      setBiometricEnabled(enabled === 'true');
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (enabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm biometric authentication',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        await AsyncStorage.setItem('biometric_enabled', 'true');
        setBiometricEnabled(true);
        Alert.alert("Success", "Biometric unlock enabled.");
      } else {
        setBiometricEnabled(false);
      }
    } else {
      await AsyncStorage.setItem('biometric_enabled', 'false');
      setBiometricEnabled(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings');
      if (data.emailNotificationsEnabled !== undefined) setNotificationsEnabled(data.emailNotificationsEnabled);
      if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
      if (data.maintenanceTitle !== undefined) setMaintenanceTitle(data.maintenanceTitle);
      if (data.maintenanceMessage !== undefined) setMaintenanceMessage(data.maintenanceMessage);
      if (data.estimatedEndTime !== undefined) setEstimatedEndTime(data.estimatedEndTime);
      if (data.allowAdminBypass !== undefined) setAllowAdminBypass(data.allowAdminBypass);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(enabled);
    setIsUpdating(true);
    try {
      await api.put('/admin/settings', { emailNotificationsEnabled: enabled });
    } catch (error) {
      setNotificationsEnabled(!enabled); // Revert UI on failure
      Alert.alert("Error", "Failed to update settings.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleMaintenanceMode = async (enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const previousState = maintenanceMode;
    setMaintenanceMode(enabled);
    setIsUpdating(true);
    try {
      await api.put('/admin/settings', { 
        maintenanceMode: enabled,
        maintenanceTitle,
        maintenanceMessage,
        estimatedEndTime,
        allowAdminBypass
      });
      Alert.alert(
        enabled ? "Maintenance Activated" : "Maintenance Deactivated",
        enabled ? "The client app is now in maintenance mode." : "The client app is now live."
      );
    } catch (error) {
      setMaintenanceMode(previousState);
      Alert.alert("Error", "Failed to toggle maintenance mode.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveMaintenanceDetails = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSavingMaintenance(true);
    try {
      await api.put('/admin/settings', {
        maintenanceMode,
        maintenanceTitle,
        maintenanceMessage,
        estimatedEndTime,
        allowAdminBypass
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Maintenance details saved successfully.");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save maintenance details.");
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  const handleChangePassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!oldPassword || !newPassword || !confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: oldPassword,
        newPassword
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Password updated successfully");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of the admin panel?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <LinearGradient
        colors={['rgba(20,184,166,0.1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
        className="absolute w-full h-full"
      />
      
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <Text className="text-4xl font-extrabold text-white mb-2 tracking-tight">Settings</Text>
          <Text className="text-zinc-400 mb-8 font-medium">Manage your app preferences and configuration</Text>
        </Animated.View>

        {/* Profile Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} className="mb-8">
          <Text className="text-white/60 font-semibold mb-3 ml-1 uppercase tracking-wider text-xs">Profile</Text>
          <View className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
            <View className="p-5 flex-row items-center border-b border-white/5">
              <LinearGradient
                colors={['#3b82f6', '#1e3a8a']}
                className="w-14 h-14 rounded-full items-center justify-center mr-4"
              >
                <MaterialIcons name="admin-panel-settings" size={32} color="#ffffff" />
              </LinearGradient>
              <View>
                <Text className="text-xl font-bold text-white mb-1">Admin User</Text>
                <Text className="text-blue-400/80 font-medium">admin@vora.com</Text>
              </View>
            </View>
            
            <View className="p-5 flex-row justify-between items-center bg-white/5">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-zinc-800/80 items-center justify-center mr-3">
                  <Feather name="bell" size={20} color="#9ca3af" />
                </View>
                <Text className="text-zinc-200 font-semibold text-base">Email Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                disabled={isUpdating}
                trackColor={{ false: '#3f3f46', true: '#14b8a6' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </Animated.View>

        {/* Maintenance Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} className="mb-8">
          <Text className="text-white/60 font-semibold mb-3 ml-1 uppercase tracking-wider text-xs">System Control</Text>
          <View className={`rounded-3xl overflow-hidden border ${maintenanceMode ? 'border-amber-500/30 bg-amber-900/10' : 'border-white/10 bg-white/5'}`}>
            <View className="p-5 flex-row justify-between items-center border-b border-white/5">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${maintenanceMode ? 'bg-amber-500/20' : 'bg-zinc-800/80'}`}>
                  <Ionicons name="build-outline" size={20} color={maintenanceMode ? '#fbbf24' : '#9ca3af'} />
                </View>
                <Text className={`font-semibold text-base ${maintenanceMode ? 'text-amber-400' : 'text-zinc-200'}`}>
                  Maintenance Mode
                </Text>
              </View>
              <Switch
                value={maintenanceMode}
                onValueChange={handleToggleMaintenanceMode}
                disabled={isUpdating}
                trackColor={{ false: '#3f3f46', true: '#f59e0b' }}
                thumbColor="#ffffff"
              />
            </View>

            {maintenanceMode && (
              <Animated.View entering={FadeInDown.duration(300)} className="p-5 space-y-5">
                <View>
                  <Text className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Title</Text>
                  <TextInput
                    value={maintenanceTitle}
                    onChangeText={setMaintenanceTitle}
                    placeholder="e.g. System Under Maintenance"
                    placeholderTextColor="#52525b"
                    className="bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium"
                  />
                </View>
                
                <View className="mt-4">
                  <Text className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Message</Text>
                  <TextInput
                    value={maintenanceMessage}
                    onChangeText={setMaintenanceMessage}
                    placeholder="Message for voters..."
                    placeholderTextColor="#52525b"
                    multiline
                    numberOfLines={3}
                    className="bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium h-28"
                    textAlignVertical="top"
                  />
                </View>

                <View className="mt-4">
                  <Text className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Estimated End Time</Text>
                  <TextInput
                    value={estimatedEndTime}
                    onChangeText={setEstimatedEndTime}
                    placeholder="e.g. 2h, 30m, 5:30 PM"
                    placeholderTextColor="#52525b"
                    className="bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium"
                  />
                </View>

                <View className="mt-4 flex-row justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10">
                  <View>
                    <Text className="font-semibold text-zinc-200">Allow Admin Bypass</Text>
                    <Text className="text-xs text-zinc-500 mt-1">Admins can still browse</Text>
                  </View>
                  <Switch
                    value={allowAdminBypass}
                    onValueChange={setAllowAdminBypass}
                    trackColor={{ false: '#3f3f46', true: '#10b981' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveMaintenanceDetails}
                  disabled={isSavingMaintenance}
                  className="mt-6 bg-amber-500 py-4 rounded-xl items-center shadow-lg shadow-amber-500/20"
                >
                  {isSavingMaintenance ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text className="text-amber-950 font-bold text-base">Save Details</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Security Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(400).springify()} className="mb-8">
          <Text className="text-white/60 font-semibold mb-3 ml-1 uppercase tracking-wider text-xs">Security</Text>
          <View className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
            {biometricSupported && (
              <View className="p-5 flex-row justify-between items-center border-b border-white/5">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                    <Feather name="shield" size={20} color="#10b981" />
                  </View>
                  <Text className="text-zinc-200 font-semibold text-base">Biometric Unlock</Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  disabled={isUpdating}
                  trackColor={{ false: '#3f3f46', true: '#10b981' }}
                  thumbColor="#ffffff"
                />
              </View>
            )}

            <View className="p-5 border-b border-white/5 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-rose-500/20 items-center justify-center mr-3">
                <Feather name="lock" size={20} color="#f43f5e" />
              </View>
              <Text className="font-bold text-base text-white">Change Password</Text>
            </View>
            <View className="p-5 space-y-4">
              <View>
                <Text className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Current Password</Text>
                <TextInput
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#52525b"
                  className="bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium"
                />
              </View>
              <View className="mt-4">
                <Text className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">New Password</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#52525b"
                  className="bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium"
                />
              </View>
              <View className="mt-4">
                <Text className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Confirm New Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#52525b"
                  className="bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium"
                />
              </View>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={isChangingPassword}
                className="mt-6 bg-rose-600 py-4 rounded-xl items-center shadow-lg shadow-rose-600/20"
              >
                {isChangingPassword ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-red-500/10 py-4 rounded-2xl flex-row items-center justify-center border border-red-500/20 mb-6"
          >
            <Feather name="log-out" size={20} color="#f87171" />
            <Text className="text-red-400 font-bold ml-2 text-base">Log Out</Text>
          </TouchableOpacity>
          
          <View className="items-center opacity-40">
            <Text className="text-white text-xs font-medium tracking-widest">VORA ADMIN</Text>
            <Text className="text-white/50 text-[10px] mt-1">Version 1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
