import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { globalSignOut } from '../utils/authActions';

// In React Native, localhost refers to the phone itself.
// You must replace this with your computer's local IP address (e.g., 192.168.1.5) for mobile testing.
// For web testing, localhost works perfectly.
const defaultApiUrl = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://10.17.224.92:5000/api';
const API_URL = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies (though token is preferred in RN)
});

// Request interceptor for Bearer token fallback
api.interceptors.request.use(
    async (config) => {
        // React Native uses AsyncStorage instead of localStorage
        const token = await AsyncStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 (Unauthorized) - Refresh Token Flow
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh') && !originalRequest.url?.includes('/auth/login')) {
            originalRequest._retry = true;

            try {
                await api.post('/auth/refresh');
                return api(originalRequest);
            } catch (refreshError: any) {
                // If refresh fails, log the user out properly using AuthContext
                // This updates the global state and redirects to login cleanly
                if (refreshError.response && !originalRequest.url?.includes('/auth/profile')) {
                    globalSignOut();
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
