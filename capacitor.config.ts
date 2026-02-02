import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vora.app',
  appName: 'VORA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
