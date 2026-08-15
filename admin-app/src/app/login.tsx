import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { useAuth } from './_layout';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Assuming your backend uses /auth/admin/login or similar
      const res = await api.post('/auth/login', { email, password, role: 'admin' });
      
      if (res.data && res.data.token) {
        await AsyncStorage.setItem('admin_token', res.data.token);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Update global auth state → layout auto-redirects to /(tabs)
        signIn(res.data.token);
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = err.response?.data?.message || 'Something went wrong. Please check your credentials and try again.';
      Alert.alert('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-black">
      <View className="mb-10 items-center">
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={{ width: 120, height: 120, marginBottom: 16 }} 
          contentFit="contain" 
        />
        <Text className="text-4xl font-bold text-white mb-2">VORA Admin</Text>
        <Text className="text-zinc-400 text-center">
          Sign in to access the decentralized election control panel.
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-zinc-300 font-medium mb-1">Email Address</Text>
          <TextInput
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white"
            placeholder="admin@vora.com"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text className="text-zinc-300 font-medium mb-1 mt-4">Password</Text>
          <TextInput
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white"
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl items-center justify-center mt-8 ${isLoading ? 'bg-teal-700' : 'bg-teal-600'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
